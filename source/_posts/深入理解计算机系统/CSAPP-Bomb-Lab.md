---
title: CSAPP Bomb Lab
comments: true
mathjax: false
tags: CSAPP
categories: 练习
abbrlink: 39273
date: 2018-11-17 14:22:47
---

《深入理解计算机操作系统》的 Bomb Lab 实验。不要求会写汇编语言，但是需要读懂汇编语言。

<!--more-->

## 准备工作

官方提供了一份简明的 GDB 教程[^1]。
用 `objump` 将 `bomb` 程序反编译出来：
```sh
objdump -d bomb > bomb.asm
```
使用 `GDB` 的时候，加上 `-tui` 参数，并且使用 `layout asm` 命令就可以在调试的时候看到汇编代码。
![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979182.png)

## 第一关

进入 `GDB` 之后，首先打上断点，防止进入引爆炸弹。

```sh
(gdb) break explode_bomb
Breakpoint 1 at 0x40143a
(gdb) break phase_1
Breakpoint 2 at 0x400ee0
```
然后运行到断点处，其中会要你输入一个字符串，先暂时随便输入一个，为了运行到断点处。

```x86asm
0000000000400ee0 <phase_1>:
  400ee0:   48 83 ec 08             sub    $0x8,%rsp
  400ee4:   be 00 24 40 00          mov    $0x402400,%esi
  400ee9:   e8 4a 04 00 00          callq  401338 <strings_not_equal>
  400eee:   85 c0                   test   %eax,%eax
  400ef0:   74 05                   je     400ef7 <phase_1+0x17>
  400ef2:   e8 43 05 00 00          callq  40143a <explode_bomb>
  400ef7:   48 83 c4 08             add    $0x8,%rsp
  400efb:   c3                      retq
```

上面是 phase_1 的汇编代码，第二行把某个地址的值复制到 `esi` 中，然后调用了 `strings_not_equal` 函数，然后判断 `eax` 是不是 0，如果不是 0，就引爆炸弹。

先执行 `ni` 到 `400ee9`，然后 `si` 进入 `strings_not_equal` 函数。

```x86asm
0x40133c <strings_not_equal+4>  mov    %rdi,%rbx
0x40133f <strings_not_equal+7>  mov    %rsi,%rbp
```

`rdi` 和 `rsi` 是该函数的两个输入，可以打印两个值，看下分别是什么。

```sh
(gdb) x/s $rdi
0x603780 <input_strings>:       "ouyangsong"
(gdb) x/s $rsi
0x402400:       "Border relations with Canada have never been better."
```

可以看到 `rdi` 是我前面随便输入的一个字符串，通过这个函数的名字，可以猜测应该是比较两个字符串是不是相等，那就知道答案就是：

```
Border relations with Canada have never been better.
```

重新跑一遍测试一下第一关的答案。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979215.png)

可以看到没有进入 `explode_bomb` 函数，那就说明第一关已经通过了。
这里有个小技巧，如果上面的汇编错乱了，可以通过 `refresh` 命令刷新一下。

## 第二关

和第一关类似，首先设置断点在 `explode_bomb` 和 `phase_2`。

```x86asm
0000000000400efc <phase_2>:
  400efc:   55                      push   %rbp
  400efd:   53                      push   %rbx
  400efe:   48 83 ec 28             sub    $0x28,%rsp
  400f02:   48 89 e6                mov    %rsp,%rsi
  400f05:   e8 52 05 00 00          callq  40145c <read_six_numbers>
  400f0a:   83 3c 24 01             cmpl   $0x1,(%rsp)
  400f0e:   74 20                   je     400f30 <phase_2+0x34>
  400f10:   e8 25 05 00 00          callq  40143a <explode_bomb>
  400f15:   eb 19                   jmp    400f30 <phase_2+0x34>
  400f17:   8b 43 fc                mov    -0x4(%rbx),%eax
  400f1a:   01 c0                   add    %eax,%eax
  400f1c:   39 03                   cmp    %eax,(%rbx)
  400f1e:   74 05                   je     400f25 <phase_2+0x29>
  400f20:   e8 15 05 00 00          callq  40143a <explode_bomb>
  400f25:   48 83 c3 04             add    $0x4,%rbx
  400f29:   48 39 eb                cmp    %rbp,%rbx
  400f2c:   75 e9                   jne    400f17 <phase_2+0x1b>
  400f2e:   eb 0c                   jmp    400f3c <phase_2+0x40>
  400f30:   48 8d 5c 24 04          lea    0x4(%rsp),%rbx
  400f35:   48 8d 6c 24 18          lea    0x18(%rsp),%rbp
  400f3a:   eb db                   jmp    400f17 <phase_2+0x1b>
  400f3c:   48 83 c4 28             add    $0x28,%rsp
  400f40:   5b                      pop    %rbx
  400f41:   5d                      pop    %rbp
  400f42:   c3                      retq
```

这里有个 `read_six_numbers` 函数，意思就是读取 6 个数字。接下来开始验证想法，这里我们也是随便输入 6 个数字，比如 `1 2 3 4 5 6`。然后打断点到 `400f0a`。

```sh
(gdb) print $rsp
$1 = (void *) 0x7fffffffe3d0
(gdb) x/32xb $rsp
0x7fffffffe3d0: 0x01    0x00    0x00    0x00    0x02    0x00    0x00    0x00
0x7fffffffe3d8: 0x03    0x00    0x00    0x00    0x04    0x00    0x00    0x00
0x7fffffffe3e0: 0x05    0x00    0x00    0x00    0x06    0x00    0x00    0x00
0x7fffffffe3e8: 0x31    0x14    0x40    0x00    0x00    0x00    0x00    0x00
```
第 6 行将 `rsp` 和 1 比较，如果不相等就引爆炸弹，所以知道第一个数字就必须是 1 了。
然后跳转到 `<phase_2+0x34>` 也就是上面的第 20 行。这里 `rbx` 等于 `rsp + 0x4`，`rbp` 等于 `rsp + 0x18`，然后重新跳回 `<phase_2+0x1b>` 也就是第 11 行。
这里 `eax` 等于 `rbx - 0x4` 也就是等于 `rsp`，然后 `eax` 等于自己的两倍，接下来和 `rbx` 比较，前面看到 `rbx` 是 `rsp + 0x4`，就是移动了 4 位，也就是一个 int，所以 `rbx` 就是第 2 个输入，所以知道第 2 个输入是第一个输入的 2 倍。所以得到答案就是 `1 2 4 8 16 32` 了。 

