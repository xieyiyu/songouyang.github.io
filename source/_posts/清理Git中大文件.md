---
title: 清理 Git 中大文件
categories: 方案
comments: true
mathjax: false
tags:
  - Git
abbrlink: 60716
date: 2018-03-19 08:50:44
---

Git 仓库中误操作加入大体积的二进制文件，需要「彻底」删除才能减小仓库体积。如果仓库中需要大体积的二进制文件，建议使用 Git-LFS。

<!--more-->

## 清理历史

在清理历史之前，建议备份好你的图片或者视频等二进制文件，因为这会把本地的文件也会删除。

```console
# 查看空间使用
$ git count-objects -v
count: 861
size: 53928
in-pack: 2005
packs: 4
size-pack: 154642
prune-packable: 634
garbage: 0
size-garbage: 0
# 查看前 5 大的文件
$ git verify-pack -v .git/objects/pack/pack-*.idx | sort -k 3 -g | tail -5
e41d95258fdd97ad45dc7809fd139bbba4a14ad1 blob   283177 232843 19157314
e41d95258fdd97ad45dc7809fd139bbba4a14ad1 blob   283177 232843 19157315
8b66187fe067c3aa389ce8c98108f349ceae159c blob   391622 120071 52253415
8b66187fe067c3aa389ce8c98108f349ceae159c blob   391622 120071 52253419
8b66187fe067c3aa389ce8c98108f349ceae159c blob   391622 120071 52253420
# 找出对应的文件名
$ git rev-list --objects --all | grep e41d95258fdd97ad45dc7809fd139bbba4a14ad1
e41d95258fdd97ad45dc7809fd139bbba4a14ad1 assets/images/2017-09-21-15-50-14.jpg
# 删除图片
$ git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch assets/images/2017-09-21-15-50-14.jpg' --prune-empty --tag-name-filter cat -- --all
Rewrite 96a72445dee644292f05db25d61e60ac86ec86e7 (9/12) (0 seconds passed, remaining 0 predicted)    rm 'assets/images/2017-09-21-15-50-14.jpg'
Rewrite e94530483fd262fb1679f13f7001f15ff729abdc (10/12) (0 seconds passed, remaining 0 predicted)    rm 'assets/images/2017-09-21-15-50-14.jpg'
Rewrite 9944dc4063819407879091689e3f8d2797a9c3b1 (11/12) (0 seconds passed, remaining 0 predicted)    rm 'assets/images/2017-09-21-15-50-14.jpg'
Rewrite fc8ec343ae9c902537510e465b942d828fded63d (12/12) (0 seconds passed, remaining 0 predicted)    rm 'assets/images/2017-09-21-15-50-14.jpg'

Ref 'refs/heads/master' was rewritten
Ref 'refs/remotes/origin/master' was rewritten
Ref 'refs/remotes/origin/gh-pages' was rewritten
WARNING: Ref 'refs/remotes/origin/master' is unchanged
# 回收空间
$ rm -rf .git/refs/original/
$ git reflog expire --expire=now --all
$ git gc --prune=now
Counting objects: 729, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (663/663), done.
Writing objects: 100% (729/729), done.
Total 729 (delta 37), reused 664 (delta 28)
$ git gc --aggressive --prune=now
Counting objects: 729, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (691/691), done.
Writing objects: 100% (729/729), done.
Total 729 (delta 43), reused 686 (delta 0)
# 强制推送到远端
git push origin --force --all
```

## 使用 Git-LFS

```console
# 安装 git-lfs
brew install git-lfs
# 关联相关仓库
git lfs track "source/_posts/*/*.jpg"
# 上传 git-lfs 文件
git add source/_posts/
git commit -m"add git lfs"
git push origin master
```

关于确认是否用上了 Git-LFS，可以使用下面的方法来确认。

```console
git lfs ls-files
```

或者在 `push` 的时候，会显示 Uploading LFS objects。

至此，在仓库中二进制文件都变成了一些远程地址了，极大地减小了仓库的大小。

```console
version https://git-lfs.github.com/spec/v1
oid sha256:583236d0803441010279375b8f5da4812ae82aa96e0ba2d5b6d67f1162f670eb
size 87859
```

