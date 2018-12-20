---
title: CSAPP Cache Lab
comments: true
mathjax: false
tags: CSAPP
categories: 练习
abbrlink: 55291
date: 2018-12-10 21:58:58
---

《深入理解计算机操作系统》的 Cache Lab 实验。Cache 的主要作用就是在 CPU 和主存起缓冲作用。本实验主要说明了缓存对 C 语言程序的性能的影响。

<!--more-->

本实验的手册下载地址：[cachelab.pdf](http://csapp.cs.cmu.edu/3e/cachelab.pdf)。

## Part A

这一部分需要模拟缓存的运行。也就是要仿造出一个 `csim-ref` 的程序。

首先定义好各种结构体。主要是参数存储 `Arguments`，缓存行 `CacheLine`，缓存组 `CacheSet`。缓存组就是一个装有缓存行的数组。

```c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <getopt.h>
#include "cachelab.h"

typedef struct arguments {
    int h;
    int v;
    int s;
    int E;
    int b;
    char * t;
} Arguments;

typedef struct cache_line {
    int valid_bit;
    int tag_bit;
    int times;
} CacheLine;

typedef CacheLine * CacheSet;
typedef CacheSet * Cache;
```

然后是解析程序传入的参数。这部分是采用 `getopt` 的库。细节可以参考 [课件](http://www.cs.cmu.edu/afs/cs/academic/class/15213-f15/www/recitations/rec07.pdf) 。需要注意的地方是 `hvs:E:b:t:`，这里一个冒号代表必须带参数，两个冒号代表参数可选，没有冒号代表没有参数[^1]。

```c
void get_args(Arguments * args, int argc, char ** argv) {
    int opt;
    while(-1 != (opt = getopt(argc, argv, "hvs:E:b:t:"))) {
        switch(opt) {
        case 'h':
            args->h = 1;
            break;
        case 'v':
            args->v = 1;
            break;
        case 's':
            args->s = atoi(optarg);
            break;
        case 'E':
            args->E  = atoi(optarg);
            break;
        case 'b':
            args->b = atoi(optarg);
            break;
        case 't':
            args->t = (char*)malloc(sizeof(char) * strlen(optarg));
            strcpy(args->t, optarg);
            break;
        default:
            fprintf(stderr, "wrong argument\n");
            exit(0);
            break;
        }
    }
}
```

如果传入的参数不对，或者传入了 `-h` 参数，那么打印帮助文档。

```c
void process_help(Arguments args) {
    if(args.h == 1 || args.s == -1 ||
            args.E  == -1 || args.b == -1 ||
            args.t == NULL) {
        FILE * fp = fopen("help.txt", "rt");
        char c;
        while(fscanf(fp, "%c", &c) != EOF) {
            putchar(c);
        }
        fclose(fp);
        exit(0);
    }
}
```

其中的 `help.txt` 的内容如下：

```
./csim: Missing required command line argument
Usage: ./csim [-hv] -s <num> -E <num> -b <num> -t <file>
Options:
  -h         Print this help message.
  -v         Optional verbose flag.
  -s <num>   Number of set index bits.
  -E <num>   Number of lines per set.
  -b <num>   Number of block offset bits.
  -t <file>  Trace file.

Examples:
  linux>  ./csim -s 4 -E 1 -b 4 -t traces/yi.trace
  linux>  ./csim -v -s 8 -E 2 -b 4 -t traces/yi.trace
```

用来记录的三个变量。`hit_count` 代表命中缓存的个数；`miss_count` 代表没有命中缓存的个数；`eviction_count` 代表缓存被覆盖的个数。

```c
int hit_count = 0;
int miss_count = 0;
int eviction_count = 0;
```

然后是初始化参数结构体。

```c
void init_args(Arguments * args) {
    args->h = 0;
    args->v = 0;
    args->s = -1;
    args->E = -1;
    args->b = -1;
    args->t = NULL;
}
```

初始化缓存结构体。

```c
void init_cache(Cache * cache, Arguments * args) {
    int set_size = 1 << args->s;
    int num_lines = args->E;
    *cache = (CacheSet *)malloc(sizeof(CacheSet) * set_size);
    for(int i =0; i<set_size; ++i) {
        (*cache)[i] = (CacheLine*)malloc(sizeof(CacheLine)*num_lines);
        for(int j = 0; j<num_lines; ++j) {
            (*cache)[i][j].valid_bit = 0;
            (*cache)[i][j].tag_bit = -1;
            (*cache)[i][j].times = 0;
        }
    }
}
```

一共有四种操作：`I M S L`，其中 `I` 可以不用管。`S` 和 `L` 分别是对应写和读，但是他两的过程是一样的，所以写成一个 `process` 函数。`M` 的话就是读和写两个过程，那么就是调用两次 `process` 函数。

```c
int main(int argc, char ** argv) {
    Arguments args;
    init_args(&args);
    get_args(&args, argc, argv);
    process_help(args);

    Cache cache;
    init_cache(&cache, &args);

    FILE * fp = fopen(args.t, "r");
    if(fp == NULL) {
        printf("%s: No such file or directory\n", args.t);
        exit(1);
    }
    char op;
    unsigned address;
    int size = -1;
    while(fscanf(fp, " %c %x,%d", &op, &address, &size) > 0) {
        if(size==-1) continue;
        switch(op) {
        case 'I':
            break;
        case 'M':
            if(args.v) printf("M, %x, %d", address, size);
            process(&cache, &args, address);
            process(&cache, &args, address);
            if(args.v) printf("\n");
            break;
        case 'L':
            if(args.v) printf("L, %x, %d", address, size);
            process(&cache, &args, address);
            if(args.v) printf("\n");
            break;
        case 'S':
            if(args.v) printf("S, %x, %d", address, size);
            process(&cache, &args, address);
            if(args.v) printf("\n");
            break;
        default:
            printf("Error: invalid operation.");
            exit(0);
        }
    }
    fclose(fp);
    printSummary(hit_count, miss_count, eviction_count);
    for(int i = 0; i<(1<<args.s); ++i) {
        free(cache[i]);
    }
    free(cache);
    return 0;
}
```

接下来看 `main` 函数中使用到的 `process` 函数，也是这个程序中最关键的函数吧。

```c
void process(Cache * cache, Arguments * args, int address) {
    address >>= args->b;
    int set_index = 0;
    int tag_bits, i;
    long mask = 0xffffffffffffffff >> (64 - args->s);
    set_index = mask & address;
    address >>= args->s;
    tag_bits = address;
    CacheSet set = (*cache)[set_index];
    for (i = 0; i < args->E; ++i) {
        if (set[i].valid_bit == 1) {
            set[i].times++;
        }
    }
    for (i = 0; i < args->E; ++i) {
        if (set[i].valid_bit == 1 && set[i].tag_bit == tag_bits) {
            if(args->v) printf(" hit");
            set[i].times = 0;
            ++hit_count;
            return;
        }
    }

    ++miss_count;
    if(args->v) printf(" miss");
    for (i = 0; i < args->E; ++i) {
        if (set[i].valid_bit == 0) {
            set[i].tag_bit = tag_bits;
            set[i].valid_bit = 1;
            set[i].times = 0;
            return;
        }
    }

    ++eviction_count;
    if(args->v) printf(" eviction");
    int max_index = 0, max_time = set[0].times;
    for (i = 0; i < args->E; ++i) {
        if (set[i].times > max_time) {
            max_index = i;
            max_time = set[i].times;
        }
    }
    set[max_index].tag_bit = tag_bits;
    set[max_index].times = 0;
}
```

首先明白一个地址从低位到高位分别是块偏移（b 位）、组索引（s 位）和标记（t 位）[^2]。
这就明白了前面几行的作用了，就是得到 `set_index` 和 `tag_bits`。
接下来的代码就是取出对应的缓存组。如果是有效的缓存行就把次数加 1，这是为了后面进行 LRU 淘汰。
然后找到与标记相同的缓存行，并打印 `hit`。
如果没有找到，那说明还没有得到有效的缓存，则打印 `miss` 并把这一样变成有效的缓存行。
如果即没有命中，也没有找到空闲的缓存行，说明已经满了，需要进行淘汰旧的缓存行了，那就找到 `time` 最大的，也就是最不常用的缓存行，把它淘汰了。

## Part B

这部分是利用分块技术[^3]加速矩阵逆转的运算。
这里需要对三个矩阵分别操作。这三个矩阵的大小分别是：`32×32` 和 `64×64` 以及 `61×67`。

### 矩阵一

题目给的 `cache` 大小是 2^5^ × 2^5^ = 1024 个字节，可以存下 256 个 int 数字。每一行 32 个数字，所以可以存下 8 行。

如果直接按照题目给的矩阵转置函数，写入 B 矩阵是逐列写入的。当第二次写的时候，B[8-15][0] 和上一次的 B[0-7][0] 使用的是同一个缓存组，那么会导致全部冲突不命中。这样的话写的 `miss` 就有 `32×32` 了，读的话还有强制不命中以及冲突不命中，所以肯定大于 300 了。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1545189977.png)

使用分块的思想，可以提高时间局部性和空间局部性。我们可以把每一块设置成缓存行的大小的整数倍，比如 `8×8` 或者 `16×16`。这里正好缓存可以存下 8 行，所以选用 `8×8` 的分块。因为可以存入 8 行，如果隔 8 行就会变成同一个缓存组，那样就又会出现冲突不命中了。可以利用 8 个变量，一次性把 8 个值都取出来。

假如分块不是对角，这样的分块共有 12 个。读和写分别是 8 个强制不命中。
假如分块是对角，这样的分块共有 4 个。当读完 A 的第一行，并写入到 B 的第一列后，缓存中放的是 B 矩阵对应的内容。当 A 开始读第二行的时候，会导致缓存中 B 的第二行被替换了。所以对角矩阵相比不是对角矩阵多了 7 次冲突不明中。
所以共有的冲突次数是：`12×(8+8) + 4×(8+8+7) = 284` 次。

```c
for (i = 0; i < N; i+=8) {
    for (j = 0; j < M; j+=8) {
        for(k=i; k<i+8; ++k) {
            a1 = A[k][j];
            a2 = A[k][j+1];
            a3 = A[k][j+2];
            a4 = A[k][j+3];
            a5 = A[k][j+4];
            a6 = A[k][j+5];
            a7 = A[k][j+6];
            a8 = A[k][j+7];

            B[j][k] = a1;
            B[j+1][k] = a2;
            B[j+2][k] = a3;
            B[j+3][k] = a4;
            B[j+4][k] = a5;
            B[j+5][k] = a6;
            B[j+6][k] = a7;
            B[j+7][k] = a8;
        }
    }
}
```

`test-trans` 程序需要依赖 `valgrind`。

```sh
sudo apt install valgrind
make
./test-trans -M 32 -N 32
```
然后查看 `miss` 的次数。

```sh
./csim-ref -v -s 5 -E 1 -b 5 -t trace.f0
hits:1766 misses:287 evictions:255
```

结果中 `miss` 的次数 287 和分析得出的 284 相差不多。

### 矩阵二

这里如果继续采用 `8×8` 会有问题，简单分析一下。我们之前说过，在第一个矩阵中缓存可以占到 8 行，所以如果是间隔了 8 行就会导致缓存组相同而导致冲突不命中。这里是每行 64 个数字，那么就意味着缓存只能到 4 行，之后的会就会冲突不命中，所以 B 中不是对角矩阵的写 `miss` 都可以达到 `56×8×8=3584`。而如果使用 `4×4` 的话就不能充分利用缓存组了。

这里参考了别人的思路[^4]，将 `8×8` 的矩阵用分治的思路去解决。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1545220510.png)