## 第三关

```x86asm
0000000000400f43 <phase_3>:
  400f43:   48 83 ec 18             sub    $0x18,%rsp
  400f47:   48 8d 4c 24 0c          lea    0xc(%rsp),%rcx
  400f4c:   48 8d 54 24 08          lea    0x8(%rsp),%rdx
  400f51:   be cf 25 40 00          mov    $0x4025cf,%esi
  400f56:   b8 00 00 00 00          mov    $0x0,%eax
  400f5b:   e8 90 fc ff ff          callq  400bf0 <__isoc99_sscanf@plt>
  400f60:   83 f8 01                cmp    $0x1,%eax
  400f63:   7f 05                   jg     400f6a <phase_3+0x27>
  400f65:   e8 d0 04 00 00          callq  40143a <explode_bomb>
  400f6a:   83 7c 24 08 07          cmpl   $0x7,0x8(%rsp)
  400f6f:   77 3c                   ja     400fad <phase_3+0x6a>
  400f71:   8b 44 24 08             mov    0x8(%rsp),%eax
  400f75:   ff 24 c5 70 24 40 00    jmpq   *0x402470(,%rax,8)
  400f7c:   b8 cf 00 00 00          mov    $0xcf,%eax
  400f81:   eb 3b                   jmp    400fbe <phase_3+0x7b>
  400f83:   b8 c3 02 00 00          mov    $0x2c3,%eax
  400f88:   eb 34                   jmp    400fbe <phase_3+0x7b>
  400f8a:   b8 00 01 00 00          mov    $0x100,%eax
  400f8f:   eb 2d                   jmp    400fbe <phase_3+0x7b>
  400f91:   b8 85 01 00 00          mov    $0x185,%eax
  400f96:   eb 26                   jmp    400fbe <phase_3+0x7b>
  400f98:   b8 ce 00 00 00          mov    $0xce,%eax
  400f9d:   eb 1f                   jmp    400fbe <phase_3+0x7b>
  400f9f:   b8 aa 02 00 00          mov    $0x2aa,%eax
  400fa4:   eb 18                   jmp    400fbe <phase_3+0x7b>
  400fa6:   b8 47 01 00 00          mov    $0x147,%eax
  400fab:   eb 11                   jmp    400fbe <phase_3+0x7b>
  400fad:   e8 88 04 00 00          callq  40143a <explode_bomb>
  400fb2:   b8 00 00 00 00          mov    $0x0,%eax
  400fb7:   eb 05                   jmp    400fbe <phase_3+0x7b>
  400fb9:   b8 37 01 00 00          mov    $0x137,%eax
  400fbe:   3b 44 24 0c             cmp    0xc(%rsp),%eax
  400fc2:   74 05                   je     400fc9 <phase_3+0x86>
  400fc4:   e8 71 04 00 00          callq  40143a <explode_bomb>
  400fc9:   48 83 c4 18             add    $0x18,%rsp
  400fcd:   c3                      retq
```

在第 5 行调用 `sscanf` 函数之前，只有 `esi` 最有可能是字符串，那么将它打印出来。

```sh
(gdb) refresh
(gdb) ni
0x0000000000400f47 in phase_3 ()
(gdb) ni
0x0000000000400f4c in phase_3 ()
(gdb) ni
0x0000000000400f51 in phase_3 ()
(gdb) ni
0x0000000000400f56 in phase_3 ()
(gdb) x/s $esi
0x4025cf:       "%d %d"
(gdb) print $rcx
$1 = 140737488348156
(gdb) print $rdx
$2 = 140737488348152
```

所以知道它将会格式化 `%d %d` 的输入，那这两个输入就是 `rcx` 和 `rdx` 了。

第 8 行将 `sscanf` 函数的返回值（读取到多少个数）和 1 相比较，如果小于 1 就会引爆炸弹。
第 13 行中 `eax` 等于 `0x8 + rsp`，第 14 行中跳转到 `*0x402470`，这是 switch 语句，跳转到该处的指令位置。
每个分支都会有一个值赋值到 `eax` 上，我这里直接断点到最后比较的位置，也就是 33 行。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979249.png)

也就是要和 707 比较，所以如果第一个参数是 2 的话，那么第二个参数就是 707 了。
所以这一关的一种答案就是 `2 707`。

## 第四关

```x86asm
000000000040100c <phase_4>:
  40100c:   48 83 ec 18             sub    $0x18,%rsp
  401010:   48 8d 4c 24 0c          lea    0xc(%rsp),%rcx
  401015:   48 8d 54 24 08          lea    0x8(%rsp),%rdx
  40101a:   be cf 25 40 00          mov    $0x4025cf,%esi
  40101f:   b8 00 00 00 00          mov    $0x0,%eax
  401024:   e8 c7 fb ff ff          callq  400bf0 <__isoc99_sscanf@plt>
  401029:   83 f8 02                cmp    $0x2,%eax
  40102c:   75 07                   jne    401035 <phase_4+0x29>
  40102e:   83 7c 24 08 0e          cmpl   $0xe,0x8(%rsp)
  401033:   76 05                   jbe    40103a <phase_4+0x2e>
  401035:   e8 00 04 00 00          callq  40143a <explode_bomb>
  40103a:   ba 0e 00 00 00          mov    $0xe,%edx
  40103f:   be 00 00 00 00          mov    $0x0,%esi
  401044:   8b 7c 24 08             mov    0x8(%rsp),%edi
  401048:   e8 81 ff ff ff          callq  400fce <func4>
  40104d:   85 c0                   test   %eax,%eax
  40104f:   75 07                   jne    401058 <phase_4+0x4c>
  401051:   83 7c 24 0c 00          cmpl   $0x0,0xc(%rsp)
  401056:   74 05                   je     40105d <phase_4+0x51>
  401058:   e8 dd 03 00 00          callq  40143a <explode_bomb>
  40105d:   48 83 c4 18             add    $0x18,%rsp
  401061:   c3                      retq
```

