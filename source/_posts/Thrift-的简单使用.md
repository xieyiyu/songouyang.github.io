---
title: Thrift 的简单使用
comments: true
mathjax: false
tags:
  - RPC
  - Thrift
abbrlink: 39410
date: 2018-10-01 17:05:43
categories: 编程
---

Thrift 是一种 RPC 框架，所谓 RPC 就远程过程调用。Thrift 是为了解决不同系统之间的跨平台跨语言的函数调用。本文主要将如何入手和使用 Thrift。

<!--more-->

学会使用 RPC 应该是校招生出校门之后第一样需要学习的东西，因为在学校直接调用函数即可，根本不会涉及到跨部门跨语言的服务调用。

## 流程

首先定义 IDL 文件，客户端和服务端约定好怎样的接口，传入什么，返回什么；然后使用工具生成相应语言的代码；实现生成代码中的业务逻辑；客户端根据生成的代码调用服务端接口。

## 类型

Thrift 中支持的各种数据类型。

### 基本类型

- byte: 有符号字节
- i16: 16 位有符号整数
- i32: 32 位有符号整数
- i64: 64 位有符号整数
- double: 64 位浮点数
- string: 字符串

### 容器

- list<T>: 有序列表
- set<T>: 无序列表
- map<K, V>: 字典类型

### 结构体

thrift 中的 struct 和 C 语言中的 struct 一样。

### 枚举

和 Python 的枚举类似。

### 异常

规则和 struct 一样。

### 服务

就是定义接口，后续服务端需要实现接口中的业务逻辑。

### 类型定义

C 语言中的 typedef 一样。

### 常量

用 const 关键字表示常量。

### 命名空间

和 C++ 中的命名空间类似，也是用 namespace 定义。

### 文件包含

和 C++ 中的 include 类似。

### 可选和必选

`require` 表示必选，序列化时必须存在。`optional` 表示可选，一般后续的 IDL 修改为了兼容旧版本，都会把新增字段设定成可选。

## 生成代码

不同的语言，`gen` 参数就不同。这里以 Python 举例子。

```python
thrift --gen py test.thrift
```

## 实例

接下来实现一个简单的 DEMO。目标是 JavaScript 的客户端调用 Python 的服务端。实现对字符串的分词。

首先定义 IDL，就是接口文件。

```thrift
namespace py ouyangsong
namespace js ouyangsong

enum StatusCode {
    SUCCESS = 1;
    FAIL    = 2;
}

struct TestReq {
    1: string text;
}

struct TestRsp {
    1: list<string> result;
    2: StatusCode status_code;
}

service TestThriftService {
    TestRsp cut(1: TestReq req);
}
```

然后分别生成 Node 和 Python 代码。

```sh
thrift --gen py example.thrift
thrift --gen js:node example.thrift
```

然后实现 Python 接口文件的 service 中的业务代码。

```python
#! /usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'ouyangsong'

import jieba
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
from ouyangsong import TestThriftService
from ouyangsong.ttypes import TestRsp, StatusCode


class TestThriftServiceHander(object):
    def __init__(self):
        pass

    def cut(self, req):
        try:
            txt = req.text
            print(txt)
            seg_list = jieba.cut_for_search(txt)
            seg_list = list(seg_list)
            print(seg_list)
            return TestRsp(result=seg_list,
                           status_code=StatusCode.SUCCESS)
        except Exception as e:
            print(e)
            return TestRsp(result=[], status_code=StatusCode.FAIL)


if __name__ == "__main__":
    handler = TestThriftServiceHander()
    processor = TestThriftService.Processor(handler)
    transport = TSocket.TServerSocket(port=5000)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)
    print("begin serve")
    server.serve()
    print("end serve")
```

接下来是构造客户端并请求调用服务端。

```js
#!/usr/bin/env node

var thrift = require('thrift'),
    ttransport = thrift.TBufferedTransport(),
    tprotocol = thrift.TBinaryProtocol();

var TestThriftService = require('./gen-nodejs/TestThriftService');
var ttypes = require('./gen-nodejs/example_types.js');

var connection = thrift.createConnection('localhost', 5000, {transport: ttransport, protocol: tprotocol}),
    client = thrift.createClient(TestThriftService, connection);

connection.on('error', function (err) {
    console.error(err);
});

var req = new ttypes.TestReq();
req.text = "Hello World!";

client.cut(req, function(err, rsp){
    if (err) {
        console.error(err);
    } else {
        console.log(rsp.result);
    }
    connection.end();
});
```

调用服务结果输出。

```
[ 'Hello', ' ', 'World', '!' ]
```

到此为止，已经可以学会如何使用 Thrift 了。
