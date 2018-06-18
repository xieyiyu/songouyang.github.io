---
title: Hexo 的 RSS 生成错误
categories: 工具
comments: true
mathjax: false
tags:
  - Hexo
abbrlink: 19266
date: 2018-03-16 13:53:49
---

Hexo 生成的 RSS 的 atmo.xml 报错 PCDATA invalid Char value，产生这样的原因就是 Markdown 文件中有特殊字符。

<!--more-->

## 安装插件

我使用的是 Next 主题，该主题使用 [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed) 来生成 Feed 链接。

## 解析错误

在浏览器中查看 atom.xml，发现报错，信息如下。

```
This page contains the following errors:
error on line 466 at column 110: PCDATA invalid Char value 8
Below is a rendering of the page up to the first error.
```

可以看到使用该插件生成 atom.xml 时，content 用 CDATA 包起来了，但是 summary 没有加上，所以在 summary 中有特殊字符就会产生错误。

## 解决办法

这是因为源文件中存在特殊字符 `^H`，删除即可。产生这样的原因是终端的回删键有问题。因为之前我用 vscode 编辑 Markdown 文件，看不出有多余字符，在 VIM 下就可以看出来。
