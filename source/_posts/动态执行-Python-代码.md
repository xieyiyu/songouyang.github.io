---
title: 动态执行 Python 代码
comments: true
mathjax: false
tags: Python
categories: 方案
abbrlink: 17539
date: 2018-10-25 23:06:20
---

将输入的 Python 代码串在程序中执行，并获取返回值。动态执行任意 Python 代码。

<!--more-->

在 Python 中有 `eval` 和 `exec` 两个函数可以用来动态执行 Python 代码。但是两者都有缺点，不能满足我的需求，就是执行任意合格的用户自定义的 Python 函数代码。

## 调研

`eval` 只支持简单的语句执行，不支持 `if`、`else`、`def`等语句。
`exec` 的返回值永远都是 `None`，会把所有结果输出到标准输出。

## 已有的方案

首先在网上找到将任意 Python 代码的执行结果输出，包括错误输出等。
[UNIVERSAL EVAL TO STRING FUNCTION](http://code.activestate.com/recipes/577585-universal-eval-to-string-function/)

```python
from StringIO import StringIO

def execute(code, _globals={}, _locals={}):
    import sys
    fake_stdout = StringIO()
    __stdout = sys.stdout
    sys.stdout = fake_stdout
    try:
        # try if this is expressions
        ret = eval(code, _globals, _locals)
        result = fake_stdout.getvalue()
        sys.stdout = __stdout
        if ret:
            result += str(ret)
        return result
    except:
        try:
            exec(code, _globals, _locals)
        except:
            sys.stdout = __stdout
            import traceback
            buf = StringIO()
            traceback.print_exc(file=buf)
            return buf.getvalue()
        else:
            sys.stdout = __stdout
            return fake_stdout.getvalue()
```

如果直接使用这个方案的话，我还需要判断输入是不是错误输出，并且只能把结果转化为字符串，连布尔类型都不能获取到，还是很不爽。

## 优化

前面说了我的需求是用户自定义的函数代码。那么可以利用到 `globals` 和 `locals` 参数。

`globals` 是个 `dict` 对象，用来指定代码执行时可以使用的全局变量以及收集代码执行后的全局变量。
`locals` 可以是任何 mapping 对象，用来指定代码执行时的局部变量以及收集代码执行后的局部变量。

那么我只需要从 `locals` 里面把用户自定的函数取出来就可以动态执行改函数了。

```python
def str_to_func(snippet, func_name=None):
    local_vars = {}
    execute(snippet, {}, local_vars)
    if func_name:
        return local_vars.get(func_name, None)
    for v in local_vars.itervalues():
        if callable(v):
            return v
    return None
```

那么写个 demo 测试一下。

```python
def demo1():
    snippet = """
def bar(c, d):
    return c > d
    """
    foo = str_to_func(snippet)
    assert foo(1, 2) is False
    assert foo(4, 3) is True
    assert foo(0, 0) is False
```

## 注意

这样的方法直接放到网上是很危险的，因为对方直接用 `os` 里面的模块，可以把你的系统都删除了。所以如果想限制用户能使用的模块，可以通过 `globals` 对象来实现。默认当它不包含 `__builtins__` 时，会指向 [builtins](https://docs.python.org/3/library/builtins.html#module-builtins)。所以如果需要限制的话，只需要自定义 `__builtins__` 即可。可以通过 `dir(__builtins__)` 查看所有的默认的模块和函数。

```python
>>> execute("import os; print os.getpid()", {'__builtins__': {}})
'Traceback (most recent call last):\n  File "executor.py", line 23, in execute\n    exec(code, _globals, _locals)\n  File "<string>", line 1, in <module>\nImportError: __import__ not found\n'
>>> execute("import os; print os.getpid()", {})
'2084840\n'
```
