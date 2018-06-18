---
title: Anaconda 的安装与常用命令
categories: 工具
comments: true
tags:
  - Python
  - Anaconda
abbrlink: 44264
date: 2017-12-28 12:05:21
---

Anaconda 包含 Python 解释器以及数据处理常用的第三方库，可以非常方便地搭建 Python 环境。同时还自带了 Conda 用来管理第三方库，类似 Pip，但是比 Pip 方便。建议使用 Anaconda 替换自带的 Python，并且全部用户都可以使用 Anaconda。

<!--more-->

## 安装

首先去官网下载对应操作平台的[安装包](https://www.anaconda.com/download/#macos)，推荐使用国内的镜像源 Tuna [下载](https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/?C=M&O=D)。如果觉得不喜欢 Anaconda 自带的第三方包，可以选择 [Miniconda](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/?C=M&O=D)。

### Linux

为了使所有用户都使用 Anaconda 自带的 Python，不能把 Anaconda 安装到默认的当前用户的 Home 目录。推荐安装到 `/opt` 目录。

```sh
bash Miniconda3-latest-Linux-x86_64.sh -p /opt/miniconda3
```

接下来需要修改全局的环境变量，以 root 用户执行如下命令。

```sh
echo 'PATH=/opt/miniconda3/bin:$PATH' >> /etc/profile.d/miniconda.sh
source /etc/profile
```
### OSX

Mac 安装 Anaconda 和 Linux 类似，但是还可以额外使用 [Brew](https://brew.sh) 命令安装。

```sh
# 添加 Homebrew-Cask 源
brew tap caskroom/cask
brew cask install miniconda
```

然后修改用户的环境变量，添加下面设置到 `.zshrc` 中。

```sh
export PATH="/usr/local/miniconda3/bin:$PATH"
# 如果使用的是 Bash，相应的修改 .bashrc
source ~/.zshrc
```

## 使用

首先验证下 Anaconda 是否安装成功。

```sh
which python
which conda
```

如果输入的路径就是上一步指定的路径，那么就是安装成功。

### 虚拟环境管理

针对不同的项目，建议给每个项目创建一个虚拟环境，以防相互影响。

```sh
# 创建虚拟环境
conda create --name mytest
# 查看所有环境
conda env list
# 激活环境
source activate mytest
# 取消环境
source deactivate mytest
# 删除环境
conda remove --name mytest --all
```

### 第三方库管理

之前说了 Conda 是类似 Pip 的包管理命令。不过自带的包比较少，所有很多包搜索不到，这里推荐添加第三方的源 [Conda Forge](https://conda-forge.org/)。

```sh
conda config --add channels conda-forge
conda install <package-name>
# -n 指定环境名字，-c 指定安装源
conda install -n mytest jieba
```

