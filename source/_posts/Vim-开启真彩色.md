---
title: Vim 开启真彩色
comments: true
mathjax: false
tags:
  - Vim
categories: 工具
abbrlink: 17062
date: 2018-11-28 00:01:28
---

在 Mosh，Tmux 的环境下，Vim8 使用真彩色配色。

<!--more-->

要使用真彩色，需要下面的都支持真彩色。

- 终端
- Mosh
- Tmux
- Vim
- 配色

## 终端

最重要的前提是终端就支持真彩色，可以参考这个 [TrueColour.md](https://gist.github.com/XVilka/8346728) 测试一下，测试终端是不是支持真彩色。
Mac 下的 iTerm 是支持真彩色的。

## Mosh

Mosh 的最新版支持真彩色，所以客户端和服务端的 Mosh 都安装 Git 仓库中最新版就可以了。

服务端我用的是 Debian，客户端我用的是 Mac。

### Debian

```sh
apt-get install protobuf-compiler libprotobuf-dev libutempter-dev libboost-dev libio-pty-perl libssl-dev pkg-config autoconf

git clone https://github.com/keithw/mosh.git
cd mosh
./autogen.sh
./configure
make
make install
```

### Mac

```sh
brew install protobuf
brew install boost
brew install pkg-config
brew install automake

git clone https://github.com/keithw/mosh.git
cd mosh
./autogen.sh
./configure
make
make install
```

## Tmux

Tmux 版本需要大于 `2.2` 才支持真彩色。
我是用的 Tmux 的配置是 [songouyang/.tmux](https://github.com/songouyang/.tmux)，开启真彩色配置也简单，开启下面的配置即可。

```tmux
tmux_conf_theme_24b_colour=true
```

## Vim

Vim 需要版本大于 `7.4` 才可以。然后在 `~/.vimrc` 添加下面配置即可。

```vim
if (has("termguicolors"))
  set termguicolors
endif
```

## 配色

最后还需要保证你使用的 colorscheme 是支持真彩色。我使用的是 [onedark.vim](https://github.com/joshdick/onedark.vim)。
使用这个主题的话，如果你的终端不支持真彩色，会发现全是蓝色。

![fail-color](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543415983.png)

这个时候可以把 Vim 配置中的 `set termguicolors` 去除就会回落到 256 色模式。会发现颜色比最终的真彩色的配色更鲜艳，并且背景色是更偏终端自带的黑色。

![256-color](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543416501.png)

## 最终成果

这是真彩色的最终成果。

![true-color](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1543416305.png)
