---
title: now.sh 免费部署 oneindex
comments: true
mathjax: false
tags:
  - 网盘
  - Docker
categories: 方案
abbrlink: 43735
date: 2018-10-07 13:43:03
---

oneindex 是将微软的 onedrive 打造成分享网盘的程序。使用 now.sh 提供的 Docker 部署环境免费搭建个人分享网盘。

<!--more-->

## 特点

1. 免费
2. 不用服务器空间
3. 不走服务器流量

## 准备工作

1. 注册 now 账号。注册地址 <https://zeit.co/>
2. 注册 onedrive 账号。可以申请 5T 容量的网盘更好。

## 部署

now.sh 的命令行客户端是基于 nodejs 的，所以首先安装 nodejs 环境。nodejs 下载安装即可。下载地址：<https://nodejs.org/en/download/>

安装 now.sh 客户端。

```sh
npm install -g now
```

然后登陆 now 账号，它会提示输入邮箱，并通过邮箱登陆验证即可。

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvzmgdul3wj213c0fitb8.jpg)

从官方仓库拉取最新的 oneindex 代码。

```sh
git clone https://github.com/donwa/oneindex.git
```

如果在 win 平台不方便新建 now.json 文件，可以拉取我的这个仓库，省去自己加入 now.json 文件。

```sh
git clone https://github.com/songouyang/oneindex
```

使用我的仓库则跳过这一步，否则在 oneindex 文件夹中加入 now.json 文件。

```js
{
  "type": "docker",
  "features": {
    "cloud": "v1"
  }
}
```

参考这条 [PR](https://github.com/malaohu/oneindex/pull/1/files)，如果需要加入定时刷新缓存的话，可以在容器中加入定时任务。使用我的仓库也可以跳过这一步。

```docker
FROM php:fpm-alpine
WORKDIR /var/www/html
COPY / /var/www/html/
RUN apk add --no-cache nginx \
    && mkdir /run/nginx \
    && chown -R www-data:www-data cache/ config/ \
    && mv default.conf /etc/nginx/conf.d \
    && mv php.ini /usr/local/etc/php \
    && sed -i '/^$/d' /var/spool/cron/crontabs/root \
    && echo '*/10 * * * * /usr/local/bin/php /var/www/html/one.php cache:refresh' >> /var/spool/cron/crontabs/root \
    && echo '0 * * * *  /usr/local/bin/php /var/www/html/one.php token:refresh' >> /var/spool/cron/crontabs/root

EXPOSE 80
# Persistent config file and cache
VOLUME [ "/var/www/html/config", "/var/www/html/cache" ]

CMD php-fpm & \
    nginx -g "daemon off;"
```

进入 oneindex 文件夹中，开始部署项目。

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvzmnplzv8j21kw1oiqm0.jpg)

上图中可以看到部署的地址为：<https://oneindex-yckkdopvtv.now.sh>。
部署完成后，容器默认会隔一段时间重启，为了不让容器重启，执行下面的命令。如果不执行，会发现隔一会又要重新配置 onedrive 了。记得把下面的地址改成自己的 now.sh 的地址。

```sh
now scale oneindex-yckkdopvtv.now.sh 1
```

为了方便访问，可以把前缀设置一个别名。取一个不重复且方便记忆的即可。这里我使用 oneindex，每个人取不同的别名。

```sh
now alias oneindex-yckkdopvtv.now.sh oneindex
```

至此，就可以打开 <https://oneindex.now.sh> 开始配置了。

## 配置

如果部署没有问题，那么打开上面部署得到的网址就可以看到如下界面。

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznb3na86j21kw0zkdkp.jpg)

开始配置 onedrive。

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznb80xiaj21kw0zkgrw.jpg)

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznbd6o69j21kw0zktgn.jpg)

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznbzm6taj21kw0zkqen.jpg)

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznc30e3ej21kw0zk7c4.jpg)

绑定账号。

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznbgkmqqj21kw0zkgq0.jpg)

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvzncc4x8qj21kw0zke84.jpg)

![](https://wx1.sinaimg.cn/large/e2a28cd6ly1fvznbjolopj21kw0zkjz6.jpg)

记得修改默认密码。最后就可以得到 oneindex 的地址：<https://oneindex.now.sh>，管理后台地址就是：<https://oneindex.now.sh/admin/>。
