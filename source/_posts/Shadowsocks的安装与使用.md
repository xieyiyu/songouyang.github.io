---
title: Shadowsocks 的安装与使用
categories: 工具
comments: true
tags:
  - Linux
  - Shadowsocks
abbrlink: 28409
date: 2018-01-05 23:23:53
---

Shadowsocks 可谓是上网必备工具。考虑到安全性和性价比，买国外的 VPS 搭建私有的 Shadowsocks 服务是很有必要的。而且国外 VPS 还有 ipv6 地址，对于校园网用户来说，还可以减少 ipv4 流量的消耗。

<!--more-->

## 服务端安装

libev 版本的 shadowsocks 是使用 C 语言开发的。

### ubuntu

```sh
sudo apt install shadowsocks-libev
```

### centos

```sh
yum install epel-release -y
yum install gcc gettext autoconf libtool automake make pcre-devel asciidoc xmlto c-ares-devel libev-devel libsodium-devel mbedtls-devel -y
cd /etc/yum.repos.d/
wget https://copr.fedoraproject.org/coprs/librehat/shadowsocks/repo/epel-7/librehat-shadowsocks-epel-7.repo
yum update
yum install shadowsocks-libev
```

## 服务端配置

修改配置文件 `/etc/shadowsocks-libev/config.json`。

```javascript
{
    "server":["[::0]", "0.0.0.0"],
    "server_port":8388,
    "local_port":1080,
    "password":"barfoo!",
    "timeout":60,
    "method":"aes-256-cfb"
}
```

需要注意的地方是 server 的配置，这样才可以同时启动 ipv4 和 ipv6 地址的连接。

## 开机启动服务

```sh
systemctl enable shadowsocks-libev
systemctl start shadowsocks-libev
systemctl status shadowsocks-libev
chkconfig shadowsocks-libev on
```

或者注册成服务。编辑文件 `/etc/systemd/system/shadowsocks.service`。

```
[Unit]
Description=Shadowsocks Client Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/ss-local -c /etc/shadowsocks-libev/ipv4.json

[Install]
WantedBy=multi-user.target
```

使配置生效，并且立刻启动服务。

```sh
systemctl enable /etc/systemd/system/shadowsocks.service
systemctl start /etc/systemd/system/shadowsocks.service
```

## 客户端安装

安装方法和服务端安装方法一模一样，只是后续的启动命令不同。

### 客户端配置

新建配置文件 `/etc/shadowsocks-libev/ipv4.json`。

```javascript
{
    "server": 10.10.10.10,
    "server_port":8388,
    "local_port":1080,
    "password":"barfoo!",
    "timeout":60,
    "method":"aes-256-cfb"
}
```

### 启动服务

在 `/etc/profile.d` 中新建 `ss.sh`。这样客户端开机就会执行该命令，启动 shadowsocks 服务。

```sh
nohup ss-local -c /etc/shadowsocks-libev/ipv4.json < /dev/null &>> /var/log/ss-local.log &
```

## 使用方法

### 全局代理

在终端中全局使用 socks5 代理。

```sh
export ALL_PROXY=socks5://127.0.0.1:1080
```

设置完代理后可以用 curl 验证代理是否成功。

```sh
curl ip.sb
curl myip.ipip.net
```

### gfwlist

可以通过 privoxy 转换为 http 代理，然后设定代理规则。可以参考 [gfwlist2privoxy](https://github.com/zfl9/gfwlist2privoxy)。

