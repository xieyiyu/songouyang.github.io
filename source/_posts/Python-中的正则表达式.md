---
title: Python 中的正则表达式
comments: true
mathjax: false
tags:
  - Python
  - 正则表达式
categories: 编程
abbrlink: 26980
date: 2018-07-01 14:31:47
---

之前介绍了[正则表达式](/posts/19983/)的常用元数据，这里介绍 Python 中的正则表达式模块的使用，包括该模块中的常用方法。

<!--more-->

## 使用

首先引入正则表达式的库。

```python
import re
```

这里首先推荐使用原生字符串，省去了转义符号 `\` 的困惑。可以忽略编程语言中对 `\` 的转义，只在意正则表达式中的 `\`。只需要在字符串前加 `r` 即可，比如 `r'\d'`。

## Pattern 对象

如果一个正则表达式被重复使用，建议先 `compile` 成一个 Pattern 对象，提高效率。

```python
pattern = re.compile(r'\d')
pattern.match('123, 123')
# 或者如下使用
re.match(pattern, '123, 123')
```

## 匹配模式

生成 Pattern 对象的时候可以选择匹配模式。也可以通过 `|` 来选择多个匹配模式。

- re.I 忽略大小写。
- re.M 多行模式。
- re.S 改变 `.` 的行为，任意匹配模式，可以匹配空白字符。
- re.L 使预定字符取决于当前区域设定。
- re.U 使预定字符取决于 unicode 定义。
- re.X 详细模式，正则表达式可以多行、注释以及忽略空白字符。

## 方法

以下的各种方法对于 Pattern 对象和 RE 模块都适用。

### match

match 方法从头开始找，也可以指定开始位置。只要匹配到一个结果就会返回，没有匹配到就返回 None。

当匹配成功会返回一个 match 对象。对于这个对象，有下面几个常用的方法：

- group() 获取匹配的分组，默认是 0，也就是匹配的整个字符串。
- start() 获取匹配分组的开始。默认参数是 0。
- end() 获取匹配分组的结束。默认参数是 0。
- span() 返回匹配分组的开始和结束。默认参数是 0。

### search

它和 match 的不同地方就是起始位置，search 是搜索字符串的任何位置。

### findall

match 和 search 都是一次匹配就会返回，而 findall 会把所有匹配的结果都返回。

### finditer

它和 findall 的区别就是返回结果不是 list，而是一个迭代器。

### split

这个方法是按照正则表达式的规则对字符串进行分割。也可以指定最大分割次数。

```python
>>> import re
>>> pattern = re.compile(r'[\s\,\.]+')
>>> pattern.split('ab,cd.e f  g')
['ab', 'cd', 'e', 'f', 'g']
```

### sub

这个方法是对字符串进行替换。也可以指定最大替换次数。

```python
>>> pattern = re.compile(r'(\w+) (\w+)')
>>> s = 'hello 123, hello 456'
>>> pattern.sub(r'\2 \1', s)
'123 hello, 456 hello'
>>> def foo(m):
...     return 'hi' + ' ' + m.group(2)
...
>>> pattern.sub(foo, s)
'hi 123, hi 456'
```

### subn

这个方法和 sub 方法相比只是返回结果中增加了替换的次数。

