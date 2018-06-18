---
title: MAC 安装 BasicTeX
categories: 工具
comments: true
mathjax: false
abbrlink: 57080
date: 2018-04-02 21:39:48
tags: [Latex]
---

Latex 是个复杂但是很强大的排版工具，在 MAC 系统上如果不想安装 3G 大的 [MacTex](http://www.tug.org/mactex/) 的话，可以试试 BasicTex。

<!--more-->

## 安装

MacTex 安装包非常大，而且自带了很多图形应用。我更喜欢用命令行，所以我选择 BasicTex。使用 Homebrew 安装非常简单，一条命令即可。

```sh
brew cask install basictex
```

安装完还不能直接使用，还需要把 texlive 添加到环境变量中，才能找到相关的命令。

```sh
export PATH=/usr/local/texlive/2017basic/bin/x86_64-darwin:$PATH
```

然后就是安装相关的包，以及更新包。

```sh
sudo tlmgr update --self --repository http://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/tlnet
sudo tlmgr install latexmk --repository http://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/tlnet
```

安装包的时候推荐使用清华的 [CTAN 镜像](https://mirror.tuna.tsinghua.edu.cn/help/CTAN/)，不然的话下载速度慢地让你怀疑人生。

## 使用

下面编译一个简历 PDF，首先到网上找到喜欢的模板。比如我下载了 <https://github.com/billryan/resume> 这个模板。进入文件夹，执行下面的命令就可以编译了。

```sh
xelatex resume-zh_CN.tex
```

如果编译失败，提示说缺少某些包。比如：

```sh
! LaTeX Error: File `nth.sty' not found.
```

那么去搜索一下它被包含在哪个包中，比如 [nth.sty](https://ctan.org/pkg/nth) 就是包含在 gen­misc 中。那么使用 `tlmgr` 安装即可。

```sh
sudo tlmgr install gen­misc
```