和第三关类似，先到第 5 行看 `esi` 是什么字符串，也是下面 `sscanf` 函数的格式化参数。

```sh
(gdb) x/s $esi
0x4025cf:       "%d %d"
```

第 8 行同样比较读取到的数字的个数，如果不等于 2 则引爆炸弹。

第 10 行要求第 1 个参数小于 `0xe`，否则引爆炸弹。
```sh
(gdb) print * (int *)  ($rsp + 8)
$4 = 2
```

第 13 至 15 行，分别执行了 3 个赋值：`edx` 等于 `0xe`，`esi` 等于 `0x0`，`edi` 等于 `rsp`（也就是输入的第 1 个参数）。
然后调用了 `func4`，最后比较输出结果是不是 0，如果不是则引爆炸弹，所以需要 `func4` 的返回值 `eax` 等于 0。
根据函数参数的调用规则，大致应该是这样 `func4(x, 0, 14)`，其中 x 是输入的第 1 个参数。

```x86asm
0000000000400fce <func4>:
  400fce:   48 83 ec 08             sub    $0x8,%rsp
  400fd2:   89 d0                   mov    %edx,%eax
  400fd4:   29 f0                   sub    %esi,%eax
  400fd6:   89 c1                   mov    %eax,%ecx
  400fd8:   c1 e9 1f                shr    $0x1f,%ecx
  400fdb:   01 c8                   add    %ecx,%eax
  400fdd:   d1 f8                   sar    %eax
  400fdf:   8d 0c 30                lea    (%rax,%rsi,1),%ecx
  400fe2:   39 f9                   cmp    %edi,%ecx
  400fe4:   7e 0c                   jle    400ff2 <func4+0x24>
  400fe6:   8d 51 ff                lea    -0x1(%rcx),%edx
  400fe9:   e8 e0 ff ff ff          callq  400fce <func4>
  400fee:   01 c0                   add    %eax,%eax
  400ff0:   eb 15                   jmp    401007 <func4+0x39>
  400ff2:   b8 00 00 00 00          mov    $0x0,%eax
  400ff7:   39 f9                   cmp    %edi,%ecx
  400ff9:   7d 0c                   jge    401007 <func4+0x39>
  400ffb:   8d 71 01                lea    0x1(%rcx),%esi
  400ffe:   e8 cb ff ff ff          callq  400fce <func4>
  401003:   8d 44 00 01             lea    0x1(%rax,%rax,1),%eax
  401007:   48 83 c4 08             add    $0x8,%rsp
  40100b:   c3                      retq
```

运行到第 10 行，这里比较 `edi` 和 `ecx`，其中 `edi` 就是我们输入的第 1 个参数。
```sh
(gdb) print $ecx
$7 = 7
```
所以如果 `edi` 等于 7 的话，那么就会从 11 行然后跳到 22 行，最后退出。那就重新来测试，把第 1 个参数设置成 7。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979286.png)

再回来看 `phase_4` 函数的 19 行，这里比较第 2 个输入参数和 0 的大小，如果不等于 0，就引爆炸弹。那么就确定了第 2 个参数是 0 了。
所以这一关的答案就是 `7 0` 了。

## 第五关

```x86asm
0000000000401062 <phase_5>:
  401062:   53                      push   %rbx
  401063:   48 83 ec 20             sub    $0x20,%rsp
  401067:   48 89 fb                mov    %rdi,%rbx
  40106a:   64 48 8b 04 25 28 00    mov    %fs:0x28,%rax
  401071:   00 00
  401073:   48 89 44 24 18          mov    %rax,0x18(%rsp)
  401078:   31 c0                   xor    %eax,%eax
  40107a:   e8 9c 02 00 00          callq  40131b <string_length>
  40107f:   83 f8 06                cmp    $0x6,%eax
  401082:   74 4e                   je     4010d2 <phase_5+0x70>
  401084:   e8 b1 03 00 00          callq  40143a <explode_bomb>
  401089:   eb 47                   jmp    4010d2 <phase_5+0x70>
  40108b:   0f b6 0c 03             movzbl (%rbx,%rax,1),%ecx
  40108f:   88 0c 24                mov    %cl,(%rsp)
  401092:   48 8b 14 24             mov    (%rsp),%rdx
  401096:   83 e2 0f                and    $0xf,%edx
  401099:   0f b6 92 b0 24 40 00    movzbl 0x4024b0(%rdx),%edx
  4010a0:   88 54 04 10             mov    %dl,0x10(%rsp,%rax,1)
  4010a4:   48 83 c0 01             add    $0x1,%rax
  4010a8:   48 83 f8 06             cmp    $0x6,%rax
  4010ac:   75 dd                   jne    40108b <phase_5+0x29>
  4010ae:   c6 44 24 16 00          movb   $0x0,0x16(%rsp)
  4010b3:   be 5e 24 40 00          mov    $0x40245e,%esi
  4010b8:   48 8d 7c 24 10          lea    0x10(%rsp),%rdi
  4010bd:   e8 76 02 00 00          callq  401338 <strings_not_equal>
  4010c2:   85 c0                   test   %eax,%eax
  4010c4:   74 13                   je     4010d9 <phase_5+0x77>
  4010c6:   e8 6f 03 00 00          callq  40143a <explode_bomb>
  4010cb:   0f 1f 44 00 00          nopl   0x0(%rax,%rax,1)
  4010d0:   eb 07                   jmp    4010d9 <phase_5+0x77>
  4010d2:   b8 00 00 00 00          mov    $0x0,%eax
  4010d7:   eb b2                   jmp    40108b <phase_5+0x29>
  4010d9:   48 8b 44 24 18          mov    0x18(%rsp),%rax
  4010de:   64 48 33 04 25 28 00    xor    %fs:0x28,%rax
  4010e5:   00 00
  4010e7:   74 05                   je     4010ee <phase_5+0x8c>
  4010e9:   e8 42 fa ff ff          callq  400b30 <__stack_chk_fail@plt>
  4010ee:   48 83 c4 20             add    $0x20,%rsp
  4010f2:   5b                      pop    %rbx
  4010f3:   c3                      retq
```

