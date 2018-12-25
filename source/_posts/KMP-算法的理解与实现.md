---
title: KMP 算法的理解与实现
comments: true
mathjax: false
tags: KMP
categories:
  - 算法
abbrlink: 13016
date: 2018-12-25 11:18:26
---

KMP 是 Knuth-Morris-Pratt 的简称，是用来做字符串匹配的算法。

<!--more-->

## 使用部分匹配表

我使用的字符串例子来自 [The Knuth-Morris-Pratt Algorithm in my own words](http://jakeboxer.com/blog/2009/12/13/the-knuth-morris-pratt-algorithm-in-my-own-words/) 。
现在假设需要在 `str1` 中搜索 `str2`：

```
const char *str1 = "bacbababaabcbab";
const char *str2 = "abababca";
```

那么首先计算出部分匹配表，关于如何计算可以看下面的部分，这里先使用。

| a | b | a | b | a | b | c | a |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 1 | 2 | 3 | 4 | 0 | 1 |

现在开始匹配。假设 `str1[1]` 已经匹配到 `a` 了，发现 `c` 和 `b` 没有匹配上。那就查表，发现 `table[1-1]` 等于 0，所以直接跳过。重新匹配。

```
bacbababaabcbab
 |
 abababca
```

现在匹配到 5 个相同的前缀了。第 6 个数字不相同，那么 KMP 算法的精髓就是充分利用已经匹配过的东西。所以查表，`table[5-1]` 等于 3，那么就直接跳过 `5-3=2` 个字符。 

```
bacbababaabcbab
    |||||
    abababca
```

跳过两个字符后。接下来相同的操作继续比较。因为第 4 个字符还是不相同，那么继续查表，`table[4-1]` 等于 2，所以直接跳过 `4-2=2` 个字符。 

```
bacbababaabcbab
    xx|||
      abababca
```

继续跳过两个字符后，得到的结果如下。这个时候还不匹配的话，那就相同于重新匹配了。

```
bacbababaabcbab
      xx|
        abababca
```

通过上面的例子，可以很清楚的理解**部分匹配表**是怎么使用的了。

## 计算部分匹配表

这一部分，是将上面部分使用的部分匹配表是如何计算得来的。首先要明白前缀和后缀的概念。
我这里使用的图片来自 [KMP 算法详解（CPP 实现）](https://blog.csdn.net/kiss0tql/article/details/81416283)，因为它的图片是我所能找到的最直观的图例。

{% note info %}
前缀是除去最后一个字符之外的全部头部组合。
后缀是除去第一个字符之外的全部头部组合。
比如 `abc` 的前缀有 `a` 和`ab`；后缀有 `c` 和 `bc`。
{% endnote %}

部分匹配表很多人称之为 `next` 数组，那我这里也同样采用这样的叫法。假设我已经得到 `next[0]` 到 `next[i-1]`，接下来需要求 `next[i]`。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1545710127.png)

假设 `str1` 中下标为 `next[i-1]` 和 `i` 的字符相等，那么很明显，`next[i]` 等于 `next[i-1]+1`。

![](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1545710385.png)

假设 `str1` 中下标为 `next[i-1]` 和 `i` 的字符不相等，那么需要把下标 0 到 `next[i-1]` 这部分的字符串切割。还是要尽量利用匹配过的字符串，那么切割到下标为 `next[next[i-1]-1]`。这一部分花了我较长的时间才理解。

首先要记住 `next` 数组存的是最长的匹配，在图中 `next[i-1]` 等于 5，也就是说 `str1` 中前 `i-1` 的字符串中最长的匹配是 5。切分前 5 个时候为了尽量保证匹配，那么需要找到红黄的组合，因为匹配是「对称的」，所以还能尝试的下一个最长的匹配长度就是 `next[5]`，也就是 `next[next[i-1]-1]` 了。

重复上面的做法，一直到长度等于 1，就开始从头开始匹配了。

## 算法实现

C++ 实现的 KMP 算法。

```cpp
int kmp(const string &str1, const string &str2) {
    if (str2.empty()) return 0;
    vector<int> next(str2.size(), 0);
    for (int i = 1, k = 0; i < str2.size(); ++i) {
        while (k && str2[k] != str2[i]) k = next[k - 1];
        if (str2[k] == str2[i]) ++k;
        next[i] = k;
    }

    for (int i = 0, k = 0; i < str1.size(); ++i) {
        while (k && str2[k] != str1[i]) k = next[k - 1];
        if (str2[k] == str1[i]) ++k;
        if (k == str2.size()) return i - k + 1;
    }
    return -1;
}
```
