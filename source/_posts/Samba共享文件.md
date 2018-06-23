---
title: Samba 共享文件
comments: true
mathjax: false
tags:
  - Samba
categories: 工具
abbrlink: 47942
date: 2018-06-23 13:21:07
---

使用 Samba 来共享 ChromeBook 上挂载的硬盘文件，这样一来，Mac、Win 和 Android 都可以共享文件。

<!--more-->

## 安装

我使用的 Linux 系统是 ArchLinux，安装方法很简单，其他平台自行查找。

```sh
pacman -S samba
```

## 服务端配置

### 配置文件

Samba 的配置文件在 `/etc/samba/smb.conf`。首先我把硬盘挂载到 `/data01` 目录，然后新建了文件夹 `share`，并且把文件夹权限改成了 `777`。

```ini
[global]
workgroup = WORKGROUP
server string = Media Server
security = user
log file = /var/log/samba/log.%m
max log size = 50
hosts allow = 127., 172., 192.168.1., 192.168.3., 10.

[share]
    comment = To share
    path = /data01/share
    valid users = ouyangsong
    read only = No
    browseable = No
```

然后检查配置的语法。

```sh
testparm
```

常用的选项：

| 选项               | 说明     |
|-----------------------|------------------|
| path =                | 文件系统路径     |
| browseable = {yes\|no} | 是否可以被查看到 |
| public = {yes\|no}     | 是否可被所有人读 |
| read only = {yes\|no}  | 是否只读         |
| writeable = {yes\|no}  | 是否可写         |
| valid users =         | 白名单           |
| invalid users =       | 黑名单           |

### 添加用户

Samba 需要 Linux 账号才可以使用，用户名可以共享，但是密码不共享。我就直接使用本来就有的账号 `ouyangsong`，只需要把它设置一个 Samba 密码即可。

```sh
smbpasswd -a ouyangsong
```

如果是专门创建来登陆 Samba 服务，最好禁用其他登陆选项。

**禁用 Shell**

```sh
usermod --shell /user/bin/nologin --lock ouyangsong
```

**禁用 SSH**

修改 `/etc/ssh/sshd_conf` 中的 `AllowUsers` 字段。

### 重启服务

网上有些教程这里过时了，因为这个服务名字已经修改了。

```sh
systemctl restart smb nmb
```

## 客户端连接

Mac 打开 finder，然后 command + k 就可以打开远程连接。填入对应的 IP，就会提示输入用户名和密码就可以登陆了。

![](https://wx2.sinaimg.cn/large/e2a28cd6ly1fsl2l6c8w4j21040qgn1h.jpg)

安卓我使用的文件管理器是 Solid Explorer，添加远程连接找到 LAN/SMB 方式即可。

![](https://wx2.sinaimg.cn/large/e2a28cd6ly1fsl2l5qbxtj20u01hcq4w.jpg)