1. 先逐行处理 A 的上半部分，并且转置放到 B 的上半部分。其中左上角是正确转置的，右上角还没有处理完，待处理。
2. 把 B 的右上角的一行加载到中间变量，把 A 的左下角的一列加载到中间变量。把后四个变量放到 B 的右上角的一行，把前四个放到 B 的左下角的一行。
3. 把 A 右下角的分块逐行放到 B 右下角的每一列。
4. 重复执行 2 和 3 共四次。

第一步中：对于对角块来说，读不命中是 4，写不命中是 7；对于非对角块来说，读不命中是 4，写不命中是 4;
第二步中：对于对角块来说，读不命中是 4+2×3，写不命中是 4+4；对于非对角块来说，读不命中是 4，写不命中是 4；
第三步中：对于对角块来说，读不命中是 4，写不命中是 4+3；对于非对角来说，读不命中是 0，写不命中是 0;

所以总共的 `miss` 应该是这样的：

{% note success %}
8×(4+7+10+8+4+7) + 56×(4+4+4+4) = 1216
{% endnote %}

```c
for(i=0; i<N; i+=8) {
    for(j=0; j<M; j+=8) {
        for(k=j; k<j+4; ++k) {
            a1=A[k][i];
            a2=A[k][i+1];
            a3=A[k][i+2];
            a4=A[k][i+3];
            a5=A[k][i+4];
            a6=A[k][i+5];
            a7=A[k][i+6];
            a8=A[k][i+7];

            B[i][k]=a1;
            B[i][k+4]=a5;
            B[i+1][k]=a2;
            B[i+1][k+4]=a6;
            B[i+2][k]=a3;
            B[i+2][k+4]=a7;
            B[i+3][k]=a4;
            B[i+3][k+4]=a8;
        }
        for(k=i; k<i+4; ++k) {
            a1=B[k][j+4];
            a2=B[k][j+5];
            a3=B[k][j+6];
            a4=B[k][j+7];
            a5=A[j+4][k];
            a6=A[j+5][k];
            a7=A[j+6][k];
            a8=A[j+7][k];

            B[k][j+4]=a5;
            B[k][j+5]=a6;
            B[k][j+6]=a7;
            B[k][j+7]=a8;
            B[k+4][j]=a1;
            B[k+4][j+1]=a2;
            B[k+4][j+2]=a3;
            B[k+4][j+3]=a4;
        }
        for(k=i+4; k<i+8; ++k) {
            a1=A[j+4][k];
            a2=A[j+5][k];
            a3=A[j+6][k];
            a4=A[j+7][k];

            B[k][j+4]=a1;
            B[k][j+5]=a2;
            B[k][j+6]=a3;
            B[k][j+7]=a4;
        }
    }
}
```

