---
title: Githug 通关笔记
categories: 工具
comments: true
tags: Git
abbrlink: 54288
date: 2017-11-22 16:40:33
---

[Githug](https://github.com/Gazler/githug) 是一个关于 Git 的游戏，共有 55 关，每一关对应 Git 的一项操作。整个游戏可以让你通过实际操作来掌握 Git。记录下自己的通关命令，以后也可以作为 Git 的 cheatsheet。

<!--more-->

## 安装

Githug 依赖 Ruby 环境，所以需要先安装 Ruby。

```sh
sudo apt install ruby
sudo gem install githug
```

## 命令

Github 有 4 个命令。

- play 开始游戏
- hint 部分关卡有提示
- reset 恢复本关卡的初始状态
- levels 显示所有关卡

## 攻略

**init**

```sh
git init
```

**config**

如果只想给当前仓库设置就使用 local，全局设置用 global。

```sh
git config --local user.name ouyangsong
git config --local user.email songouyang@live.com
```

**add**

添加文件到暂存区。

```sh
git add README
```

**commit**

将暂存区的修改一次性提交到仓库。

```sh
git commit -m"add REMADE"
```

**clone**

```sh
git clone https://github.com/Gazler/cloneme
```

**clone_to_folder**

clone 到指定的文件夹中。

```sh
git clone https://github.com/Gazler/cloneme my_cloned_repo
```

**ignore**

设置 Git 需要忽略的文件。Github 上有很多对应编程语言的 [.gitignore](https://github.com/github/gitignore) 模板。

```sh
*.swp
```

**include**

```sh
*.a
!lib.a
```

**status**

查看仓库的状态。

```sh
git status
```

答案是 database.yml。

**number_of_files_committed**

```sh
git status
```

答案是 2。

**rm**

```sh
git status
git rm deleteme.rb
```

**rm_cached**

```sh
git status
git rm --cached deleteme.rb
```

**stash**

将当前的修改都暂时保存起来，适合当你有更紧急的 bug 需要去修复，但是当前工作还未完成。

```sh
git stash
```

其他相关的命令：

```sh
# 查看保存了哪些工作区
git stash list
# 恢复工作区，但是不删除 stash 的内容
git stash apply
# 删除 stash 的内容
git stash drop
# 结合恢复和删除的功能
git stash pop
```

**rename**

```sh
git mv oldfile.txt newfile.txt
```

**restructure**

```sh
mkdir src
git mv *.html src/
```

**log**

```sh
git log
```

**tag**

```sh
git tag new_tag
```

其他相关的命令：

```sh
# 查看当前的 tag
git tag
# 给 tag 添加备注信息
git tag -a v0.1.2 -m “0.1.2版本”
```

**push_tags**

```sh
git tag
git push --tags origin master
```

其他相关的命令：

```sh
# 推送某个 tag
git push origin v1.1
```

**commit_amend**

将本次修改附加到上次的 commit 中。

```sh
git add forgotten_file.rb
git commit --amend
```

**commit_in_future**

```sh
# 首先获取当前的时间
date -R
# 输出当前时间：Wed, 22 Nov 2017 17:24:25 +0800
git commit --date "23 Nov 2017 17:22:20 +0800" -m "commit in future"
```

**reset**

```sh
git reset HEAD to_commit_second.rb
git commit -m"commit to_commit_first.rb"
```

![git reset](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfkl0o4p9j20rs0j477j.jpg)

- `--soft` 参数将上一次的修改放入暂存区
- `--mixed` 参数将上一次的修改放入工作区
- `--hard` 参数直接将上一次的修改抛弃

**reset_soft**

```sh
git reset --soft HEAD^1
```

**checkout_file**

```sh
git checkout -- config.rb
```

**remote**

```sh
git remote
```

**remote_url**

```sh
git remove -v
```

答案是 [https://github.com/githug/not_a_repo](https://github.com/githug/not_a_repo)。

**pull**

```sh
git pull origin master
```

**remote_add**

```sh
git remote add origin https://github.com/githug/githug
```

**push**

```sh
git rebase origin master
git push origin master
```

**diff**

```sh
git diff
```

![git diff](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfkkzbr3zj20rs0g7jw5.jpg)

- `git diff` 查看工作区与暂存区之间的差异
- `git diff --cached` 查看暂存区与仓库之间的差异
- `git diff HEAD` 查看仓库与工作区之间的差异

**blame**

```sh
git blame config.rb
```

**branch**

```sh
git checkout -b test_code
```

**checkout**

```sh
git checkout -b my_branch
```

**checkout_tag**

```sh
git checkout v1.2
```

**checkout_tag_over_branch**

```sh
# 当分支名和 tag 名字相同时，指定 tags。
git checkout tags/v1.2
```
**branch_at**

```sh
# 以上一条 commit 为基础，常见新的 branch。
git branch test_branch HEAD^1
```

**delete_branch**

```sh
# -D 强制删除
git branch -d delete_me
```

**push_branch**

```sh
git push origin test_branch
```

**merge**

```sh
git merge feature
```

**fetch**

```sh
git fetch origin
```

其实 `git pull` 就是 `git fetch` 和 `git merge` 两条命令的功能。

**rebase**

```sh
git rebase master feature
```

其他相关命令：

```sh
git rebase -i HEAD~4
```

以交互式模式，进入前四条 commit 进行相关操作。

![git rebase](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfkl03znlj20rs0ixdj5.jpg)

**rebase_onto**

当你发现基于错误的分支进行开发的时候，可以重新 rebase 到正确的分支。

```sh
git rebase --onto master wrong_branch readme-update
```

**repack**

将版本库未打包的松散对象打包。

```sh
git repack
```

**cherry-pick**

把 feature 分支的某些 commit 合并到 master。

```sh
git cherry-pick ca32a6dac7b6f97975edbe19a4296c2ee7682f68
```

**grep**

```sh
git grep TODO
```

**rename_commit**

```sh
git log
git rebase -i dbc4240694ff708af5bc2ba05329b44ef96d747e
# 然后 reword 第一条 commit。
```

**squash**

```sh
git log
git rebase -i af19867dff35833c2ae251a6a86a7ee40b705b14
# 然后将需要合并的 commit 改成 squash 或者简写 s。
```

**merge_squash**

```sh
git merge --squash long-feature-branch
git commit -m "long-feature-barnch
```

**reorder**

```sh
git rebase -i 425164d1310fc664bae9b0c4e4ad7621ebca24f7
# 修改 pick 的顺序即可
```

**bisect**

```sh
git bisect start master f608824888b83bbedc1f658be7496ffea467a8fb
git bisect run make test
```

**stage_lines**

同一个文件按照行的修改来提交 commit。

```sh
git add -p feature.rb
```

- 输入 y 来缓存该块
- 输入 n 不缓存该块
- 输入 e 来人工编辑该块
- 输入 d 来退出或进入下一个文件
- 输入 s 来分割这个块

**find_old_branch**

`git reflog` 命令记录了你对仓库的操作。

```sh
git reflog
git checkout solve_world_hunger
```

**revert**

```sh
git revert 1ee8d2cfff0e26c0d7a093e6ffea259b03a8859d
```

`git revert` 只会舍弃你选的 commit，而 `git reset` 会将你选择的 commit 以及之后的 commit 都舍弃。

**restore**

```sh
git reflog
git checkout 950b31e
```

**conflict**

```sh
git merge mybranch
vim poem.txt
```

**submodule**

```sh
git submodule add https://github.com/jackmaney/githug-include-me ./githug-include-me
```

**contribute**

在 github 网页端发起 pull request。




