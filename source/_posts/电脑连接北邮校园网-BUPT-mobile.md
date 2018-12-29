---
title: 电脑连接北邮校园网 BUPT-mobile
comments: true
mathjax: false
tags:
  - 校园网
  - 北邮
categories: 方案
abbrlink: 57565
date: 2018-12-29 21:02:36
---

本文将记录电脑端如何连接北邮的校园网 BUPT-mobile。在苹果电脑的 macOS，联想电脑的 WIN10 系统和 Chromebook 的 ArchLinux 系统三种系统上的连接和免费使用 BUPT-mobile 无线校园网。

<!--more-->

随着北邮西土城路校区无线校园网络覆盖工程的完成，全校已经覆盖了千兆校园网。无线校园网 SSID 为 BUPT-mobile、BUPT-portal 和 BUPT-guest，支持 802.11a/b/g/n/ac 无线协议，支持 2.4GHz 和 5GHz[^3]。

其中 BUPT-mobile 是不需要登陆校园网网关的，也就是不会计费，但是为了保证用户体验，防止带宽的浪费，学校已经把这个网络禁止了 P2P，所以「迅雷」这种吸血虫可以闪一边了。

学校推出 BUPT-mobile，是为了让移动设备连接使用，所以限制了桌面设备，导致有些电脑虽然连接了，但是不会分别 IP。但是有人已经分析出了，学校是根据 MAC 地址来限制的，所以只需要修改 MAC 地址[^1]就可以达到桌面设备也能免费使用 BUPT-mobile。

只需要按照下面的规律修改 MAC 地址即可：

{% note info %}
第二个字符必须为 2、6、A、E 其中之一，其他的位置只需要是 0 - F，因为 MAC 地址用 16 进制来表示。
{% endnote %}

修改 MAC 地址后，不要再去连接 BUPT-portal 了！，否则你的 MAC 地址就失效了，又要重新修改了。

## 苹果电脑

苹果电脑使用的是 macOS，基于 FreeBSD，所以和 Linux 修改 MAC 地址类似[^6]。首先用 `ifconfig` 命令查看使用的是哪个网卡。

![macOS ifconfig](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1546089706.png)

一般是使用 `en0` 网卡，可以看到我的 IP 是分配到 `en0` 网卡上的。那就用下面的命令修改 MAC 地址。

```sh
sudo ifconfig en0 ether XX:XX:XX:XX:XX:XX
```

然后关闭无线网络，再启动即可。

注：我 MAC 地址的第二位是 4，不知道为啥也能免费使用，嘻嘻。

## 联想电脑

我的联想电脑安装的是 WIN10 系统。因为 WIN 电脑的驱动不统一，你可以参考 [笔记本电脑连接 BUPT-mobile 大型综合教程](http://tieba.baidu.com/p/4480440101?see_lz=1) 这个帖子，也可以参考我的，不行的话查查 Google 如何修改你的网卡的 MAC 地址。

我的无线网卡的驱动自带了修改 MAC 地址的功能。只需要在设备管理器中找到网络适配器，然后找到无线网卡的驱动属性，进行修改，最后重启电脑即可。

![设备管理器](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1546091030.png)

![网络适配器](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1546091072.png)

## Chromebook

闲鱼上收的一台 Chromebook 电脑，我给它安装了 ArchLinux 系统[^2]。
这个话不需要修改 MAC 地址就可以，可能它和移动设备很类似么？具体也不清楚。

![ArchLinux ifconfig](https://res.cloudinary.com/ouyangsong/image/upload/q_auto/1546090205.png)

和 macOS 类似，查看到我用的是 `mlan0` 网卡。之前我的折腾记录说过，我在这台机器中用的是 `netctl` 命令在命令行中连接无线网络的，这里也是同样的[^4][^5]。
在 `/etc/netctl` 文件夹中新建 `mlan0-BUPT-mobile` 文件[^7]。文件内容如下：

```ini
Description='BUPT-mobile'
Interface=mlan0
Connection=wireless
Security=wpa-configsection
ESSID=BUPT-mobile
IP=dhcp
WPAConfigSection=(
    'ssid="BUPT-mobile"'
    'priority=1'
    'proto=RSN'
    'key_mgmt=WPA-EAP'
    'pairwise=CCMP'
    'auth_alg=OPEN'
    'eap=PEAP'
    'identity="你的学号"'
    'password="你的密码"'
    'phase1="peaplabel=0"'
    'phase2="auth=MSCHAPV2"'
)
```

然后连接测试一下。

```sh
sudo systemctl start netctl-auto@mlan0.service
```

并设置开机就自动连接 BUPT-mobile。

```sh
sudo systemctl enable netctl-auto@mlan0.service
```

## 总结

如果还不能连接 BUPT-mobile 的话，用 `ifconfig` 看看 MAC 地址是不是修改成功了。或者换一个 MAC 地址，可以把手机的 MAC 地址稍微改改。

[^1]: [笔记本电脑连接BUPT-mobile大型综合教程](http://tieba.baidu.com/p/4480440101?see_lz=1)
[^2]: [Chromebook（XE303C12）安装 ArchLinux](https://www.ouyangsong.com/posts/50132/)
[^3]: [BUPT-mobile无线网络连接与认证](https://www.jianshu.com/p/ee9fabe21cce)
[^4]: [netctl (简体中文)](https://wiki.archlinux.org/index.php/Netctl_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
[^5]: [31C3 802.1x WiFi config for netctl](https://gist.github.com/takeshixx/d2bfc322da88c1f0de31)
[^6]: [如何使用电脑 / Mac 连接上 BUPT-mobile](https://www.jianshu.com/p/46392f4074e1)
[^7]: [树莓派连接北邮校园网](https://www.smwenku.com/a/5b89b2bf2b71775d1ce34b39/zh-cn/)
