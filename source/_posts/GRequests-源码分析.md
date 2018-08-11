---
title: GRequests 源码分析
comments: true
mathjax: false
tags:
  - Python
  - HTTP
  - Gevent
  - 协程
categories: 编程
abbrlink: 39899
date: 2018-08-11 22:07:25
---

[GRequests](https://github.com/kennethreitz/grequests) 将 Requests 和 Gevent 结合起来实现了异步请求。

<!--more-->

在 Python3.4 以上的版本可以使用 asyncio，直接内置的异步 IO 的支持的标准库。但是在 Python2 上只能使用 Gevent 这种 tricky 的方式来实现异步 IO。

## Gevent 介绍

Gevent 实现协程的基本思想是：遇到 IO 操作时，会自动切换到其他 Greenlet，等到 IO 操作完成时，再切换回来继续执行。有了自动切换协程，就保证总会有 Greenlet 在运行，而不是等待 IO 中。

## 补丁

代码开始，首先引入 Gevent 库，并进行补丁操作。

```python
try:
    import gevent
    from gevent import monkey as curious_george
    from gevent.pool import Pool
except ImportError:
    raise RuntimeError('Gevent is required for grequests.')

# Monkey-patch.
curious_george.patch_all(thread=False, select=False)
```

应用 Gevent 的话需要使用「猴子补丁」的方式，Gevent 可以修改标准库中大部分的阻塞式系统调用，比如 socket、ssl、threading 和 select 等模块。打完补丁之后，Python 标准库中的模块或函数就改成 Gevent 中具有协程的协作式对象。

## 异步的 Request

```python
class AsyncRequest(object):
    """ Asynchronous request.
    Accept same parameters as ``Session.request`` and some additional:
    :param session: Session which will do request
    :param callback: Callback called on response.
                     Same as passing ``hooks={'response': callback}``
    """
    def __init__(self, method, url, **kwargs):
        #: Request method
        self.method = method
        #: URL to request
        self.url = url
        #: Associated ``Session``
        self.session = kwargs.pop('session', None)
        if self.session is None:
            self.session = Session()

        callback = kwargs.pop('callback', None)
        if callback:
            kwargs['hooks'] = {'response': callback}

        #: The rest arguments for ``Session.request``
        self.kwargs = kwargs
        #: Resulting ``Response``
        self.response = None

    def send(self, **kwargs):
        """
        Prepares request based on parameter passed to constructor and optional ``kwargs```.
        Then sends request and saves response to :attr:`response`
        :returns: ``Response``
        """
        merged_kwargs = {}
        merged_kwargs.update(self.kwargs)
        merged_kwargs.update(kwargs)
        try:
            self.response = self.session.request(self.method,
                                                self.url, **merged_kwargs)
        except Exception as e:
            self.exception = e
            self.traceback = traceback.format_exc()
        return self

```

从名字就可以看出来，AsyncRequest 对象就是个异步的 Request。对普通的 Request 对象进行进一步的封装。

## 处理池

```python
def send(r, pool=None, stream=False):
    """Sends the request object using the specified pool. If a pool isn't
    specified this method blocks. Pools are useful because you can specify size
    and can hence limit concurrency."""
    if pool is not None:
        return pool.spawn(r.send, stream=stream)

    return gevent.spawn(r.send, stream=stream)
```

这里主要是用来创建 Greenlet 处理池，Pool 是 Group 的子类，主要是提供了限制 Greenlet 的数目。如果达到了限制的数目，就阻塞程序的运行。

## 偏函数

简单来说就是把某个参数固定而生成新的函数。

```python
# Shortcuts for creating AsyncRequest with appropriate HTTP method
get = partial(AsyncRequest, 'GET')
options = partial(AsyncRequest, 'OPTIONS')
head = partial(AsyncRequest, 'HEAD')
post = partial(AsyncRequest, 'POST')
put = partial(AsyncRequest, 'PUT')
patch = partial(AsyncRequest, 'PATCH')
delete = partial(AsyncRequest, 'DELETE')
```

## map 函数

```python
def map(requests, stream=False, size=None, exception_handler=None, gtimeout=None):
    """Concurrently converts a list of Requests to Responses.
    :param requests: a collection of Request objects.
    :param stream: If True, the content will not be downloaded immediately.
    :param size: Specifies the number of requests to make at a time. If None, no throttling occurs.
    :param exception_handler: Callback function, called when exception occured. Params: Request, Exception
    :param gtimeout: Gevent joinall timeout in seconds. (Note: unrelated to requests timeout)
    """

    requests = list(requests)

    pool = Pool(size) if size else None
    jobs = [send(r, pool, stream=stream) for r in requests]
    gevent.joinall(jobs, timeout=gtimeout)

    ret = []

    for request in requests:
        if request.response is not None:
            ret.append(request.response)
        elif exception_handler and hasattr(request, 'exception'):
            ret.append(exception_handler(request, request.exception))
        else:
            ret.append(None)

    return ret
```

这个函数比较关键。

首先分析一下传入的参数。requests 不用说，就是一堆 request 对象。stream 也和 Request 库中的 stream 参数一样，设定了该参数，响应体不会立即被下载，直到访问 Response.content 属性时才会下载。size 是用来限制 Greenlet 处理池的大小，如果为 None 则不限制大小。exception_handler 用来处理下载时产生的异常。gtimeout 是 Gevent 合并所有 Greenlet 的超时时间，和 request 对象中的 timeout 不同。

接下来把 requests 的生成器转化为包含 request 对象的 list。然后调用 send 函数来发起请求。使用 joinall 等待所有 Greenlet 处理单元结束。

## imap 函数

```python
def imap(requests, stream=False, size=2, exception_handler=None):
    """Concurrently converts a generator object of Requests to
    a generator of Responses.
    :param requests: a generator of Request objects.
    :param stream: If True, the content will not be downloaded immediately.
    :param size: Specifies the number of requests to make at a time. default is 2
    :param exception_handler: Callback function, called when exception occured. Params: Request, Exception
    """

    pool = Pool(size)

    def send(r):
        return r.send(stream=stream)

    for request in pool.imap_unordered(send, requests):
        if request.response is not None:
            yield request.response
        elif exception_handler:
            ex_result = exception_handler(request, request.exception)
            if ex_result is not None:
                yield ex_result

    pool.join()
```

imap 和 map 这两个函数的主要区别是：imap 的结果是相应的生成器。

这个函数的关键是使用了 `pool.imap_unordered`。该处和 `itertools.imap` 的行为是类似的，作用于无穷序列，并返回迭代对象。`pool.imap_unordered` 返回的结果的顺序是随意的，所以只要任意一个处理器有结果了都可以取出结果。而上一个 map 函数则需要等到所有结果跑完了才可以取。

同样最后也要使用 join 方法来等到所有 Greenlet 对象处理完成。

## 使用

使用方法很简单，首先创建一系列 request 对象。

```python
import grequests

urls = [
    'http://www.heroku.com',
    'http://python-tablib.org',
    'http://httpbin.org',
    'http://python-requests.org',
    'http://fakedomain/',
    'http://kennethreitz.com'
]
rs = (grequests.get(u) for u in urls)
```

然后调用 send 方法发送请求即可。

```python
>>> grequests.map(rs)
[<Response [200]>, <Response [200]>, <Response [200]>, <Response [200]>, None, <Response [200]>]
```

