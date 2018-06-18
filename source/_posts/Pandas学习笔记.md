---
title: Pandas 学习笔记
categories: 工具
comments: true
mathjax: false
tags:
  - Python
  - Pandas
abbrlink: 19907
date: 2018-05-15 12:08:05
---

Pandas 的基本概念就是 DataFrame，所有属性和操作都是围绕它而来。

<!--more-->

Padans 中的每一列叫做 Series，每一个 Series 中的数据类型要保持一致，但是 DataFrame 中的 Series 的类型可以不一样。

一般 Python 三剑客的导入的方法如下：

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
```

## 创建 Series 和索引

序列 = 数据 + 索引 + 序列名 + 数据类型

```python
>>> s_age = pd.Series(data=[1, 2, 3, 4], index=["a", "b", "c", "d"], name="mySeries", dtype=np.int32)
>>> s_age
a    1
b    2
c    3
d    4
Name: mySeries, dtype: int32
>>> s_age.reindex(['a','b','e']) # 重排
a    1.0
b    2.0
e    NaN
Name: mySeries, dtype: float64
>>> s_age[0]
1
>>> s_age[1:2]
b    2
Name: mySeries, dtype: int32
>>> s_age[1:2]=22
>>> s_age
a     1
b    22
c     3
d     4
Name: mySeries, dtype: int32
>>> s_age["a"]
1
```

## 创建 DataFrame

### 用 Series 创建

```python
>>> s1 = pd.Series(data=["M", "F", "M", "F"], index=["a", "b", "c", "d"], name="sex")
>>> s2 = pd.Series(data=[21, 22, 23, 24], index=["a", "b", "c", "d"], name="age")
>>> df = pd.DataFrame({'sex': s1.astype("category"), 'age': s2})
>>> df
   age sex
a   21   M
b   22   F
c   23   M
d   24   F
```

### 从文件中读取

包括但不限于 csv，数据库。

```python
iris=pd.read_csv('https://raw.github.com/pydata/pandas/master/pandas/tests/data/iris.csv', sep=',')
```

## 查看属性

```python
>>> df.index # 行名
Index(['a', 'b', 'c', 'd'], dtype='object')
>>> df.columns # 列名
Index(['age', 'sex'], dtype='object')
>>> df.dtypes # 列属性，也就是 Series 类型
age       int64
sex    category
dtype: object
```

head 和 tail 就和 Linux 下面的 haed 和 tail 命令类似。

```python
>>> df.head()
   age sex
a   21   M
b   22   F
c   23   M
d   24   F
>>> df.tail()
   age sex
a   21   M
b   22   F
c   23   M
d   24   F
>>> df.describe()
             age
count   4.000000
mean   22.500000
std     1.290994
min    21.000000
25%    21.750000
50%    22.500000
75%    23.250000
max    24.000000
```

## 聚合

就和 sql 中的 groupby 类似。

```python
>>> df.groupby([df["sex"]]).agg({"age": ["sum", "mean"]})
    age
    sum mean
sex
F    46   23
M    44   22
```

## 排序

可以指定排序的依据，是否倒序等等。

```python
>>> df.sort_index(ascending=False)
   age sex
d   24   F
c   23   M
b   22   F
a   21   M
>>> df.sort_values(by="age", ascending=False)
   age sex
d   24   F
c   23   M
b   22   F
a   21   M
```

## 透视

```python
>>> df
   age sex  sorce
a   21   M     11
b   22   F     12
c   23   M     13
d   24   F     14
>>> df.pivot_table(index=['age'], columns=['sex'], values=['sorce'], aggfunc=[len, np.mean,np.sum],margins=True, fill_value=0)
      len         mean           sum
    sorce        sorce         sorce
sex     F  M All     F   M All     F   M All
age
21      0  1   1     0  11  11     0  11  11
22      1  0   1    12   0  12    12   0  12
23      0  1   1     0  13  13     0  13  13
24      1  0   1    14   0  14    14   0  14
All     2  2   4    13  12  12    26  24  50
```

## 索引

也就是定位元素。

```python
>>> df[1:3] # 切片
   age sex  sorce
b   22   F     12
c   23   M     13
>>> df[df.sorce>12] # bool 索引
   age sex  sorce
c   23   M     13
d   24   F     14
>>> df.query('sorce>12') # sql 索引
   age sex  sorce
c   23   M     13
d   24   F     14
>>> df = pd.DataFrame(np.arange(10).reshape(-1, 2), columns=['A', 'B'])
>>> df.where(df.A>2, 10) # 不满足条件的填充
    A   B
0  10  10
1  10  10
2   4   5
3   6   7
4   8   9
>>> df
   A  B
a  0  1
b  2  3
c  4  5
d  6  7
e  8  9
>>> df.A # 选择列
a    0
b    2
c    4
d    6
e    8
Name: A, dtype: int64
>>> df[['A', 'B']] # 选择多列
   A  B
a  0  1
b  2  3
c  4  5
d  6  7
e  8  9
>>> df.loc[['a','b'], ['A','B']] # 选择行与列
   A  B
a  0  1
b  2  3
>>> df.iloc[1:3, 0:2] # 根据行列下标来选择
   A  B
b  2  3
c  4  5
```

## 合并数据

```python
# axis 设置纬度，join 指定合并方式，参考 sql 的连接
pd.concat([df1,df2],axis=0,join='outer')
# merge 就和 sql 的 join 类似
pd.merge(df1,df2,on=['age'],how='left')
```

更多参数和直观的体现可以参考 [Merge, join, and concatenate](http://pandas.pydata.org/pandas-docs/stable/merging.html#database-style-dataframe-joining-merging)。

## 采样

```python
df1.sample(n=100, weights='age',axis=0, replace=True)
```

sklearn 也有对 DataFrame 进行 shuffle 的函数。
