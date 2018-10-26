---
title: CSAPP Data Lab
comments: true
mathjax: true
tags: CSAPP
categories: 练习
abbrlink: 31296
date: 2018-10-25 10:02:53
---

《深入理解计算机操作系统》的 Data Lab 实验。主要是解决整数和浮点数相关的问题。

<!--more-->

## 第一题

用 `~` 和 `|` 代理 `&` 操作。
简单的逻辑运算即可。

```c
/*
 * bitAnd - x&y using only ~ and |
 *   Example: bitAnd(6, 5) = 4
 *   Legal ops: ~ |
 *   Max ops: 8
 *   Rating: 1
 */
int bitAnd(int x, int y) {
  return ~(~x|~y);
}
```

## 第二题

求一个 16 进制的数的第 n 个字节。16 进制数字由 4 个比特表示，1 个字节有 8 个比特，所以 1 个字节可以表示两个 16 进制数字。
先把 x 移动 8 * n 个比特，然后在和 `0xFF` 进行 `&` 操作，就可以得到第 n 个字节表示的数字。

```c
/*
 * getByte - Extract byte n from word x
 *   Bytes numbered from 0 (LSB) to 3 (MSB)
 *   Examples: getByte(0x12345678,1) = 0x56
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 6
 *   Rating: 2
 */
int getByte(int x, int n) {
  return x >> (n << 3) & 0xff;
}
```

## 第三题

实现逻辑右移。

