---
title: Python 装饰器
categories: 编程
comments: true
mathjax: false
tags:
  - Python
  - 装饰器
abbrlink: 3334
date: 2018-03-06 10:54:18
---

Python 中的装饰器（Decorator）可以对已有的函数进行 hook，不修改函数实现的代码但是动态地修改函数的功能。

<!--more-->

## 函数是对象

### 函数赋值给变量

函数是一个对象，所以函数可以赋值给变量。通过变量同样可以运行该函数。

```python
>>> def foo():
...     print("hello foo")
...
>>> bar = foo
>>> bar()
hello foo
```

### 函数内部定义函数

可以在 foo1 函数中定义 foo2 函数。

```python
>>> def foo1(name):
...     def foo2():
...             return "hello "
...     print(foo2() + name)
...
>>> foo1("ouyangsong")
hello ouyangsong
```

### 函数可以作为参数

foo2 函数可以作为 foo1 函数的参数。

```python
>>> def foo2(name):
...     return "hello %s" %name
...
>>> def foo1(func):
...     name = "ouyangsong"
...     return func(name)
...
>>> foo1(foo2)
'hello ouyangsong'
```

### 函数作为返回值

foo1 函数的返回值可以是 foo2 函数。

```python
>>> def foo1(name):
...     def foo2():
...             return "hello %s" %name
...     return foo2
...
>>> foo1("ouyangsong")
<function foo1.<locals>.foo2 at 0x10780f048>
>>> foo1("ouyangsong")()
'hello ouyangsong'
```

## 装饰器的构成

函数上添加一个包装器，增加额外的操作处理（比如日志、计时等）。

```python
import time

def timethis(func):
    '''
    Decorator that reports the execution time.
    '''
    def wrapper():
        start = time.time()
        result = func()
        end = time.time()
        print(func.__name__, end-start)
        return result
    return wrapper
```

使用上面定义的装饰器。

```python
>>> def countdown():
...     n = 100
...     while(n>0):
...             n -= 1
...
>>> countdown = timethis(countdown)
>>> countdown()
countdown 2.7179718017578125e-05
```

## 语法糖

Python 使用装饰器可以使用 `@` 符号，非常简洁。

```python
>>> @timethis
... def countdown():
...     n = 100
...     while(n>0):
...             n -= 1
...
>>> countdown()
countdown 1.9788742065429688e-05
```

## 函数参数

如果上面的 `countdown` 函数需要传入参数，那么 `wrapper` 函数也需要接受参数。

```python
import time

def timethis(func):
    '''
    Decorator that reports the execution time.
    '''
    def wrapper(n):
        start = time.time()
        result = func(n)
        end = time.time()
        print(func.__name__, end-start)
        return result
    return wrapper
```

```python
>>> @timethis
... def countdown(n):
...     while(n>0):
...             n -= 1
...
>>> countdown(100)
countdown 2.6941299438476562e-05
```

为了 `wrapper` 函数可以接受任意参数，可以把 `wrapper` 的参数改成 `(*args, **kw)`。

```python
import time

def timethis(func):
    '''
    Decorator that reports the execution time.
    '''
    def wrapper(*args, **kw):
        start = time.time()
        result = func(*args, **kw)
        end = time.time()
        print(func.__name__, end-start)
        return result
    return wrapper
```

## 装饰器参数

装饰器本身也可以添加参数，比如打印不同等级的 log。

```python
import time

def timethis(prefix):
    '''
    Decorator that reports the execution time.
    '''
    def decorator(func):
        def wrapper(*args, **kw):
            start = time.time()
            result = func(*args, **kw)
            end = time.time()
            print(prefix, func.__name__, end-start)
            return result
        return wrapper
    return decorator
```

使用该装饰器。

```python
>>> @timethis("No1, ")
... def countdown(n):
...     while(n>0):
...             n -= 1
...
>>> countdown(100)
No1,  countdown 2.7179718017578125e-05
```

这个时候 `@` 等价于：

```python
countdown = timethis("No1, ")(countdown)
```

## 调试装饰器

目前我们的装饰器距离成功还差一步，因为使用了上面的装饰器，我们发现函数的名字，文档等等都发生变化了。

```python
>>> countdown.__name__
'wrapper'
```

使用 `functools.wraps` 就可以把原始函数的属性添加到 `wrapper` 函数上了。

```python
import time
from functools import wraps

def timethis(prefix):
    '''
    Decorator that reports the execution time.
    '''
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kw):
            start = time.time()
            result = func(*args, **kw)
            end = time.time()
            print(prefix, func.__name__, end-start)
            return result
        return wrapper
    return decorator
```

```python
>>> @timethis("No1. ")
... def countdown(n):
...     while(n>0):
...             n -= 1
...
>>> countdown.__name__
'countdown'
>>> countdown.__module__
'__main__'
```

## 实例

```python
import time
from functools import wraps
def benchmark(func):
    """
    A decorator that prints the time a function takes
    to execute.
    """
    @wraps(func)
    def wrapper(*args, **kw):
        start = time.time()
        result = func(*args, **kw)
        end = time.time()
        print("{0} {1}".format(func.__name__, end-start))
        return result
    return wrapper


def logging(func):
    """
    A decorator that logs the activity of the script.
    (it actually just prints it, but it could be logging!)
    """
    @wraps(func)
    def wrapper(*args, **kw):
        result = func(*args, **kw)
        print("{0} {1} {2}".format(func.__name__, args, kw))
        return result
    return wrapper


def counter(func):
    """
    A decorator that counts and prints the number of times a function has been executed
    """
    @wraps(func)
    def wrapper(*args, **kw):
        wrapper.count += 1
        result = func(*args, **kw)
        print("{0} has been used: {1}x".format(func.__name__, wrapper.count))
        return result
    wrapper.count = 0
    return wrapper
```

```python
>>> @counter
... @benchmark
... @logging
... def countdown(n):
...     while(n>0):
...             n -= 1
...
>>> countdown(1000)
countdown (10000,) {}
countdown 0.000668048858643
countdown has been used: 1x
>>> countdown(100000)
countdown (100000,) {}
countdown 0.00435209274292
countdown has been used: 2x
```

