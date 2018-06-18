---
title: Chromebook（XE303C12）安装 ArchLinux
categories: 工具
comments: true
mathjax: false
tags:
  - Linux
abbrlink: 50132
date: 2018-05-13 13:31:38
---

之前低价收到一个三星的 Chromebook，型号是 XE303C12。这几天想把它的系统改成 Linux，毕竟 ChromeOS 上的应用太少了。因为这个本子的 CPU 是 ARM 芯片，所以网上的资料少点，而且内核都是用谷歌提供的 3.8 版本的内核，只看到 ArchLinux 上有 4.16 版本的内核，所以决定安装 ArchLinux。

<!--more-->

## 简介

这个 Chromebook 的配置，至少比同价位的买的树莓派的配置高的多了。

## 安装到 U 盘

首先本子目前是 ChromeOS，如果你想安装成 Linux 的话，先要把 Linux 安装到 U 盘，所有先准备一个 U 盘插入到 Chromebook 上。

### 开发者模式

关机，在开机的时候按住 ESC + Refresh + Power 三个键。在 Recovery 界面按 Ctrl + D，然后就会提示按 Enter 开启开发者模式。

### 外部启动

为了后面的从 U 盘启动，这里先要开启从外部启动。当你开启了开发者模式后，进入到系统，然后按 Ctrl + Alt + T 就会打开一个终端，敲 `shell` 就能进入 Bash，然后 `sudo su` 获取 root 权限。开启外部启动：

```sh
crossystem dev_boot_usb=1 dev_boot_signed_only=0
```

重启后就能生效，你重启后可以敲 `crossystem` 验证之前的设置是不是成功了。

### 制作启动盘

这里我用 U 盘做启动盘，安装方法参考官方给的[教程](https://archlinuxarm.org/platforms/armv7/samsung/samsung-chromebook)。

## 安装到系统

上面的步骤还保留了 ChromeOS，Linux 只是安装到 U 盘而已，我要把 ChromeOS 彻底替换成 ArchLinux，还要把 ArchLinux 安装到系统盘上。也就是 mmcblk0。因为 ArchLinux 没有 `cgpt` 命令，还要自行安装。

```sh
pacman -S cgpt
```
    
把安装到 U 盘的教程中的 `/dev/sda` 替换成 `mmcblk0`，把 `/dev/sda1` 替换成 `mmcblk0p1`，把 `/dev/sda2` 替换成 `mmcblk0p2`。关机，拔下 U 盘，启动就可以进入 ArchLinux 了。

## 更新

Arch 的特点就是滚动更新，拿到之后最好隔一小段时间就更新一下。更新前最好换成国内的镜像源，我是用的是中科大的[镜像源](https://lug.ustc.edu.cn/wiki/mirrors/help/archlinuxarm)。

```sh
pacman -Syyu
```

我这里更新忽略关于系统的升级，因为我升级后就不能开机了。

编辑 `/etc/pacman.conf` 文件，修改如下：

```sh
IgnorePkg   = linux-armv7 linux-armv7-chromebook linux-firmware
```

安装软件包组 `base-devel`，解决编译依赖问题。

```sh
pacman -S base-devel
```

## 语言

默认的话你会发现 TTY 不能显示中文，需要设置 locale。修改 `/etc/locale.gen` 文件，取消注释下面两行。

```sh
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```

然后重新生成一下区域信息。

```sh
locale-gen
```

接下来全局配置一下 `/etc/locale.conf` 文件。

```sh
LANG=en_US.UTF-8
```

或者不用全局配置，在 `.zshrc` 中配置也可以。

```sh
export LC_ALL=zh_CN.UTF-8
export LANG=zh_CN.UTF-8
```

## 时间

改成上海的时区。

```sh
timedatectl set-timezone Asia/Shanghai
```

开启网络对时功能。

```sh
timedatectl set-ntp true
```

## 添加用户

默认用户和密码都是 root，肯定不方便后续使用。

```sh
useradd -m -g 初始用户组 -G 额外用户组 -s 登陆shell 用户名
useradd -m -g users -G wheel -s zsh ouyangsong
```

别忘了给它设置密码。

安装 sudo 后，把 wheel 组都改成免密码使用 sudo 权限。编辑 `/etc/sudoer`，取消注释下面两行。

```sh
%wheel ALL=(ALL) ALL
%wheel ALL=(ALL) NOPASSWD: ALL
```

## 硬盘休眠

我把一个旧硬盘挂载到 Chromebook 上，当硬盘不使用的时候，需要让硬盘休眠，延长硬盘使用寿命。安装 hdparm 即可。设置 10 分钟空闲就休眠。

新建一个服务 `/etc/systemd/system/hdparm.service`。

```sh
[Unit]
Description=hdparm sleep

[Service]
Type=oneshot
ExecStart=/usr/bin/hdparm -q -S 120 -y /dev/sdb

[Install]
WantedBy=multi-user.target
```

然后设置开机自启动即可。

## 网络

使用 `wifi-menu` 命令就可以连无线网。因为我主要是远程登陆，所以还需要安装 openssh，这样就可以通过学校局域网 IP 登陆了。

![Chromebook-ArchLinux](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfgkyho8oj217k0u2ah9.jpg "screenfetch 截图")

开机自动登陆 wifi。首先使用 wifi-menu 手动成功登陆，会自动生成一套配置文件。然后安装相关的包。

```sh
pacman -S netctl wpa_actiond
```

查看 `/etc/netctl` 确认是否已经生成了 wifi 配置文件。

```console
[root@alarm ~]# ls /etc/netctl/
examples  hooks  interfaces  mlan0-czxxxxxxxxxx
[root@alarm ~]# cat /etc/netctl/mlan0-czxxxxxxxxxx
Description='Automatically generated profile by wifi-menu'
Interface=mlan0
Connection=wireless
Security=wpa
ESSID=czxxxxxxxxxx
IP=dhcp
Key=password
```

连接 wifi 的命令。

```sh
systemctl start netctl-auto@mlan0.service
```

开机自动连接 wifi 的命令。

```sh
systemctl enable netctl-auto@mlan0.service
```

安装网络相关的包。

```sh
pacman -S net-tools dnsutils inetutils iproute2
```

ifconfig、route 在 net-tools 中，nslookup、dig 在 dsnutils 中，ftp、telnel 在 inetutils 中，ip 命令在 iproute2 中。

还有一个问题就是合上盖子后，网络就断了，这里需要编辑 Login Manager 的配置。

编辑 `/etc/systemd/logind.conf` 文件，修改如下：

```sh
#HandleLidSwitch=suspend
```
改成如下：

```sh
HandleLidSwitch=ignore
```
这样就可以合上盖子，安心的做一个「高配树莓派」了。