第 9 和 10 行，看得出是验证输入的字符串的长度，必须是等于 6，那么就随便输入个 `abcdef`。
接着来到 14 行，根据前面的经验，`rbx` 应该就是我们的输入了。

```sh
(gdb) x/s $rbx
0x6038c0 <input_strings+320>:   "abcdef"
```

`movzbl`[^2] 将 `rax` 处的 1 个字节，并赋值到 `ecx` 中。
```sh
(gdb) print $ecx
$2 = 97
```
第 15 行，将 `cl`（就是上一步的结果 `ecx`）赋值到 `rsp` 处。
第 16 行，再将 `rsp` 处的结果赋值到 `rdx` 中。
第 17 行，取低 4 位放到 `edx` 中。
所以这 3 行就是取输入中的 `rax` 处的 1 个字节，并取低 4 位放到 `edx` 中。

第 18 行将 `rdx + 0x4024b0` 赋值到 `edx`，第 19 行将结果又赋值到 `rsp + 0x10 + rax` 处。
第 20 行把 `rax` 加一，并比较是不是等于 6，否则就继续循环。这里 `rax` 应该是下标，用来遍历输入字符串。
然后就调用字符串比较函数了。

综合起来，就是把输入的每个字节的低 16 位作为索引 `rdx`，然后把 `rdx + 0x4024b0` 的字节复制到 `rsp + 0x10` 处。

接下来看需要比较的字符串。
```sh
(gdb) x/s 0x40245e
0x40245e:       "flyers"
(gdb) x/s 0x4024b0
0x4024b0 <array.3449>:  "maduiersnfotvbylSo you think you can stop the bomb with ctrl-c, do you?"
```

那就在 `0x4024b0` 找出索引，我这里取 `9 15 14 5 6 7`，然后查看 ascii 码表，看低位等于这些数字的字符。
在命令行中使用 `man ascii` 就可以看到 ascii 表了。

```
00 nul   01 soh   02 stx   03 etx   04 eot   05 enq   06 ack   07 bel
08 bs    09 ht    0a nl    0b vt    0c np    0d cr    0e so    0f si
10 dle   11 dc1   12 dc2   13 dc3   14 dc4   15 nak   16 syn   17 etb
18 can   19 em    1a sub   1b esc   1c fs    1d gs    1e rs    1f us
20 sp    21  !    22  "    23  #    24  $    25  %    26  &    27  '
28  (    29  )    2a  *    2b  +    2c  ,    2d  -    2e  .    2f  /
30  0    31  1    32  2    33  3    34  4    35  5    36  6    37  7
38  8    39  9    3a  :    3b  ;    3c  <    3d  =    3e  >    3f  ?
40  @    41  A    42  B    43  C    44  D    45  E    46  F    47  G
48  H    49  I    4a  J    4b  K    4c  L    4d  M    4e  N    4f  O
50  P    51  Q    52  R    53  S    54  T    55  U    56  V    57  W
58  X    59  Y    5a  Z    5b  [    5c  \    5d  ]    5e  ^    5f  _
60  `    61  a    62  b    63  c    64  d    65  e    66  f    67  g
68  h    69  i    6a  j    6b  k    6c  l    6d  m    6e  n    6f  o
70  p    71  q    72  r    73  s    74  t    75  u    76  v    77  w
78  x    79  y    7a  z    7b  {    7c  |    7d  }    7e  ~    7f del
```

我这里取 `YonUVW`，只有低位满足条件就可以了。

## 第六关

```x86asm
00000000004010f4 <phase_6>:
  4010f4:   41 56                   push   %r14
  4010f6:   41 55                   push   %r13
  4010f8:   41 54                   push   %r12
  4010fa:   55                      push   %rbp
  4010fb:   53                      push   %rbx
  4010fc:   48 83 ec 50             sub    $0x50,%rsp
  401100:   49 89 e5                mov    %rsp,%r13
  401103:   48 89 e6                mov    %rsp,%rsi
  401106:   e8 51 03 00 00          callq  40145c <read_six_numbers>
