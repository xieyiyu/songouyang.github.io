---
title: Tmux 常用命令小结
comments: true
mathjax: false
tags:
  - Tmux
categories: 工具
abbrlink: 20222
date: 2018-08-07 22:46:54
---

Tmux 绝对是在服务器工作的利器。Tmux 可以做到终端复用和随时随地断开或重新接入会话。

<!--more-->

## 好处

这里先介绍它的好处，已经它解决了什么问题。

1. 终端复用：开多个终端窗口的时候，再也不需要每次都 SSH 登陆一遍，并进入到工作目录。
2. 断开与连接：服务器上程序跑到一半，但是你突然要回家了。可以回家后重新接入会话，而不影响程序的运行。

## 安装

如果你有 ROOT 权限的话，直接包管理软件安装即可。

```sh
sudo apt install tmux
```

非常不幸，假如你没有 ROOT 权限，或者服务器上的 Tmux 版本太老，你需要安装自己的版本，可以拉源码在 HOME 目录安装。

```sh
mkdir .local
# install libevent
cd ~/.local
curl -LO https://github.com/libevent/libevent/releases/download/release-2.1.8-stable/libevent-2.1.8-stable.tar.gz
tar xzf libevent-2.1.8-stable.tar.gz && cd libevent-2.1.8-stable
./configure --prefix=$HOME/.local --disable-shared && make && make install
# install ncurses
cd ~/.local
curl -LO ftp://ftp.invisible-island.net/ncurses/ncurses.tar.gz
tar xzf ncurses.tar.gz && cd ncurses-6.1
./configure --prefix=$HOME/.local && make && make install
# install tmux
cd ~/.local
curl -LO https://github.com/tmux/tmux/releases/download/2.7/tmux-2.7.tar.gz
tar xzf tmux-2.7.tar.gz && cd tmux-2.7
./configure --prefix=$HOME/.local CFLAGS="-I$HOME/.local/include -I$HOME/.local/include/ncurses" LDFLAGS="-L$HOME/.local/lib -L$HOME/.local/include/ncurses -L$HOME/.local/include"
CPPFLAGS="-I$HOME/.local/include -I$HOME/.local/include/ncurses" LDFLAGS="-static -L$HOME/.local/include -L$HOME/.local/include/ncurses -L$HOME/.local/lib" make
make install
# add PATH
export PATH=$HOME/.local/bin:$PATH
```

然后添加 PATH，就可以 `tmux -V` 查看 Tmux 的版本号了。

## 配置

我的 [配置](https://github.com/songouyang/.tmux) 是在 [gpakosz](https://github.com/gpakosz/.tmux) 的基础上修改了自定义选项。该配置要求 tmux 的版本号至少为 `2.1`。

相比原版，开启了真彩色，使用 VIM 模式，将 prefix 修改成 Ctrl+a 等等。

## 使用

首先要理解 session、window 和 panel 的区别。session 是相当于开启了一个终端，window 相当于终端中的 tab，而 panel 就是每个 tab 中的分屏功能。

### 会话

启动新会话。

```sh
tmux [new -s test_session -n test_window]
```

恢复会话。

```sh
tmux at [-t test_session]
```

列出所有会话。

```sh
tmux ls
```

关闭会话。

```sh
tmux kill-session -t test_session
```

进入 tmux 中后对会话级别的操作。下面的操作都是需要先按 prefix 键。

`Ctrl-c` 启动新会话。
`Ctal-f` 查找会话。
`s` 列出所有会话。
`$` 重命名会话。

### 窗口

`c` 新建窗口。
`f` 查找窗口。
`<tab>` 最近使用的上一个窗口。
`&` 关闭窗口。
`Ctrl-h` 和 `Ctrl-l` 左右跳转窗口。

### 窗格

`-` 水平分割
`_` 垂直分割
`x` 关闭窗格。
`+` 最大化窗格。
`q` 显示窗格的编号，按下数字就可以选中窗格。
`HJKL` 四个方向调整窗格大小。
`hjkl` 四个方向跳转窗格。

### 其他操作

`m` 开启和关闭鼠标模式。开启后就可以用鼠标滚动屏幕和复制到缓冲区。
`r` 重新加载配置文件。
`<Enter>` 进入复制模式。
`b` 列出所有缓冲区。
`p` 粘贴最新的缓冲区。`P` 选择缓冲区粘贴。
