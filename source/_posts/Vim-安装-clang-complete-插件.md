---
title: Vim 安装 clang_complete 插件
comments: true
mathjax: false
tags: Vim
categories: 工具
abbrlink: 31237
date: 2018-09-14 23:51:48
---

[clang_complete](https://github.com/Rip-Rip/clang_complete) 是 Vim 上对 C 和 C++ 语言的补全插件。

<!--more-->

首先要保证 Vim 版本大于 7.3，并且需要支持 Python。

## 安装

```sh
git clone https://github.com/Rip-Rip/clang_complete.git && cd clang_complete
make && make install
```

## 配置

需要在 Vim 配置中增加 `clang_library_path`。在该路径下载可以找到 `libclang.{dll,so,dylib}`。

在 Mac 上安装 Brew 后就会安装 CommandLineTools，clang 的路径为：

```vim
let g:clang_library_path='/Library/Developer/CommandLineTools/usr/lib'
```

在 Linux 下首先要安装 libclang-dev，然后添加路径即可。

```sh
sudo apt install libclang-dev
```

然后在 `/usr/lib/` 找到 llvm 的路径即可。我这里是 6.0 版本。

```vim
let g:clang_library_path='/usr/lib/llvm-6.0/lib'
```

其他配置：

```vim
let g:clang_use_library = 1
```
