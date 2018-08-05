---
title: Python 编码问题总结
comments: true
mathjax: false
tags:
  - Python
  - 编码
categories: 编程
abbrlink: 55328
date: 2018-08-05 22:28:15
---

总结一下 Python 中的字符编码问题，彻底了解问题的本质，才不至于遇到问题就瞎试。

<!--more-->

## 基础知识

字符集和编码是两个不同的概念。对于 ASCII、MBCS 等字符集只采用一种编码方案，Unicode 有多种编码方法。ASCII 标准本身就规定了字符和字符编码方式，采用单字节编码，总共可以编码 128 个字符。为了统一所有语言的字符，出现了 Unicode 字符集，它主要有三种编码方式：UTF-16 中字符用两个字符或者四个字符来表示；UTF-32 用四个字节表示；UTF-8 用一至四个字符表示，根据不同符号变长。

## 源码的编码

Python2 中，如果不在源码的首行显式指定编码，那么无法在源码中出现非 ASCII 字符，因为 Python 解释器默认将源码认作 ASCII 编码格式。

```python
# coding=utf-8
```

## Python 中的编码

Python2 中有两个常用的从 basestring 中派生的表示字符串的类型：str 和 unicode。
其中 str 用**字节串**来表述可能更准确，因为对它进行迭代会直接按照其在内存中的字节序依次迭代。

```python
>>> s = "好a"
>>> for c in s:
...     print c
...
�
�
�
a
```

而对于 unicode 类型，Python 在内存中储存和使用的时候是按照 UTF-8 的格式。

```python
>>> s = u"好a"
>>> for c in s:
...     print c
...
好
a
```

对于 unicode 类型和 str 类型的转换则是用 encode 和 decode 方法。请牢记下面的转换方法，不要记错了。

```
str --> decode -->unicode
unicode --> encode --> str
```

decode 方法把字节串 str 转换成 unicode，比如按照 UTF-8 的格式转化成 Unicode。

```python
>>> s = "好"
>>> s.decode("utf-8")
u'\u597d'
```

encode 方法把 unicode 按照一定的格式转化成字节串 str。

```python
>>> s = u"好"
>>> s.encode("utf-8")
'\xe5\xa5\xbd'
```

这里很多人没有理解 encode 和 decode 的转化方向，导致对 unicode 调用 decode，对 str 调用 encode。最坑人的地方是 Python 还存在隐式转换。
假如对 unicode 调用 decode 方法，其实是先调用 encode(default_encoding) 转化成 str，然后在 decode 成 unicode。而 default_encoding 是 ASCII 编码，如果你的 unicode 本身超过了 ASCII 编码范围就会报错。对 str 调用 encode 也是同样的道理。

```python
>>> u = u"好"
>>> u.decode("utf-8")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/encodings/utf_8.py", line 16, in decode
    return codecs.utf_8_decode(input, errors, True)
UnicodeEncodeError: 'ascii' codec can't encode character u'\u597d' in position 0: ordinal not in range(128)
```

解决办法就是指定中间 encode 的编码方案。

```python
>>> u = u"好"
>>> u.encode("utf-8").decode("utf-8")
u'\u597d'
```

还有一种是网上很多人喜欢用的，但是不推荐的方法，这种方法就是更改 Python 默认的编码。

```python
import sys
reload(sys)
sys.setdefaultencoding("utf-8")
```

强烈不推荐用这种方法。

## 文件读写的编码

读写文件的时候，打开文件，读取的是 str，编码就是文件本身的编码。而写文件的时候，如果传入的是 unicode，并且没有指定编码的话，那么会采用 Python 默认的编码 encode 之后再写入。