```

这里又看到 `read_six_numbers` 函数，所以这一关的输入应该又是 6 个数字了。

```sh
(gdb) print *(int*)($rsp)
$11 = 1
(gdb) print *(int*)($rsp+0x4)
$12 = 2
(gdb) print *(int*)($rsp+0x8)
$13 = 3
(gdb) print *(int*)($rsp+0xc)
$14 = 4
(gdb) print *(int*)($rsp+0x10)
$15 = 5
(gdb) print *(int*)($rsp+0x14)
$16 = 6
```
输入的 6 个数字分别存在上面 6 个位置上。

```x86asm
  40110b:   49 89 e6                mov    %rsp,%r14
  40110e:   41 bc 00 00 00 00       mov    $0x0,%r12d
  401114:   4c 89 ed                mov    %r13,%rbp
  401117:   41 8b 45 00             mov    0x0(%r13),%eax
  40111b:   83 e8 01                sub    $0x1,%eax
  40111e:   83 f8 05                cmp    $0x5,%eax
  401121:   76 05                   jbe    401128 <phase_6+0x34>
  401123:   e8 12 03 00 00          callq  40143a <explode_bomb>
  401128:   41 83 c4 01             add    $0x1,%r12d
  40112c:   41 83 fc 06             cmp    $0x6,%r12d
  401130:   74 21                   je     401153 <phase_6+0x5f>
  401132:   44 89 e3                mov    %r12d,%ebx
  401135:   48 63 c3                movslq %ebx,%rax
  401138:   8b 04 84                mov    (%rsp,%rax,4),%eax
  40113b:   39 45 00                cmp    %eax,0x0(%rbp)
  40113e:   75 05                   jne    401145 <phase_6+0x51>
  401140:   e8 f5 02 00 00          callq  40143a <explode_bomb>
  401145:   83 c3 01                add    $0x1,%ebx
  401148:   83 fb 05                cmp    $0x5,%ebx
  40114b:   7e e8                   jle    401135 <phase_6+0x41>
  40114d:   49 83 c5 04             add    $0x4,%r13
  401151:   eb c1                   jmp    401114 <phase_6+0x20>
```

第 5 行将 `eax` 减去 1，然后和 5 比较，如果大于 5 就引爆炸弹，所以推出第一个数字必须小于等于 6。

第 2 行已经把 `r12d` 置为 0，然后第 9 行把 `r12d` 加上 1，然后和 6 比较，如果相等就进入下一步骤了。
第 12 行把 `r12d` 的值赋值给 `ebx`，然后又赋值给 `rax`。
第 14 行把 `rsp + rax * 4` 赋值给 `eax`，也就是输入的下一个值了。然后比较 `eax` 和 `rbp`（第一个输入值）。相等就引爆炸弹，所以两个值不能相等。
第 18 行 `rbx` 加 1，并与 5 比较，如果小于的话，跳回第 13 行来取栈里面的下一个值。这里是一个内循环，13 到 20 行说明后面的值都不能和目标值相等。
第 21 和 22 行则是外循环，用来取输入值并作为目标值。

综合起来就是，这 6 个数字都不能有相等的数字，并且都小于等于 6。

```x86asm
  401153:   48 8d 74 24 18          lea    0x18(%rsp),%rsi
  401158:   4c 89 f0                mov    %r14,%rax
  40115b:   b9 07 00 00 00          mov    $0x7,%ecx
  401160:   89 ca                   mov    %ecx,%edx
  401162:   2b 10                   sub    (%rax),%edx
  401164:   89 10                   mov    %edx,(%rax)
  401166:   48 83 c0 04             add    $0x4,%rax
  40116a:   48 39 f0                cmp    %rsi,%rax
  40116d:   75 f1                   jne    401160 <phase_6+0x6c>
```
将 `rsp + 0x18` 赋值给 `rsi`，将 `r14`（前面的 `rsp`，就是输入了）赋值给 `rax`。
将 `0x7` 赋值给 `ecx`，将 `ecx` 赋值给 `edx`。
然后将 `edx` 减去 `rax` 位置的值，所以就是 `7 - rax` 了。
然后 `rax` 指向下一个输入值了，直到最后一个输入值。

综合起来就是 `x = 7 - x`。

```x86asm
  40116f:   be 00 00 00 00          mov    $0x0,%esi
  401174:   eb 21                   jmp    401197 <phase_6+0xa3>
  401176:   48 8b 52 08             mov    0x8(%rdx),%rdx
  40117a:   83 c0 01                add    $0x1,%eax
  40117d:   39 c8                   cmp    %ecx,%eax
  40117f:   75 f5                   jne    401176 <phase_6+0x82>
  401181:   eb 05                   jmp    401188 <phase_6+0x94>
  401183:   ba d0 32 60 00          mov    $0x6032d0,%edx
  401188:   48 89 54 74 20          mov    %rdx,0x20(%rsp,%rsi,2)
  40118d:   48 83 c6 04             add    $0x4,%rsi
  401191:   48 83 fe 18             cmp    $0x18,%rsi
  401195:   74 14                   je     4011ab <phase_6+0xb7>
  401197:   8b 0c 34                mov    (%rsp,%rsi,1),%ecx
  40119a:   83 f9 01                cmp    $0x1,%ecx
  40119d:   7e e4                   jle    401183 <phase_6+0x8f>
  40119f:   b8 01 00 00 00          mov    $0x1,%eax
  4011a4:   ba d0 32 60 00          mov    $0x6032d0,%edx
  4011a9:   eb cb                   jmp    401176 <phase_6+0x82>
