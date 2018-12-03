---
title: MySQL 重置密码
comments: true
mathjax: false
tags:
  - MySQL
categories: 编程
abbrlink: 18585
date: 2018-12-03 11:27:09
---

安装 MySQL 8.0 后，默认的用户 `root` 是没有密码的，需要修改默认的初始化密码。假如忘记了 `root` 用户的密码，也是需要重置密码的。

<!--more-->

首先安装 MySQL 8.0 后，启动 MySQL 服务。我这里是在 MAC 上安装使用的。

```sh
brew install mysql
brew services start mysql
```

因为默认是没有密码的，所以先直接进入 MySQL 服务中。

```sh
➜  ~ mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 13
Server version: 8.0.12 Homebrew

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

## 方法一

假如启动 MySQL 时候启动了授权表，也就是没有加上 `skip-grant-tables` 启动参数。使用这种方法设置密码：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '123456';
```

## 方法二

假如启动 MySQL 时候没有启动了授权表，也就是加上 `skip-grant-tables` 启动参数。
这种时候一般是忘记了 `root` 用户的密码，这里的 `root` 用户是 MySQL 的用户，不要和 Linux 上的用户搞混了。
使用这种方法设置密码：

首先关闭并启动 MySQL，并进入 MySQL 命令行。

```sh
brew services stop mysql
mysqld --skip-grant-tables  --skip-networking
mysql
```

把密码设置为空。

```sql
UPDATE mysql.user SET authentication_string=null WHERE User='root';
FLUSH PRIVILEGES;
exit;
```

然后关闭 MySQL 并正常启动，不需要 `skip-grant-tables` 启动参数了。

```sh
mysql -uroot
```

重复方法一的操作设置密码。

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '123456';
```
