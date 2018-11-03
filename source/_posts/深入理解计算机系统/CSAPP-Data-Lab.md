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

## 第一题 bitAnd

用 `~` 和 `|` 代替 `&` 操作。
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
  return ~(~x | ~y);
}
```

## 第二题 getByte

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

## 第三题 logicalShift

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
  return (x >> n) & ~(((0x1 << 31) >> n) << 1);
}
```
把全 1 也向右移动相同的位数，然后取与操作就可以把左边移动的比特全部改成 0。

## 第四题 bitCount

计算一个二进制中有多少个 1。那我就一位一位的挪动，然后和 1 相与，虽然很丑，但是能用。结果最后发现操作数超过题目的要求，那就参考了网上的分成 4 部分，然后汇总起来。感觉就是 map-reduce 的思想呀！:joy:

```c
/*
 * bitCount - returns count of number of 1's in word
 *   Examples: bitCount(5) = 2, bitCount(7) = 3
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 40
 *   Rating: 4
 */
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

## 第五题 bang

计算真假值的逆。也就是 `!x`。前提是不能使用 `!` 操作符号。

补码的作用就是对于计算机来说可以直接相加等于 0，所以除了 0 之外其他数字的补码和相反数的补码相加肯定等于 0，那么他们的符号位肯定不相同。只有 0 的相反数的补码和自身的补码最高位是相同的。

> 0x80000000 是人为规定的，它原本是 -0，但是人们规则用 +0 表示 0，为了不浪费就用 -0 表示最小数字。

```c
/*
 * bang - Compute !x without using !
 *   Examples: bang(3) = 0, bang(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int bang(int x) {
  return ((x | (~x + 1)) >> 31) + 1;
}
```

## 第六题 tmin

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

## 第七题 fitsBits

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
  return !(((x << (32 + ~n + 1)) >> (32 + ~n + 1)) ^ x);
}
```

## 第八题 divpwr2

除以 2^n 取整数。主要注意正负号和取整。取整方向要靠近数轴上的 0。
对于正数直接移位就可以，但是对于负数直接移位是有问题的，那会导致远离 0 的方向。所以需要加上 `x^n -1`，这就满足题目意思了。
首先得到符号位 `x >> 31`，然后得到 `2^n - 1` 也就是 `~((~0) << n)`。

```c
/*
 * divpwr2 - Compute x/(2^n), for 0 <= n <= 30
 *  Round toward zero
 *   Examples: divpwr2(15,1) = 7, divpwr2(-33,4) = -2
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 2
 */
int divpwr2(int x, int n) {
  int mask = x >> 31;
  int tmp = ~((~0) << n) & mask;    // 2^n -1
  return (x + tmp) >> n;
}
```

## 第九题 negate

取负数，这个前面已经用过了。

```c
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return (~x) + 1;
}
```

## 第十题 isPositive

判断是不是正数，那么先判断符号位，然后判断是不是等于 `0` 即刻。

```c
/*
 * isPositive - return 1 if x > 0, return 0 otherwise
 *   Example: isPositive(-1) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 8
 *   Rating: 3
 */
int isPositive(int x) {
  return !!x & !((x >> 31) & 1);
}
```

## 第十一题 isLessOrEqual

判断是不是小于等于。也就是 `x <= y`。需要注意溢出的情况。

- x、y 同号，不会溢出，直接用差的符号位来判断就可以。
- x、y 异号时，x 为负数返回 0，x 为正数是返回 1。

```c
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  int a = y + ~x + 1;    // y - x
  int b = (a >> 31) & 0x1;    // 差的符号
  int c = ((x ^ y) >> 31) & 0x1;    // 同号时等于 0，异号时等于 1
  int d = ((x >> 31) & 0x1);    // x 的符号位
  int e = !(x ^ y);
  return e | ((c ^ 1) & !b) | (c & d);
}
```

## 第十二题 ilog2

求 x 以 2 为底的对数，向下取整。本质就是找到最左的 1 所在的位置。
这里采用二分法。先移动 16 位，然后判断是不是大于 0。如果大于 0，说明 1 所在位置是大于 16 的；如果是等于 0，那么说明 1 所在位置是小于 16 的。
需要注意的地方是当 x 等于 0 的时候，应该加 1 才对。

```c
/*
 * ilog2 - return floor(log base 2 of x), where x > 0
 *   Example: ilog2(16) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 90
 *   Rating: 4
 */
int ilog2(int x) {
  int result = 0;
  result = ((!!(x >> 16)) << 4);
  result = result + ((!!(x >> (result + 8))) << 3);
  result = result + ((!!(x >> (result + 4))) << 2);
  result = result + ((!!(x >> (result + 2))) << 1);
  result = result + ((!!(x >> (result + 1))) << 0);
  result = result + !(x ^ 0);
  return result;
}
```

## 第十三题 float_neg

接下来的题目都是关于 [浮点数](/posts/25507/)。
如果是 `NaN` 则返回 `NaN`。否则把符号位取反就可以了。
判断是否为 `NaN`，则是通过阶码 `E` 全是 `1`，而尾码 `M` 不全是 `0` 来判断。

```c
/*
 * float_neg - Return bit-level equivalent of expression -f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representations of
 *   single-precision floating point values.
 *   When argument is NaN, return argument.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 10
 *   Rating: 2
 */
