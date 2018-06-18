---
title: Python 中的容器
categories: 编程
comments: true
mathjax: false
tags:
  - Python
abbrlink: 62453
date: 2018-03-12 20:43:08
---

本文介绍 Python 中 Collections 类中的几种容器，包括 namedtuple、deque、Counter、OrderedDict 和 defaultdict。

<!--more-->

Python 中除了简单的三种容器 list、dict 和 tuple 之外，还有 collections 类中几个非常实用的容器，掌握这几种容器会减少造轮子的概率。

## namedtuple

namedtuple 的作用是映射名称到序列元素。这个函数实际上是一个返回 Python 中标准元组类型子类的一个工厂方法。需要传递一个类型名和你需要的字段给它，然后它就会返回一个类，你可以初始化这个类，为你定义的字段传递值等。

```python
>>> from collections import namedtuple
>>> Subscriber = namedtuple("Subscriber", ["addr", "joined"])
>>> sub = Subscriber("songouyang@live.com", "2008-08-08")
>>> sub
Subscriber(addr='songouyang@live.com', joined='2008-08-08')
>>> sub.addr
'songouyang@live.com'
>>> sub.joined
'2008-08-08'
```

同时它和元组类型是可交换的，支持所有普通元组操作。

```python
>>> len(sub)
2
>>> a, j = sub
>>> a
'songouyang@live.com'
>>> j
'2008-08-08'
```

另外一个用途就是代替字典，但是不像字典，namedtuple 是不可以更改的。如果非要修改，可以使用 `_replace()` 方法。

```python
>>> sub.joined = "2018-03-12"
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: can't set attribute
>>> sub = sub._replace(joined="2018-03-12")
>>> sub
Subscriber(addr='songouyang@live.com', joined='2018-03-12')
```

## deque

deque 提供了一个双端队列，可以从队列两端添加或删除元素。在队列两端插入或删除元素时间复杂度都是 `O(1)`，区别于列表，在列表的开头插入或删除元素的时间复杂度为 `O(N)`。

```python
>>> from collections import deque
>>> q = deque(maxlen=3)
>>> q.append(1)
>>> q.append(2)
>>> q.append(3)
>>> q
deque([1, 2, 3], maxlen=3)
>>> q.append(4)
>>> q
deque([2, 3, 4], maxlen=3)
>>> q.append(5)
>>> q
deque([3, 4, 5], maxlen=3)
```

## Counter

Counter 是一个计数器，它可以帮助我们针对某项数据进行计数。比如找序列中出现次数最多的元素，也可以进行数学中的加减法。

```python
>>> from collections import Counter
>>> words = [
...     'look', 'into', 'my', 'eyes', 'look', 'into', 'my', 'eyes',
...     'the', 'eyes', 'the', 'eyes', 'the', 'eyes', 'not', 'around', 'the',
...     'eyes', "don't", 'look', 'around', 'the', 'eyes', 'look', 'into',
...     'my', 'eyes', "you're", 'under'
... ]
>>> word_counts = Counter(words)
>>> word_counts.most_common(3)
[('eyes', 8), ('the', 5), ('look', 4)]
>>> morewords = ['why','are','you','not','looking','in','my','eyes']
>>> word_counts.update(morewords)
>>> word_counts['eyes']
9
>>> a = Counter(words)
>>> b = Counter(morewords)
>>> a
Counter({'eyes': 8, 'the': 5, 'look': 4, 'into': 3, 'my': 3, 'around': 2, 'not': 1, "don't": 1, "you're": 1, 'under': 1})
>>> b
Counter({'why': 1, 'are': 1, 'you': 1, 'not': 1, 'looking': 1, 'in': 1, 'my': 1, 'eyes': 1})
>>> a+b
Counter({'eyes': 9, 'the': 5, 'look': 4, 'my': 4, 'into': 3, 'not': 2, 'around': 2, "don't": 1, "you're": 1, 'under': 1, 'why': 1, 'are': 1, 'you': 1, 'looking': 1, 'in': 1})
>>> a-b
Counter({'eyes': 7, 'the': 5, 'look': 4, 'into': 3, 'my': 2, 'around': 2, "don't": 1, "you're": 1, 'under': 1})
```

## OrderedDict

在迭代或序列化这个字典的时候能够控制元素的顺序，在迭代操作的时候它会保持元素被插入时的顺序。

```python
>>> from collections import OrderedDict
>>> d = OrderedDict()
>>> d["foo"] = 1
>>> d["bar"] = 2
>>> d["spam"] = 3
>>> d["grok"] = 4
>>> for key in d:
...     print(key, d[key])
...
foo 1
bar 2
spam 3
grok 4
>>> import json
>>> json.dumps(d)
'{"foo": 1, "bar": 2, "spam": 3, "grok": 4}'
```

OrderdDict 内部维护着一个根据键插入顺序排序的双向链表。每次当一个新的元素插入进来的时候，它会被放到链表的尾部。对于一个已经存在的键的重复赋值不会改变键的顺序。因此一个 OrderedDict 的大小是一个普通字典的两倍。

## defaultdict

defaultdict 是内置字典类的子类，不需要检查 key 是否存在。defaultdict 可以很好的实现一对多的字典，如下：

```javascript
d = {
    'a' : [1, 2, 3],
    'b' : [4, 5]
}
e = {
    'a' : {1, 2, 3},
    'b' : {4, 5}
}
```

创建方法如下：

```python
>>> from collections import defaultdict
>>> d = defaultdict(list)
>>> d["a"].append(1)
>>> d["a"].append(2)
>>> d["a"].append(4)
>>> d
defaultdict(<class 'list'>, {'a': [1, 2, 4]})
>>> d = defaultdict(set)
>>> d["a"].add(1)
>>> d["a"].add(2)
>>> d["a"].add(4)
>>> d
defaultdict(<class 'set'>, {'a': {1, 2, 4}})
```

利用 defaultdict 绕过 keyError 异常。

```python
>>> from collections import defaultdict
>>> x = lambda:defaultdict(x)
>>> d = x()
>>> d["a"]["b"] = "q"
>>> d
defaultdict(<function <lambda> at 0x1088cfe18>, {'a': defaultdict(<function <lambda> at 0x1088cfe18>, {'b': 'q'})})
>>> import json
>>> json.dumps(d)
'{"a": {"b": "q"}}'
```

首先要知道 defaultdict 的参数是一个构造函数，比如你可以传入 int 或者 list。在上面，我传入参数是 x，也就是说构造函数是 x，而 x 又是一个参数为 x 的 defaultdict，所以这样会不断递归，意味着你可以随便传入几层 key。如果对 lambda 不熟悉的话，可以看看下面的版本。

```python
>>> from collections import defaultdict
>>> def hello():
...     return defaultdict(hello)
...
>>> d = hello()
>>> d["a"]["b"] = "q"
>>> d
defaultdict(<function hello at 0x101526e18>, {'a': defaultdict(<function hello at 0x101526e18>, {'b': 'q'})})
>>> import json
>>> json.dumps(d)
'{"a": {"b": "q"}}'
```
