---
title: curl 常用命令总结
comments: true
mathjax: false
tags:
  - Linux
  - cURL
categories: 工具
abbrlink: 16732
date: 2018-08-06 23:47:20
---

命令行下和网络打交道就离不开 curl 命令。curl 是用来和服务器传送文件的工具，下面整理一下相关的常用命令。

<!--more-->

## 保存文件

默认的不加任何参数，就会把结果输出到标准输出中。

```sh
curl "https://www.ouyangsong.com"
```

`-o` 参数则是将文件保存为命令行中指定的文件名的文件中。

```sh
curl -o test.html "https://www.ouyangsong.com"
```

`-O` 参数把文件保存为服务器端的文件名。

```sh
curl -O "https://www.ouyangsong.com/index.html"
```

同时下载多个文件可以加多个 `-O` 参数。

```sh
curl -O "https://www.ouyangsong.com/index.html" -O "https://www.ouyangsong.com/tags/index.html"
```

## 重定向

默认情况，curl 不会进行重定向。如果需要重定向，需要加入 `-L` 参数。

```sh
curl -L "http://ouyangsong.com"
```

## 断点续传

如果下载大文件，可能需要使用断点续传功能。以便中途断了连接，下次不必重新下载前面的部分。使用 `-C` 参数即可。

```sh
curl -O -C - https://mirrors.tuna.tsinghua.edu.cn/archlinuxarm/os/ArchLinuxARM-armv7-chromebook-latest.tar.gz
```

它会显示恢复下载。

```
** Resuming transfer from byte position 24248320
```

## 限速下载

如果不想下载过快，可以限制下载速度。使用参数 `--limit-rate` 即可。

```sh
curl --limit-rate 1000B -O https://mirrors.tuna.tsinghua.edu.cn/archlinuxarm/os/ArchLinuxARM-armv7-chromebook-latest.tar.gz
```

最大速度不会超过 1000B 每秒。

## 更新下载

如果下载的文件在某个日期之后发生过修改才下载，否则就不下载。可以使用参数 `-z`。

```sh
curl -z 6-Aug-18 -O "https://www.ouyangsong.com/index.html"
```

如果文件的最后一次修改时间大于 2018 年 8 月 6 日，文件则会重新下载。

## 授权下载

这种主要用于需要验证用户名和密码的网站下载。简单的 HTTP 验证可以用 `-u` 参数。

```sh
curl -u username:password URL
```

当然也可以提示输入密码，然后再输入。

```sh
curl -u username URL
```

## FTP 下载与上传

如果 url 是文件路径而不是文件名，那么会列出该目录的所有文件名。如果 url 是文件名，那么就下载该文件。

列出 public_html 中的所有文件。

```sh
curl -u ftpuser:ftppass -O ftp://ftp_server/public_html/
```

下载 xss.php 文件。

```sh
 curl -u ftpuser:ftppass -O ftp://ftp_server/public_html/xss.php
```

通过 `-T` 命令可以将文件上传到服务器上。

```sh
curl -u ftpuser:ftppass -T myfile.txt ftp://ftp.testserver.com
```

上传多个文件。

```sh
curl -u ftpuser:ftppass -T "{file1,file2}" ftp://ftp.testserver.com
```

从标准输入中把内容保存到 FTP 服务商上。

```sh
curl -u ftpuser:ftppass -T - ftp://ftp.testserver.com/myfile_1.txt
```

## 详细信息

`-i` 参数可以显示头信息连同网页代码一起。`-I` 参数只是显示头信息。

`-v` 参数可以显示 HTTP 通信的整个过程，包括端口连接和头信息。

```sh
curl -v "https://www.ouyangsong.com/index.html"
```

如果需要更加详细的信息，可以用 `--trace` 参数。

```sh
curl --trace output.txt "https://www.ouyangsong.com"
```

完成后详细信息就在 output.txt 文件中。

## 代理

`-x` 参数可以指定使用的代理。

```sh
curl -x 127.0.0.1:1087 ip.c
```

## 保存和使用 cookie 信息

`-D` 保存 cookie 信息，`-b` 使用保存的 cookie 信息。

```sh
curl -D sugarcookies https://www.baidu.com
```

```sh
curl -b sugarcookies https://www.baidu.com
```

## HTTP 请求方式

默认是 GET 方法，指定了 `--data` 则是使用 POST 方法。

默认的 GET 方法。

```sh
curl -u username https://api.github.com/user?access_token=XXXXXXXXXX
```

使用 POST 方法。

```sh
curl -u username --data "param1=value1&param2=value" https://api.github.com
```

将文件内容传递给服务器。

```sh
curl --data @filename https://github.api.com/authorizations
```

如果传送的数据有特殊字符，需要先转义。在新版本中的 curl 中可以使用 `--data-urlencode` 方法。

```sh
curl --data-urlencode "value 1" http://hostname.com
```

除了 GET 和 POST 方法，还可以通过 `-X` 来指定其他操作。

```sh
curl -X DELETE https://api.github.com
```

提交表单上传文件。

```sh
curl --form "fileupload=@filename.txt" http://hostname/resource
```

## 参考链接

- [Using curl to automate HTTP jobs](https://curl.haxx.se/docs/httpscripting.html)
- [Convert curl syntax to Python, Node.js, PHP](https://curl.trillworks.com/)