```

将 `esi` 重置为 0，然后跳转到第 13 行。从 `rsp` 的 `rsi` 位置取出一个字节，放到 `ecx` 处，然后比较 `ecx` 和 1 的大小。
因为我之前输入的第一个参数是 1，所以这里 `ecx` 是 6，那就大于 1 了，就跳转到第 16 行。
将 `eax` 赋值成 `0x1`，然后把 `0x6032d0` 赋值给 `edx`，然后跳转到第 3 行了。

```sh
(gdb) x /12xg $edx
0x6032d0 <node1>:       0x000000010000014c      0x00000000006032e0
0x6032e0 <node2>:       0x00000002000000a8      0x00000000006032f0
0x6032f0 <node3>:       0x000000030000039c      0x0000000000603300
0x603300 <node4>:       0x00000004000002b3      0x0000000000603310
0x603310 <node5>:       0x00000005000001dd      0x0000000000603320
0x603320 <node6>:       0x00000006000001bb      0x0000000000000000
```

这里是 `node` 也就是链表了，可以看后面部分是指向下一个节点的。那么第 3 行的意思就是 `p = p -> next`，移动 `ecx - 1` 次。
跳出循环后，进入第 9 行，移动 `rdx` 到 `rsp + 2 * rsi + 0x20` 处。
然后把下标 `rsi` 加 1，来指向下一位，重复上面的操作。

综合起来：你输入的值 n，会对应在链表上移动 n 位，然后取出这个节点，放到 `rsp + 2 * rsi + 0x20` 上。

```x86asm
  4011ab:   48 8b 5c 24 20          mov    0x20(%rsp),%rbx
  4011b0:   48 8d 44 24 28          lea    0x28(%rsp),%rax
  4011b5:   48 8d 74 24 50          lea    0x50(%rsp),%rsi
  4011ba:   48 89 d9                mov    %rbx,%rcx
  4011bd:   48 8b 10                mov    (%rax),%rdx
  4011c0:   48 89 51 08             mov    %rdx,0x8(%rcx)
  4011c4:   48 83 c0 08             add    $0x8,%rax
  4011c8:   48 39 f0                cmp    %rsi,%rax
  4011cb:   74 05                   je     4011d2 <phase_6+0xde>
  4011cd:   48 89 d1                mov    %rdx,%rcx
  4011d0:   eb eb                   jmp    4011bd <phase_6+0xc9>
  4011d2:   48 c7 42 08 00 00 00    movq   $0x0,0x8(%rdx)
```
把 `rsp + 0x20` 赋值给 `rbx`；把 `rsp + 0x28` 赋值给 `rax`；把 `rsp + 0x50` 赋值给 `rsi`。

```sh
(gdb) x/2 $rbx
0x603320 <node6>:       0x00000006000001bb      0x0000000000000000
```
这里验证了之前的想法，第 6 个 node 应该是最前面，目前它的子节点应该是空。

把 `rbx` 赋值给 `rcx`；把 `rax`（`rsp + 0x28`） 赋值给 `rdx`；把 `rdx` 赋值给 `rcx + 0x8`。
这里就是把下一个节点的位置，放到前一个节点的 next 指针上。
然后 `rax + 0x8` 就是取一下节点了，直到全部连起来了。
最后一行把最后的一个节点的 next 指针设置成 NULL。

综合起来：这一步，把所有节点全部重新按照之前的排序位置连起来了。

```x86asm
  4011d9:   00
  4011da:   bd 05 00 00 00          mov    $0x5,%ebp
  4011df:   48 8b 43 08             mov    0x8(%rbx),%rax
  4011e3:   8b 00                   mov    (%rax),%eax
  4011e5:   39 03                   cmp    %eax,(%rbx)
  4011e7:   7d 05                   jge    4011ee <phase_6+0xfa>
  4011e9:   e8 4c 02 00 00          callq  40143a <explode_bomb>
  4011ee:   48 8b 5b 08             mov    0x8(%rbx),%rbx
  4011f2:   83 ed 01                sub    $0x1,%ebp
  4011f5:   75 e8                   jne    4011df <phase_6+0xeb>
  4011f7:   48 83 c4 50             add    $0x50,%rsp
  4011fb:   5b                      pop    %rbx
  4011fc:   5d                      pop    %rbp
  4011fd:   41 5c                   pop    %r12
  4011ff:   41 5d                   pop    %r13
  401201:   41 5e                   pop    %r14
  401203:   c3                      retq
```

第 1 行把 `ebp` 赋值成 `0x5`。然后把 `rax` 赋值成 `rbx + 0x8`，因为 `rbx` 是第一个节点的位置，所以 `rax` 就是下一个节点的位置了。
接下来第 3 和 4 行就是比较第一个和下一个节点的大小，如果小于的话，就会引爆炸弹，意思就是最前面的最大咯，从大到小排序。
那我们要重新回到之前的 `0x6032d0` 处。上面写过这 6 个节点值，那就可以得到结果就是 `3 4 5 6 1 2`，因为之前不是进行了 `x = 7- x`，所以得到最终的输入应该是 `4 3 2 1 6 5`。

## 隐藏关卡

在汇编代码中还有函数叫做 `func7` 和 `secret_phase`，但是入口被隐藏了。搜索一下，发现只有 `phase_defused` 调用这个函数。

```x86asm
00000000004015c4 <phase_defused>:
  4015c4:   48 83 ec 78             sub    $0x78,%rsp
  4015c8:   64 48 8b 04 25 28 00    mov    %fs:0x28,%rax
  4015cf:   00 00
  4015d1:   48 89 44 24 68          mov    %rax,0x68(%rsp)
  4015d6:   31 c0                   xor    %eax,%eax
  4015d8:   83 3d 81 21 20 00 06    cmpl   $0x6,0x202181(%rip)        # 603760 <num_input_strings>
  4015df:   75 5e                   jne    40163f <phase_defused+0x7b>
  4015e1:   4c 8d 44 24 10          lea    0x10(%rsp),%r8
  4015e6:   48 8d 4c 24 0c          lea    0xc(%rsp),%rcx
  4015eb:   48 8d 54 24 08          lea    0x8(%rsp),%rdx
  4015f0:   be 19 26 40 00          mov    $0x402619,%esi
  4015f5:   bf 70 38 60 00          mov    $0x603870,%edi
  4015fa:   e8 f1 f5 ff ff          callq  400bf0 <__isoc99_sscanf@plt>
  4015ff:   83 f8 03                cmp    $0x3,%eax
  401602:   75 31                   jne    401635 <phase_defused+0x71>
  401604:   be 22 26 40 00          mov    $0x402622,%esi
  401609:   48 8d 7c 24 10          lea    0x10(%rsp),%rdi
  40160e:   e8 25 fd ff ff          callq  401338 <strings_not_equal>
  401613:   85 c0                   test   %eax,%eax
  401615:   75 1e                   jne    401635 <phase_defused+0x71>
  401617:   bf f8 24 40 00          mov    $0x4024f8,%edi
  40161c:   e8 ef f4 ff ff          callq  400b10 <puts@plt>
  401621:   bf 20 25 40 00          mov    $0x402520,%edi
  401626:   e8 e5 f4 ff ff          callq  400b10 <puts@plt>
  40162b:   b8 00 00 00 00          mov    $0x0,%eax
  401630:   e8 0d fc ff ff          callq  401242 <secret_phase>
  401635:   bf 58 25 40 00          mov    $0x402558,%edi
  40163a:   e8 d1 f4 ff ff          callq  400b10 <puts@plt>
  40163f:   48 8b 44 24 68          mov    0x68(%rsp),%rax
  401644:   64 48 33 04 25 28 00    xor    %fs:0x28,%rax
  40164b:   00 00
  40164d:   74 05                   je     401654 <phase_defused+0x90>
  40164f:   e8 dc f4 ff ff          callq  400b30 <__stack_chk_fail@plt>
  401654:   48 83 c4 78             add    $0x78,%rsp
  401658:   c3                      retq
  401659:   90                      nop
  40165a:   90                      nop
  40165b:   90                      nop
  40165c:   90                      nop
  40165d:   90                      nop
  40165e:   90                      nop
  40165f:   90                      nop
