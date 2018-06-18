---
title: SSH 使用小技巧
categories: 工具
comments: true
mathjax: false
tags:
  - SSH
abbrlink: 63538
date: 2018-02-06 10:27:09
---

SSH 的端口转发功能可以加密 Client 和 Server之间的通讯数据，还可以突破防火墙的限制。北邮的电脑上网，ipv4 地址是每次连接网关时动态分配，ipv6 地址是不会变的。可以利用端口转发来连接实验室机器，无视它的 ip 每次都变化。

<!--more-->


## 基本参数含义

| 参数 | 功能         |
|------|--------------|
| -C   | 压缩数据传输 |
| -f   | 后台运行     |
| -N   | 不执行shell  |
| -L   | 本地端口转发 |
| -R   | 远程端口转发 |
| -D   | 动态端口转发 |

## 远程端口转发

远程端口转发也叫做反向代理。假如你本地的机器是 A，远程有一台机器 C，你的机器 A 由于某种原因，不能访问 C。但是你还有一台机器 B，A 和 C 都可以访问 B，那么你可以把 C 的一个端口「挂载」到 B 中的某一个端口，然后 A 访问 B 的这个端口就相当于访问 C 的端口了。

### 登陆端口转发

现实的场景：实验室有一台机器，然后希望可以通过 SSH 连接上去跑实验，但是由于学校网络问题，实验室的机器的 IP 经常发生改变，并且只能校内网连接。

为了解决这个问题，首先需要一台公网机器，比如腾讯云或者阿里云，要求它有一个公网 IP，它扮演的就是前面说的 B 机器。客户端机器 A 和 实验室机器 C 都可以连接到公网机器 B。要想实验室机器能够开机就能连接公网机器，可以参考[命令行登陆北邮校园网](/posts/43250/)来自动登陆网关。我们在 C 机器上有一个用户为 ouyangsong，在 B 机器上有个用户为 jumpuser。

为了方便后面的登陆，首先需要建立 C 机器上的 ouyangsong 到 B 机器上的 jumpuser 的免密码登陆，也就是说 C 机器可以不需要密码就可以登陆到 B 机器。具体可以参考 [SSH 免密码登陆](/posts/48748/)。

```console
C$ ssh -R 10022:localhost:22 jumpuser@B
```

R 参数接受三个值，分别是「远程主机端口:目标主机:目标主机端口」。这条命令的意思就是，让 B 机器监听它的 10022 端口，然后所有数据转发到 C 的 22 端口。这时候可以在 B 机器上通过 `ss -ant` 命令看到它已经监听本地（指 B 机器本地）的 10022 端口。这就实现了 C 的 22 端口「挂载」到 B 的 10022 端口。

```console
B$ ssh ouyangsong@C -p10022
```

首先登陆到 B 机器，然后输入 ouyangsong 用户在 C 机器上的密码就可以登陆到 C 机器。但是这样还是略显麻烦，可以把 B 机器的 ssh 端口开放在 `0.0.0.0` 而不是默认的 `127.0.0.1` 就可以直接在 A 机器登陆到 C 机器。修改 `/etc/ssh/sshd_config` 文件，添加 `GatewayPorts yes`。然后重启 sshd 服务，`sudo reload ssh`。这时候还需要把远程端口转发命令做点小修改。

```console
C$ ssh -R 0.0.0.0:10022:localhost:22 jumpuser@B
```

经过上面的修改我们可以在 A 上执行如下命令就可以登陆 C 机器了，成功突破了校园网的限制。注意用户名 ouyangsong 为 C 上的用户名，B 机器不存在 ouyangsong 用户。

```console
A$ ssh ouyangsong@B -p10022
```

但是还有点小问题就是如果网络不稳定，那么 ssh 服务就会断了，这时候我们需要重新连接 ssh，可以使用 autossh 工具。

```console
C$ sudo apt install autossh
# M 参数指定监视连接状态端口
C$ autossh -M 10023 -fNR 0.0.0.0:10022:localhost:22 jumpuser@B
```

然后添加到开机自启中，`/etc/rc.local` 最后添加下面命令：

```console
su - ouyangsong -c 'autossh -M 10023 -fNR 0.0.0.0:10022:localhost:22 jumpuser@B'
```

### Web 端口转发

假如实验室机器上跑了一个 Web 服务，比如 `python -m SimpleHTTPServer`，默认的情况下只能在 C 机器上的本地 8000 端口访问，假如不在校园网环境也就是 A 不能直接访问 C，但是希望访问该 web 服务，需要把 C 机器的 8000 端口「挂载」到 B 机器上的某一个端口。

```console
C$ ssh -NR 0.0.0.0:18000:localhost:8000 jumpuser@B
```

这样的话我就可以在 B 机器的 18000 端口访问该服务。

### 代理端口转发

假如 C 机器上有 HTTP 代理服务，运行在 1080 端口，希望 B 机器可以使用该代理服务。

```console
C$ ssh -NR 11080:localhost:1080 jumpuser@B
C$ ssh jumpuser@B
B$ export ALL_PROXY=http://127.0.0.1:11080
B$ curl ip.sb
```

## 本地端口转发

本地端口转发也叫做正向代理。这其实适合的场景是：A 可以连接 B，B 可以连接 C，但是 A 不可以连接 C。所以下面的命令要在 B 机器上执行，jumpuser 是 C 机器上的用户。

```console
B$ ssh -NL 20022:localhost:10022 jumpuser@C
```

L 参数同样接受三个值，分别是「本地端口:目标主机:目标主机端口」，在这里 B 的本地端口是 20022，我们把 C 机器的「本地端口」 10022 端口转发到 B 的本地端口 20022，注意这里的 localhost 是相对 C 机器来说的。

## 动态端口转发

远程端口转发和本地端口转发都是限定了端口，而动态端口转发不限定端口，A 机器将数据都通过某个端口传送到内网机器 C。假如我们可以通过跳板机 B 来连接到内网机器 C，我们希望访问网页时也经过该代理。或者另外一种情景，希望把未加密的数据经过 ssh 来进行加密连接。

```console
A$ ssh -ND 1080 ouyangsong@B -p10022
```

这样的话，A 机器的 1080 端口的数据，会经过跳板机 B 然后到内网机器 C。然后在浏览器通过插件 [Proxy SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=en) 设置代理为 `socks5://127.0.0.1:1080`，这样浏览网页就是使用的内网 IP 访问，从而实现了自制的内网的 VPN。

