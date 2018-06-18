---
title: 搭建 JetBrains License 服务
categories: 方案
comments: true
mathjax: false
tags:
  - JetBrains
  - Docker
abbrlink: 10120
date: 2018-03-08 11:16:38
---

使用 now.sh 提供的 Docker 服务来搭建 JetBrains 家的各种 IDE 激活服务器，比如 Pycharm、Clion 和 IDEA 之类。

<!--more-->

## 前言

JetBrains 家非常良心，学生用[教育邮箱](https://www.jetbrains.com/zh/student/)即可激活。创业公司可以享受 5 折[优惠](https://www.jetbrains.com/shop/eform/startup)。所以希望有能力的同学一定要正版支持，本文只是我用来学习 Docker 的实践，毕竟我有教育邮箱。同时感谢 Lanyu 同学的[成果](http://blog.lanyus.com/archives/174.html)。

## Dockerfile

有服务器的同学可以部署到自己的服务器，我这里将程序跑在 Docker 中，然后部署到 [now.sh](https://zeit.co/now)。这个平台支持静态文件、nodejs 和 Docker 服务的部署。

```docker
FROM ubuntu
LABEL maintainer="ouyangsong <songouyang@live.com>"
ADD https://github.com/songouyang/IntelliJ-IDEA-License-Server/releases/download/v1.6/IntelliJIDEALicenseServer_linux_amd64 /app/
EXPOSE 1027
RUN chmod u+x /app/IntelliJIDEALicenseServer_linux_amd64
ENTRYPOINT [ "./app/IntelliJIDEALicenseServer_linux_amd64", "-u", "ouyangsong" ]
```

## 部署

[注册](https://zeit.co/login)账号，安装 now 命令行。

```sh
npm install -g now
```

命令行登陆账号。

```sh
now login
```

在 Dockerfile 所在目录进行部署。

```sh
now
```

修改别名，方便记住 URL 地址。

```sh
now alias intellij-idea-license-server-vivoqgthem.now.sh idea
```

保持服务一直运行。

```sh
now scale https://idea.now.sh 1
```

最终我们得到的破解服务器地址就是 <https://idea.now.sh>。

## 激活

![activate](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfqo6ox1jj20wi0tan1f.jpg "激活服务器地址")

点击 Activate 即可激活。

![success](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfqo9fu1tj211g0o4h5p.jpg "激活完成")

## 相关文件

上述的 Dockerfile 和破解程序在 [GitHub](https://github.com/songouyang/IntelliJ-IDEA-License-Server) 上。如果需要在服务器上用 Docker 搭建的话，可以使用该[镜像](https://hub.docker.com/r/ouyangsong/intellij-idea-license-server/)，使用的时候记得指定端口咯。

