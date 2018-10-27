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

实现逻辑右移。逻辑右移和算数右移的区别是：逻辑右移左边补 0，而算数右移左边补符号位。
举个例子，对 `10001111` 右移 3 位。那么逻辑右移后就是 `00010001`，算数右移后是 `11110001`。
C 语言默认是算数右移动，所以实现逻辑右移的方法就是把移动的位置全部置为 0。

```c
/*
 * logicalShift - shift x to the right by n, using a logical shift
 *   Can assume that 0 <= n <= 31
 *   Examples: logicalShift(0x87654321,4) = 0x08765432
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 20
 *   Rating: 3
 */
int logicalShift(int x, int n) {
  return (x >> n) & (0xFFFFFFFF >> n);
}
```
把全 1 也向右移动相同的位数，然后取与操作就可以把左边移动的比特全部改成 0。

## 第四题

计算一个二进制中有多少个 1。那我就一位一位的挪动，然后和 1 相与，虽然很丑，但是能用。

```c
/*
 * bitCount - returns count of number of 1's in word
 *   Examples: bitCount(5) = 2, bitCount(7) = 3
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 40
 *   Rating: 4
 */
int bitCount(int x) {
  int result = 0;
  result += (x >> 0) & 1;
  result += (x >> 1) & 1;
  result += (x >> 2) & 1;
  result += (x >> 3) & 1;
  result += (x >> 4) & 1;
  result += (x >> 5) & 1;
  result += (x >> 6) & 1;
  result += (x >> 7) & 1;
  result += (x >> 8) & 1;
  result += (x >> 9) & 1;
  result += (x >> 10) & 1;
  result += (x >> 11) & 1;
  result += (x >> 12) & 1;
  result += (x >> 13) & 1;
  result += (x >> 14) & 1;
  result += (x >> 15) & 1;
  result += (x >> 16) & 1;
  result += (x >> 17) & 1;
  result += (x >> 18) & 1;
  result += (x >> 19) & 1;
  result += (x >> 20) & 1;
  result += (x >> 21) & 1;
  result += (x >> 22) & 1;
  result += (x >> 23) & 1;
  result += (x >> 24) & 1;
  result += (x >> 25) & 1;
  result += (x >> 26) & 1;
  result += (x >> 27) & 1;
  result += (x >> 28) & 1;
  result += (x >> 29) & 1;
  result += (x >> 30) & 1;
  result += (x >> 31) & 1;
  return result;
}
```
看了网上的答案，还有下面这种的，其实和我的思路类似，只是它分成了 4 块，然后分别累计到 4 块的最右边，最后把 4 个部分的 1 的个数累加起来。

```c
int bitCount(int x) {
  int bits = 0;
  int mask = 0x1 | (0x1 << 8) | (0x1 << 16) | (0x1 << 24);
  bits += (x & mask);
  bits += ((x >> 1) & mask);
  bits += ((x >> 2) & mask);
  bits += ((x >> 3) & mask);
  bits += ((x >> 4) & mask);
  bits += ((x >> 5) & mask);
  bits += ((x >> 6) & mask);
  bits += ((x >> 7) & mask);
  return (bits & 0xFF) + ((bits >> 8) & 0xFF) + ((bits >> 16) & 0xFF) + ((bits >> 24) & 0xFF);
}
```

## 第五题

计算真假值的逆。也就是 `!x`。前提是不能使用 `!` 操作符号。

补码的作用就是对于计算机来说可以直接相加等于 0，所以除了 0 之外其他数字的补码和相反数的补码相加肯定等于 0，那么他们的符号位肯定不相同。只有 0 的相反数的补码和自身的补码最高位是相同的。

>> 0x80000000 是人为规定的，它原本是 -0，但是人们规则用 +0 表示 0，为了不浪费就用 -0 表示最小数字。

```c
/*
 * bang - Compute !x without using !
 *   Examples: bang(3) = 0, bang(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int bang(int x) {
  return ((x | -x) >> 31) + 1;
}
```

## 第六题

返回最小值的补码，上一题中正好提到了。那就是 `0x80000000`。

```c
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {
  return 1 << 31;
}
```

## 第七题

### 思路 1

判断 n 位比特是可以表示 x 的补码。补码前面无关比特都是和符号位保持一致，那么先往左移动 `32-n`，然后逻辑右移 `32-n`位，如果结果和 x 一样，说明 `32-n` 是无关位，也就是都是和符号位相同。那我们可以写出下面的答案。
```c
int fitsBits(int x, int n) {
  return !((x << (32 - n) >> (32 - n)) ^ x);
}
```
但是题目中说了不能用 `-`，只能用 `+`，那么就是需要替换掉 `-`。我们根据补码的性质，知道 `-x` 就是 `~x + 1`。
那么可以得到最终答案。

```c
/*
 * fitsBits - return 1 if x can be represented as an
 *  n-bit, two's complement integer.
 *   1 <= n <= 32
 *   Examples: fitsBits(5,3) = 0, fitsBits(-4,3) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 2
 */
int fitsBits(int x, int n) {
  return !((x << (32 + ~n + 1) >> (32 + ~n + 1)) ^ x);
}
```

### 思路 2

还有一个思路，就是判断 `n-1` 位的左边全是 `1` 或者 `0`，其实本质也是保证无关比特位和符号位保持一致哈！
首先知道 `~0` 就是 `-1`，这里有点绕，所以 `n-1` 就是 `n + ~0`。
接下来就是判断 `n-1` 左边全是 `1` 或者 `0`。

你可以选择
```c
int tmp = x >> (n + ~0)
return !tmp | !(tmp+1)
```
也可以选择
```c
int flag = x >> 31
return !(((~x & flag) + (x & ~flag)) >> (n + ~0));
```
解释一下，flag 要么全是 `0` 要么全是 `1`。然后保证要么 `(~x & flag)` 要么 `(x & ~flag)` 是 `0`，然后判断另外一个的 `n-1` 左边的比特位全是符号的取反。

## 第八题

除以 2^n 取整数。主要注意正负号和取整。取整方向要靠近数轴上的 0。

