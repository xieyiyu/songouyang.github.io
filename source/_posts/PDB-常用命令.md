---
title: PDB 常用命令
comments: true
mathjax: false
tags:
  - Python
categories: 工具
abbrlink: 55555
date: 2018-06-30 21:10:55
---

远程调试 Python 程序主要使用 logging 和 PDB 进行调试。一方面没有权限安装 IPDB，另一方面是没法在本地 IDE 调试。

<!--more-->

## 使用方法

PDB 是 Python 自带的模块，所以不需要额外安装。如果需要更高级的调试可以试试 [IPDB](https://pypi.org/project/ipdb/)。在需要调试的地方插入断点：

```python
import pdb;pdb.set_trace()
```

注意断点是阻塞型的，所以正式上线前一定要删除断点。所以从这个角度来看打印日志是比设置断点方便的。

如果代码行数少，并且启动程序的方式简单，也可以使用下面的命令调试，省去加断点和删断点。

```sh
python -m pdb ouyangsong.py
```

## 常用命令

**p**

计算并打印变量的值，和 `print` 类似。也可以直接输入变量名回车也会打印变量的值。

**n**

下一行，逐行调试的时候可以使用。

**c**

继续运行直到下一个断点，也就是 continue 的缩写。

**l**

查看断点附近的代码，方便知道目前所处的位置。

**b**

后面加行号，就可以动态添加断点了。

**s**

进入函数内部。

**r**

执行代码直到从当前函数返回。

**q**

强制退出，这样的话程序会异常退出。

**commands**

其实就是执行任何代码。比如强制改值来测试不同例子。