```

进去 `GDB` 之后，可以把之前的答案填进去了。`sol.txt` 文件内容如下：

```
Border relations with Canada have never been better.
1 2 4 8 16 32
2 707
7 0
YonUVW
4 3 2 1 6 5
```

```sh
(gdb) set args ./sol.txt
(gdb) show args
Argument list to give program being debugged when it is started is "./sol.txt".
(gdb) break phase_defused
Breakpoint 1 at 0x4015c4
```

把这个函数里面的几个常量打印出来，再根据 `num_input_strings` 的返回值和 6 比较，并且后面还有个 `strings_not_equal`，就大概可以猜到需要一个长度位 6 的字符串。并且 `0x402622` 就是一个长度是 6 的字符串，所以 `DrEvil` 应该就是输入了。

```sh
(gdb) x/s 0x402619
0x402619:       "%d %d %s"
(gdb) x/s 0x603870
0x603870 <input_strings+240>:   ""
(gdb) x/s 0x402622
0x402622:       "DrEvil"
```

这个可能就是在第 3 或者 4 关的答案上加上这个字符串，如果不加，那么长度就是 2，就不会进入了。那我就测试一下咯，发现是在第 4 关的答案后面加入该字符串。

然后开始看 `secret_phase` 的代码。

```x86asm
0000000000401242 <secret_phase>:
  401242:   53                      push   %rbx
  401243:   e8 56 02 00 00          callq  40149e <read_line>
  401248:   ba 0a 00 00 00          mov    $0xa,%edx
  40124d:   be 00 00 00 00          mov    $0x0,%esi
  401252:   48 89 c7                mov    %rax,%rdi
  401255:   e8 76 f9 ff ff          callq  400bd0 <strtol@plt>
  40125a:   48 89 c3                mov    %rax,%rbx
  40125d:   8d 40 ff                lea    -0x1(%rax),%eax
  401260:   3d e8 03 00 00          cmp    $0x3e8,%eax
  401265:   76 05                   jbe    40126c <secret_phase+0x2a>
  401267:   e8 ce 01 00 00          callq  40143a <explode_bomb>
  40126c:   89 de                   mov    %ebx,%esi
  40126e:   bf f0 30 60 00          mov    $0x6030f0,%edi
  401273:   e8 8c ff ff ff          callq  401204 <fun7>
  401278:   83 f8 02                cmp    $0x2,%eax
  40127b:   74 05                   je     401282 <secret_phase+0x40>
  40127d:   e8 b8 01 00 00          callq  40143a <explode_bomb>
  401282:   bf 38 24 40 00          mov    $0x402438,%edi
  401287:   e8 84 f8 ff ff          callq  400b10 <puts@plt>
  40128c:   e8 33 03 00 00          callq  4015c4 <phase_defused>
  401291:   5b                      pop    %rbx
  401292:   c3                      retq
  401293:   90                      nop
  401294:   90                      nop
  401295:   90                      nop
  401296:   90                      nop
  401297:   90                      nop
  401298:   90                      nop
  401299:   90                      nop
  40129a:   90                      nop
  40129b:   90                      nop
  40129c:   90                      nop
  40129d:   90                      nop
  40129e:   90                      nop
  40129f:   90                      nop
```

使用 `read_line` 函数读取输入，然后把返回值赋值给 `rdi`。接着使用了 `strtol` 函数来将字符串转化为长整数。返回值是 `rax`，又赋值给 `rbx` 了。
`eax` 等于 `rax` 减去 1，比较 `eax` 和 `0x3e8`，如果大于的话就会引爆炸弹。

接着把 `ebx` 也就是 `rax` 也就是我们的输入，赋值给 `esi`，然后把 `0x6030f0` 赋值给 `edi`，接下来使用了 `fun7` 函数。`fun7` 函数的结果应该等于 `0x2`，如果不等于就会引爆炸弹。

```x86asm
0000000000401204 <fun7>:
  401204:   48 83 ec 08             sub    $0x8,%rsp
  401208:   48 85 ff                test   %rdi,%rdi
  40120b:   74 2b                   je     401238 <fun7+0x34>
  40120d:   8b 17                   mov    (%rdi),%edx
  40120f:   39 f2                   cmp    %esi,%edx
  401211:   7e 0d                   jle    401220 <fun7+0x1c>
  401213:   48 8b 7f 08             mov    0x8(%rdi),%rdi
  401217:   e8 e8 ff ff ff          callq  401204 <fun7>
  40121c:   01 c0                   add    %eax,%eax
  40121e:   eb 1d                   jmp    40123d <fun7+0x39>
  401220:   b8 00 00 00 00          mov    $0x0,%eax
  401225:   39 f2                   cmp    %esi,%edx
  401227:   74 14                   je     40123d <fun7+0x39>
  401229:   48 8b 7f 10             mov    0x10(%rdi),%rdi
  40122d:   e8 d2 ff ff ff          callq  401204 <fun7>
  401232:   8d 44 00 01             lea    0x1(%rax,%rax,1),%eax
  401236:   eb 05                   jmp    40123d <fun7+0x39>
  401238:   b8 ff ff ff ff          mov    $0xffffffff,%eax
  40123d:   48 83 c4 08             add    $0x8,%rsp
  401241:   c3                      retq
