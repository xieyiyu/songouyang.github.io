---
title: CSAPP Shell Lab
comments: true
mathjax: false
tags: CSAPP
categories: 练习
abbrlink: 63565
date: 2018-12-21 14:57:58
---

《深入理解计算机操作系统》的 Shell Lab 实验。主要是实现一个 Shell 的几个功能。

<!--more-->

Shell 程序其他部分都已经完成了，只需要完善下面几个函数即可。

- `void eval(char *cmdline);` 解析和运行命令
- `builtin_cmd(char **argv);` 识别和解析内置命令
- `void do_bgfg(char **argv);` 实现 bg 和 fg 命令
- `void waitfg(pid_t pid);` 等待前台程序运行结束
- `void sigchld_handler(int sig);` 响应 SIGCHLD
- `void sigtstp_handler(int sig);` 响应 SIGINT
- `void sigint_handler(int sig);` 响应 SIGTSTP

本实验的教材：[下载地址](https://csapp.cs.cmu.edu/3e/shlab.pdf) 。

## eval

这个书上已经有一个简单的版本，只需要稍微改动，增加对 `joblist` 的支持。在 `fork` 之前需要阻塞 `SIGCHLD` 信号。`fork` 之后子进程需要解除阻塞。在 `addjob` 之后把父进程也接触阻塞。

```c
void eval(char *cmdline) {
    char * argv[MAXARGS];
    char buf[MAXARGS];
    int bg;
    pid_t pid;
    strcpy(buf, cmdline);
    bg = parseline(buf, argv);
    if(argv[0] == NULL) {
        return;
    }
    sigset_t mask;
    sigemptyset(&mask);
    sigaddset(&mask, SIGCHLD);
    sigprocmask(SIG_BLOCK, &mask, NULL);
    if(!builtin_cmd(argv)) {
        if((pid=Fork())==0) {
            sigprocmask(SIG_UNBLOCK, &mask, NULL);
            if(setpgid(0,0)<0) {
                unix_error("eval: setgpid failed.\n");
            }
            if(execve(argv[0], argv, environ) < 0) {
                printf("%s: Command not  found.\n", argv[0]);
                exit(0);
            }
        }
        if(!bg) {
            addjob(jobs, pid, FG, cmdline);
        } else {
            addjob(jobs, pid, BG, cmdline);
        }
        sigprocmask(SIG_UNBLOCK,&mask,NULL);
        if(!bg) {
            waitfg(pid);
        } else {
            printf("[%d] (%d) %s\n", pid2jid(pid), pid, cmdline);
        }
    }
    return;
}
```

这里面使用的 `Fork` 函数也是教材中写好的。

```c
pid_t Fork(void) {
    pid_t pid;
    if ((pid = fork()) < 0) {
        unix_error("Fork error");
    }
    return pid;
}
```

## builtin_cmd

`quit` 命令退出程序，`jobs` 命令显示所有进程，`bg` 和 `fg` 分别是把任务放到后台和前台。

```c
int builtin_cmd(char **argv) {
    if(strcmp(argv[0], "quit")==0) {
        printf("exit\n");
        exit(0);
    }
    if(strcmp(argv[0], "jobs")==0) {
        listjobs(jobs);
        return 1;
    }
    if(strcmp(argv[0],"bg")==0 || strcmp(argv[0],"fg")==0) {
        do_bgfg(argv);
        return 1;
    }
    return 0;     /* not a builtin command */
}
```

## do_bgfg

先找到任务 ID，然后转化成数字，并且调用 `kill` 函数。如果是 `bg` 就把任务变成后台，如果是 `fg` 就把任务放到前台并等待任务完成。

```c
void do_bgfg(char **argv) {
    char * id = argv[1];
    struct job_t * job;
    int jobid;
    if(id==NULL) {
        printf("%s command requires PID of jobid argument.\n",argv[0]);
        return;
    }
    if(id[0] == '%') {
        jobid = atoi(id+1);
    } else if(isdigit(id[0])) {
        jobid = atoi(id);
    } else {
        printf("%s: argument must be a PID or %%jobid\n", argv[0]);
        return;
    }
    if((job=getjobjid(jobs, jobid))==NULL) {
        printf("Job does not exist.\n");
        return;
    }
    kill(-(job->pid), SIGCONT);
    if(strcmp(argv[0], "bg")==0) {
        job->state = BG;
    }
    if(strcmp(argv[0], "fg")==0) {
        job->state = FG;
        waitfg(job->pid);
    }
    return;
}
```

{% note info %}

`int kill(pid_t pid, int sig);`

1. `pid` 大于 `0` 时，`pid` 是信号欲送往的进程的标识。
2. `pid` 等于 `0` 时，信号将送往所有与调用 `kill()` 的那个进程属同一个使用组的进程。
3. `pid` 等于 `-1` 时，信号将送往所有调用进程有权给其发送信号的进程，除了进程 `1`。
4. `pid` 小于 `-1` 时，信号将送往以 `-pid` 为组标识的进程。
{% endnote %}

## waitfg

死循直到前台任务完毕。

```c
void waitfg(pid_t pid) {
    while(pid == fgpid(jobs));
    return;
}
```

## sigchld_handler

对于一个子进程结束，主要有 `3` 种原因，正常运行结束，收到 `SIGINT` 终止，收到 `SIGTSTP` 停止。
在 `waitpid` 函数[^1]中 `WNOHANG | WUNTRACED` 代表立即返回的意思。如果是正常运行结束，只需要 `deletejob` 即可。如果是收到 `SIGINT`，那么 `WIFSIGNALED(status)` 会返回 `true`，此时通过 `WTERMSIG(status)` 返回信息信息编号。如果是收到 `SIGTSTP`，通过 `WSTOPSIG(status)` 拿到引起信号停止的信号。

```c
void sigchld_handler(int sig) {
    pid_t pid;
    int status;
    int child_sig;
    while((pid=waitpid(-1, &status, WUNTRACED | WNOHANG))>0) {
        printf("Handling chlid proess %d\n", (int)pid);
        if(WIFSTOPPED(pid)) {
            sigtstp_handler(WSTOPSIG(status));
        } else if (WIFSIGNALED(status)) {
            child_sig = WTERMSIG(status);
            if (child_sig==SIGINT) {
                sigint_handler(child_sig);
            }
        } else {
            deletejob(jobs, pid);
        }
    }
    return;
}
```

## sigtstp_handler

`ST` 在宏里面定义了，代表任务停止的意思。

```c
void sigtstp_handler(int sig) {
    pid_t pid = fgpid(jobs);
    int jid = pid2jid(pid);
    if(pid!=0) {
        printf("Job [%d] stopped by SIGINT.\n",jid);
        (*getjobpid(jobs,pid)).state = ST;
        kill(-pid,sig);
    }
    return;
}
```

## sigint_handler

找到对应的前台任务 ID，并且从 `joblist` 删除同时把任务杀掉。

```c
void sigint_handler(int sig) {
    pid_t pid = fgpid(jobs);
    int jid = pid2jid(pid);
    if(pid!=0) {
        printf("Job [%d] terminated by SIGINT.\n",jid);
        deletejob(jobs,pid);
        kill(-pid,sig);
    }
    return;
}
```

## 总结

这个实验的话，很多代码都可以参考教材，更偏向于系统函数的调用，感觉比之前的容易一点。

[^1]: [系统调用跟我学(3)](https://www.ibm.com/developerworks/cn/linux/kernel/syscall/part3/index.html)
