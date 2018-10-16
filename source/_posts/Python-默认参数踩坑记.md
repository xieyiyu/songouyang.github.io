---
title: Python 默认参数踩坑记
comments: true
mathjax: false
abbrlink: 47717
date: 2018-10-15 23:07:22
tags: [Python]
categories: [编程]
---

函数可以有默认参数，降低函数调用的难度。但是 Python 的默认参数如果是可变参数则是个坑。

<!--more-->

## 例子

首先来看个例子，运行起来是不是有点不可思议。

```python
>>> class A(object):
...    def __init__(self, b=0, c=list()):
...        self.b = b
...        self.c = c
>>> a1 = A()
>>> a2 = A()
>>> a1.c.append(1)
>>> print a1.c
[1]
>>> print a2.c
[1]
```

难道是 a1 和 a2 是相同的实例，肯定不可能呀，如果一样，那还要实例化对象干嘛。
而且可以验证 a1 和 a2 是在不同的内存地址中。

```python
>>> id(a1)
4387203536
>>> id(a2)
4387203408
```

那看下 a1.c 和 a2.c 地址，发现是一样的。

```python
>>> id(a1.c)
4387243936
>>> id(a2.c)
4387243936
```

原来 a1 和 a2 的 c 都是指向同一个 list。这是为什么呢？

## 原理

> **Default parameter values are evaluated when the function definition is executed.** This means that the expression is evaluated once, when the function is defined, and that the same “pre-computed” value is used for each call. This is especially important to understand when a default parameter is a mutable object, such as a list or a dictionary: if the function modifies the object (e.g. by appending an item to a list), the default value is in effect modified. This is generally not what was intended. A way around this is to use None as the default, and explicitly test for it in the body of the function.

在 Python 中对象是一等公民，连函数定义都是对象。解释器遇到 `def` 关键词的时候，就会创建一个函数对象。默认参数在函数编译阶段就确定好了，默认参数会成为该对象的属性 `__defaults__`。
如果默认参数是不可变的数值，那么该属性发生改变，那么只能指向别的内存地址。
如果默认参数是可变的数值，函数对象中只不过是保存了对该可变数值的一个引用，那么对该属性的改变，都只是对可变数值的改变，并不会改变引用。所以说 a1 和 a2 其实都是引用同一个可变对象。

Python 中的 `str` 和 `None` 都是不可变对象。一旦创建就不能修改。

## 如何避免

那如果我想默认的参数就是一个空的列表，那要怎么做呢？

第一种方法就是最简单的，那就是每次都穿入空的列表，那就失去了默认参数的意义了。

```python
>>> a3 = A(c=list())
>>> a4 = A(c=list())
>>> a3.c.append(3)
>>> a3.c
[3]
>>> a4.c
[]
```

另外一种方法就是利用不可变对象。

```python
>>> class B(object):
...     def __init__(self, b=0, c=None):
...         self.b = b
...         self.c = c or list()
...
>>> b1 = B()
>>> b2 = B()
>>> b1.c.append(4)
>>> b1.c
[4]
>>> b2.c
[]
```

## 如何利用

> Actually, this is not a design flaw, and it is not because of internals, or performance.
It comes simply from the fact that functions in Python are first-class objects, and not only a piece of code.

既然它不是设计缺陷，那我们可以怎么利用它呢？

利用可变对象参数做缓存。

```python
def fib_direct(n, count=collections.Counter(), cache={}):
    count[n] += 1
    if n in cache:
        return cache[n]
    if n < 3:
        value = n
    else:
        value = fib_direct(n - 1) + fib_direct(n - 2)
    cache[n] = value
    return value
print fib_direct(10)
print fib_direct.__defaults__[0]
```

local 对象绑定到 global 对象上。

```python
import math
def this_one_must_be_fast(x, sin=math.sin, cos=math.cos):
    pass
```

看到这个例子，可以对比一下下面这个例子。

```python
>>> import time
>>> def print_time(t=time.time()):
...     print t
...
>>> print_time()
1539707986.13
>>> print_time()
1539707986.13
```

掌握了原理才可以避免再次掉坑里。
