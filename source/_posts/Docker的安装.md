---
title: Docker 的安装
categories: 工具
comments: true
tags:
  - Docker
abbrlink: 61830
date: 2018-01-05 22:32:58
---

Docker 是一个非常有趣的项目，可以减轻环境配置和部署的步骤。也可以十分方便的搭建起机器学习的环境。下面记录了 Linux 平台安装 Docker，以及免 sudo 运行 Docker 命令。

<!--more-->

## 安装 Docker

已经有现成的脚本可以很方便的在不同的 Linux 版本上安装 Docker。

```sh
sudo wget -qO- https://get.docker.com/ | sh
```

## 国内加速

阿里云提供 Docker 加速器。进入 <https://cr.console.aliyun.com>，注册好账号，找到 Docker Hub 镜像站点，在上面找到你专属加速器地址:

```
https://xxx.mirror.aliyuncs.com
```

## 免 root 权限运行

添加到用户组。

```sh
sudo usermod -aG docker ${USER}
```

shell 环境生效。

```sh
su - ${USER}
```

验证添加成功。

```sh
id -nG
# output: ouyangsong sudo docker
```

## Docker-compose

可以使用 Pip 安装。

```sh
sudo pip install docker-compose
```

## 修改配置

为了使用 docker 提供的 SDK，需要修改 docker 的端口。按照网上大多数教程上，我实际使用中发现找不到 `/etc/sysconfig/docker` 这个文件。

```sh
# sudo docker version
Client:
 Version:	17.12.0-ce
 API version:	1.35
 Go version:	go1.9.2
 Git commit:	c97c6d6
 Built:	Wed Dec 27 20:10:36 2017
 OS/Arch:	linux/amd64

Server:
 Engine:
  Version:	17.12.0-ce
  API version:	1.35 (minimum version 1.12)
  Go version:	go1.9.2
  Git commit:	c97c6d6
  Built:	Wed Dec 27 20:09:12 2017
  OS/Arch:	linux/amd64
  Experimental:	false
# lsb_release -a
Distributor ID:	Ubuntu
Description:	Ubuntu 14.04 LTS
Release:	14.04
Codename:	trusty
```

解决方法：

```sh
# vim /lib/systemd/system/docker.service
[Service]
EnvironmentFile=/etc/default/docker
ExecStart=/usr/bin/docker daemon -H fd:// $DOCKER_OPTS
# vim /etc/default/docker
DOCKER_OPTS='--selinux-enabled -H 0.0.0.0:2375 -H unix:///var/run/docker.sock '
DOCKER_CERT_PATH=/etc/docker
```

接下来重载以及重启 docker。

```sh
systemctl daemon-reload
service docker restart
```
