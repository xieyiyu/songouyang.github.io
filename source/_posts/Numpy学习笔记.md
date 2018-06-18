---
title: Numpy 学习笔记
categories: 工具
comments: true
mathjax: false
tags:
  - Python
  - Numpy
abbrlink: 15181
date: 2018-05-14 17:02:22
---

Numpy 的基本概念就是 ndarray 数组，所有属性和操作都是围绕它而来。

<!--more-->

## 开始使用

一般公认的导入方法如下：

```python
import numpy as np
```

## 常用属性

```python
>>> a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float64)
>>> a.ndim # 维度
2
>>> a.shape # 数组形状
(2, 3)
>>> a.size # 元素个数
6
>>> a.dtype # 元素类型
dtype('float64')
>>> a.itemsize # 元素字节数
8
>>> a.T # 转置
array([[ 1.,  4.],
       [ 2.,  5.],
       [ 3.,  6.]])
>>> a.flat # 返回 numpy.flatiter 对象，可迭代
<numpy.flatiter object at 0x7f97d9811800>
```

## 创建

###  从 list 或者 tuple

```python
>>> a = np.array([[1, 2, 3], [4, 5, 6]])
```

### 直接生成

指定 shape 和 dtype 生成。zeros 代表全是 0，ones 代表全是 1，empty 代表不初始化。

```python
>>> a = np.zeros(shape=(2, 3), dtype=np.float64)
>>> a
array([[ 0.,  0.,  0.],
       [ 0.,  0.,  0.]])
>>> a = np.ones(shape=(2, 3), dtype=np.float64)
>>> a
array([[ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
```

复制别的 ndarry 的 shape 和 dtype 来创建。类似的，zeros_like 代表全部初始化为 0，ones_like 代表全部初始化为 1，empty_like 不初始化。

```python
>>> b = np.zeros_like(a)
>>> a
array([[ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
```

指定 shape 来用随机数初始化。

```python
>>> np.random.rand(2,3) # 0～1 均匀分布
array([[ 0.31119951,  0.84391927,  0.1113187 ],
       [ 0.30782159,  0.67313418,  0.46963388]])
>>> np.random.randn(2,3) # 标准正态分布
array([[-2.25811477, -0.34537208,  1.34830224],
       [-0.97916617, -1.17038121, -0.51444696]])
```

用序列，也就是起点，终点和步长，类似切片。

```python
>>> np.arange(start=1, stop=7, step=1, dtype=np.float64).reshape(2,3)
array([[ 1.,  2.,  3.],
       [ 4.,  5.,  6.]])
>>> np.linspace(start=1, stop=4, num=6, endpoint=True, dtype=np.float64) # 均分
array([ 1. ,  1.6,  2.2,  2.8,  3.4,  4. ])
>>> np.logspace(start=1, stop=4, num=6, endpoint=True, dtype=np.float64, base=10.0) # 等比数列
array([    10.        ,     39.81071706,    158.48931925,    630.95734448,
         2511.88643151,  10000.        ])
```

使用生成函数。

```python
>>> np.fromfunction(lambda i, j:i+j, (2, 3), dtype=np.float64)
array([[ 0.,  1.,  2.],
       [ 1.,  2.,  3.]])
```

### 从文件读取

```python
>>> np.save("a.npy", a)
>>> b = np.load("a.npy")
>>> b
array([[ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
```

## 基本操作

### 查

直接用位置或者通过条件来索引。

```python
>>> a
array([[ 1.,  2.,  3.],
       [-4., -5., -6.]])
>>> a[1,1]
-5.0
>>> a[1, 0:1]
array([-4.])
>>> a[1, :]
array([-4., -5., -6.])
>>> a[1, ...] # 除了第一个纬度是 1，其他纬度都可以
array([-4., -5., -6.])
>>> a[[1, 0], :]
array([[-4., -5., -6.],
       [ 1.,  2.,  3.]])
>>> a[a<0] # bool 索引
array([-4., -5., -6.])
```

### 改

对上面索引到的位置赋值。

```python
>>> a
array([[ 1.,  2.,  3.],
       [-1., -1., -1.]])
>>> a.flat[1:2] = 5
>>> a
array([[ 1.,  5.,  3.],
       [-1., -1., -1.]])
```

### 拼接

```python
>>> b
array([[ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
>>> a
array([[ 1.,  5.,  3.],
       [-1., -1., -1.]])
>>> np.concatenate([a, b], axis=0) # 沿垂直方向拼接
array([[ 1.,  5.,  3.],
       [-1., -1., -1.],
       [ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
>>> np.concatenate([a, b], axis=1) # 沿水平方向拼接
array([[ 1.,  5.,  3.,  1.,  1.,  1.],
       [-1., -1., -1.,  1.,  1.,  1.]])
```

`np.vstack([x,y])`，`np.hstack([x,y])`，`np.dstack([x,y])` 分别对应 axis 等于 0，1，2。

### 分割

指定索引编号分割。

```python
np.array_split(a, [1,3], axis=0)
```

指定纬度，均等分。`np.vsplit()`，`np.hsplit()`，`np.dsplit()`。

### 复制

分成浅度复制和深度复制，区别就是有没有独立的内存。

```python
b = a.view() # 浅度复制
b = a.copy() # 深度复制
```

## 计算

这里主要掌握广播，所谓广播就是要么相同形状，要么某一个维度上相同，要么只有一个数字扩展成一个维度。

```python
>>> a
array([[  2.,  10.,   6.],
       [ -2.,  12.,  -2.]])
>>> a*a
array([[   4.,  100.,   36.],
       [   4.,  144.,    4.]])
>>> a+1
array([[  3.,  11.,   7.],
       [ -1.,  13.,  -1.]])
>>> a*=2
>>> a
array([[  4.,  20.,  12.],
       [ -4.,  24.,  -4.]])
```

利用内置函数来广播。

```python
>>> a
array([[  4.,  20.,  12.],
       [ -4.,  24.,  -4.]])
>>> np.exp(a)
array([[  5.45981500e+01,   4.85165195e+08,   1.62754791e+05],
       [  1.83156389e-02,   2.64891221e+10,   1.83156389e-02]])
>>> np.max(a)
24.0
```

线性函数相关。

```python
>>> a
array([[  4.,  20.,  12.],
       [ -4.,  24.,  -4.]])
>>> b = b.T
>>> b
array([[ 1., -1.],
       [ 5.,  7.],
       [ 3., -1.]])
>>> a.dot(b)
array([[ 140.,  124.],
       [ 104.,  176.]])
```