测试得出的结果是 1219 个 `miss`。

### 矩阵三

这个条件比较松，直接用 `16×16` 的分块就好了。

```c
for(i=0; i<N; i+=16) {
    for(j=0; j<M; j+=16) {
        for(k=i; k<i+16&&k<N; ++k) {
            for(h=j; h<j+16&&h<M; ++h) {
                B[h][k] = A[k][h];
            }
        }
    }
}
```

测试得出的结果是 1992 个 `miss`。

## 总结

提交和打包代码。

```sh
➜  cachelab-handout git:(master) ✗ ./driver.py
Part A: Testing cache simulator
Running ./test-csim
                        Your simulator     Reference simulator
Points (s,E,b)    Hits  Misses  Evicts    Hits  Misses  Evicts
     3 (1,1,1)       9       8       6       9       8       6  traces/yi2.trace
     3 (4,2,4)       4       5       2       4       5       2  traces/yi.trace
     3 (2,1,4)       2       3       1       2       3       1  traces/dave.trace
     3 (2,1,3)     167      71      67     167      71      67  traces/trans.trace
     3 (2,2,3)     201      37      29     201      37      29  traces/trans.trace
     3 (2,4,3)     212      26      10     212      26      10  traces/trans.trace
     3 (5,1,5)     231       7       0     231       7       0  traces/trans.trace
     6 (5,1,5)  265189   21775   21743  265189   21775   21743  traces/long.trace
    27


Part B: Testing transpose function
Running ./test-trans -M 32 -N 32
Running ./test-trans -M 64 -N 64
Running ./test-trans -M 61 -N 67

Cache Lab summary:
                        Points   Max pts      Misses
Csim correctness          27.0        27
Trans perf 32x32           8.0         8         287
Trans perf 64x64           8.0         8        1219
Trans perf 61x67          10.0        10        1992
          Total points    53.0        53
```

这个实验消耗了我好几天时间，在这期间参考了大量别人的解法，一边做题一边查找资料和回顾。通过分析和计算 `miss` 的个数，让我对缓存有了更深入的理解。
我的答案下载地址：<https://gist.github.com/songouyang/9f20fa135574acc31063095bf5f9c682>

[^1]: [Linux下getopt()函数的简单使用](https://www.cnblogs.com/qingergege/p/5914218.html)
[^2]: [计算机缓存Cache以及Cache Line详解](https://zhuanlan.zhihu.com/p/37749443)
[^3]: [Using Blocking to Increase Temporal Locality](http://csapp.cs.cmu.edu/public/waside/waside-blocking.pdf)
[^4]: [深入理解计算机系统CacheLab-PartB实验报告](https://blog.codedragon.tech/2017/09/25/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9FCacheLab-PartB%E5%AE%9E%E9%AA%8C%E6%8A%A5%E5%91%8A/)