unsigned float_neg(unsigned uf) {
  int e_flag = 0x7F800000;
  int m_flag = 0x007FFFFF;
  if (!((uf & e_flag) ^ e_flag) && (uf & m_flag)) {
    return uf;
  }
  return uf ^ 0x80000000;
}
```

## 第十四题 float_i2f

实现 `int` 转化为 `float`。首先要知道浮点数的组成，符号位很好确定，直接取最左边的就可以了。然后为了简单，下面转化为绝对值，并且记录下来符号位。接下来计算左边有多少个 `0`，这样就知道指数位了。接下来就是比较复杂的尾码，这里复杂的地方是进位，对于浮点数向偶数的进位，我之前在 [浮点数](/posts/25507/#偶数进位) 讲过，这里简单的提一下。

{% note info %}
有效数字超出规定数位的多余数字是 `1001`，它大于超出规定最低位的一半（即 0.5），故最低位进 1。如果多余数字是 `0111`，它小于最低位的一半，则舍掉多余数字（截断尾数、截尾）即可。对于多余数字是 `1000`、正好是最低位一半的特殊情况，最低位为 0 则舍掉多余位，最低位为 1 则进位 1、使得最低位仍为 0（偶数）。
{% endnote %}

最后把阶码和尾码移动到相应的位置就可以了，并且加上进位和符号位。

```c
/*
 * float_i2f - Return bit-level equivalent of expression (float) x
 *   Result is returned as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point values.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned float_i2f(int x) {
  unsigned absx = x;
  unsigned sign = 0x0;
  unsigned flag = 0;
  unsigned count = 0;
  unsigned mask = 0x80000000;
  if (x == 0) {
    return 0;
  }
  if (x < 0) {
    absx = -x;
    sign = 0x80000000;
  }
  while (!(mask & absx)) {
    mask >>= 1;
    count += 1;
  }
  absx <<= count + 1;
  if (((absx & 0x1ff) > 0x100) || ((absx & 0x3ff) == 0x300)) {
    flag = 1;
  }
  return sign + (absx >> 9) + ((158 - count) << 23) + flag;
}
```

## 第十五题 float_twice

如果 `f` 是非格式化浮点数，保留符号位，并将 `f` 左移 `1` 位。
如果 `f` 是格式化浮点数，将 f 的指数位加 `1`。

```c
/*
 * float_twice - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned float_twice(unsigned uf) {
  unsigned f = uf;
  if ((f & 0x7f800000) == 0) {
    f = (f & 0x80000000) | ((f & 0x007fffff) << 1);
  } else if ((f & 0x7f800000) != 0x7f800000) {
    f += 0x00800000;
  }
  return f;
}
```

## 测试

实验自带了检测工具和测试工具。这个在实验的 [说明书](https://github.com/songouyang/csapp-labs/blob/master/datalab/datalab.pdf) 中都有说明。

### 安装依赖
在 Linux 下，如果出现下面的报错。

{% note danger %}
/usr/include/stdio.h:27:10: fatal error: bits/libc-header-start.h: No such file or directory
{% endnote %}

则是需要安装依赖。`apt install gcc-multilib` 就可以。

### 符号检查

首先检测有没有用过多的操作，或者违规的操作符号。

```sh
➜  datalab-handout git:(master) ✗ ./dlc -e bits.c
dlc:bits.c:143:bitAnd: 4 operators
dlc:bits.c:154:getByte: 3 operators
dlc:bits.c:165:logicalShift: 6 operators
dlc:bits.c:185:bitCount: 39 operators
dlc:bits.c:195:bang: 5 operators
dlc:bits.c:204:tmin: 1 operators
dlc:bits.c:216:fitsBits: 10 operators
dlc:bits.c:229:divpwr2: 7 operators
dlc:bits.c:239:negate: 2 operators
dlc:bits.c:249:isPositive: 6 operators
dlc:bits.c:264:isLessOrEqual: 18 operators
dlc:bits.c:281:ilog2: 31 operators
dlc:bits.c:300:float_neg: 6 operators
dlc:bits.c:335:float_i2f: 20 operators
dlc:bits.c:359:float_twice: 9 operators
```

### 程序检查

实验自带 Makefile，所以 make 一下就可以了。但是它默认开启了 `-O` 参数，导致会出现一些莫名其妙的错误。比如下面的：

{% note danger %}
ERROR: Test fitsBits(-2147483648[0x80000000],32[0x20]) failed...
...Gives 1[0x1]. Should be 0[0x0]
{% endnote %}

这个是编译器做了优化后，出现测试用例错误的情况[^1]。

然后还有进入死循环的 case，所以关闭编译器优化就好了。

{% note danger %}
ERROR: Test float_i2f failed.
  Timed out after 10 secs (probably infinite loop)
{% endnote %}

修改 Makefile 中的 `CFLAGS`，修改为 `-Wall -m32`。

最终全部通过测试。:rocket:

```sh
➜  datalab-handout git:(master) ✗ ./btest
Score	Rating	Errors	Function
 1	1	0	bitAnd
 2	2	0	getByte
 3	3	0	logicalShift
 4	4	0	bitCount
 4	4	0	bang
 1	1	0	tmin
 2	2	0	fitsBits
 2	2	0	divpwr2
 2	2	0	negate
 3	3	0	isPositive
 3	3	0	isLessOrEqual
 4	4	0	ilog2
 2	2	0	float_neg
 4	4	0	float_i2f
 4	4	0	float_twice
Total points: 41/41
```

[^1]: [gcc -O optimization: Help me understand the effect](https://stackoverrun.com/fr/q/9338188)