```

第 2 和 3 行判断输入是不是 0，如果则返回 `0xffffffff`，不满足我们的要求，我们需要返回 2。

第 4 和 5 行比较我们的输入和 36 的大小，如果 `edx` 小于等于 `esi` 就跳转到第 12 行，我这里一开始随便输入了个 1，所以继续到第 8 行了。
然后取后 8 个字节，把 `eax` 乘以 2，然后就输出了。

```sh
(gdb) print $esi
$8 = 1
(gdb) print $edx
$9 = 36
```

接着考虑如果 `edx` 小于等于我们的输入，那么进入 12 行后，把 `eax` 变成 0，然后再次比较两个数，如果相等就返回了。如果不相等，就是 `edx` 小于我们的输入，那就进入了第 15 行，这里和前面的链表的结构类似。为了进入这里，我又重新开始了一边，这次我把输入设置成 40，这样就大于 36 了。

```sh
(gdb) x/128xg $rdi
0x6030f0 <n1>:  0x0000000000000024      0x0000000000603110
0x603100 <n1+16>:       0x0000000000603130      0x0000000000000000
0x603110 <n21>: 0x0000000000000008      0x0000000000603190
0x603120 <n21+16>:      0x0000000000603150      0x0000000000000000
0x603130 <n22>: 0x0000000000000032      0x0000000000603170
0x603140 <n22+16>:      0x00000000006031b0      0x0000000000000000
0x603150 <n32>: 0x0000000000000016      0x0000000000603270
0x603160 <n32+16>:      0x0000000000603230      0x0000000000000000
0x603170 <n33>: 0x000000000000002d      0x00000000006031d0
0x603180 <n33+16>:      0x0000000000603290      0x0000000000000000
0x603190 <n31>: 0x0000000000000006      0x00000000006031f0
0x6031a0 <n31+16>:      0x0000000000603250      0x0000000000000000
0x6031b0 <n34>: 0x000000000000006b      0x0000000000603210
0x6031c0 <n34+16>:      0x00000000006032b0      0x0000000000000000
0x6031d0 <n45>: 0x0000000000000028      0x0000000000000000
0x6031e0 <n45+16>:      0x0000000000000000      0x0000000000000000
0x6031f0 <n41>: 0x0000000000000001      0x0000000000000000
0x603200 <n41+16>:      0x0000000000000000      0x0000000000000000
0x603210 <n47>: 0x0000000000000063      0x0000000000000000
0x603220 <n47+16>:      0x0000000000000000      0x0000000000000000
0x603230 <n44>: 0x0000000000000023      0x0000000000000000
0x603240 <n44+16>:      0x0000000000000000      0x0000000000000000
0x603250 <n42>: 0x0000000000000007      0x0000000000000000
0x603260 <n42+16>:      0x0000000000000000      0x0000000000000000
0x603270 <n43>: 0x0000000000000014      0x0000000000000000
0x603280 <n43+16>:      0x0000000000000000      0x0000000000000000
0x603290 <n46>: 0x000000000000002f      0x0000000000000000
0x6032a0 <n46+16>:      0x0000000000000000      0x0000000000000000
0x6032b0 <n48>: 0x00000000000003e9      0x0000000000000000
0x6032c0 <n48+16>:      0x0000000000000000      0x0000000000000000
```
这里就是二叉树，前 8 个字节保存节点的值，中间 8 个字节是左子节点，然后的 8 个字节是右字节点，最后 8 个字节无用。
先把这个二叉树画出来，如图所示。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979329.png)

继续看代码，第 15 行代码的意思就是取右子节点，然后调用 `fun7`，最后返回 `rax + rax + 1`。
这里又可以解释前面那种情况了，就是取左子节点，然后乘以 2 返回。

综合起来：`rdi` 是个根节点。
- 输入等于根结点的大小，那就返回 0
- 输入小于根节点的话，那就移到左子节点，并返回 `2 * eax`
- 输入大于根节点，就移到右子节点，并返回 `2*eax + 1`

因为结果是 2，然后考虑到是递归，所以递归的倒数第一次应该返回 0，倒数第二次返回 2 * 0 + 1，倒数第三次（也就是第一次）返回 2 * 1。
所以应该是从根节点开来看，应该是先去左子节点，然后去右子节点，然后等于该节点，所以就是 `0x0000000000000016`。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979357.png)

上图验证 `fun7` 函数的输出是 2 满足题意。

## 总结

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1542979381.png)

感觉比本科学汇编时有趣多了，这种东西真是要实践才能感受。不然真的是云里雾里。在解决问题的同时去搜索相关知识点。在做这个实验的时候，参考了网上别人的解法，但是也发现了有些网上的解法解释的不对的地方。

[^1]: <https://csapp.cs.cmu.edu/3e/docs/gdbnotes-x86-64.pdf>
[^2]: [汇编语言之 movsbl 和 movzbl](http://blog.chinaunix.net/uid-26527046-id-4329313.html)
