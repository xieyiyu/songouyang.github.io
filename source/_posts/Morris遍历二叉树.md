---
title: Morris 遍历二叉树
categories: 算法
comments: true
mathjax: false
tags:
  - 树
abbrlink: 27490
date: 2018-02-03 10:29:15
---

Morris Traversal 方法实现前序、中序以及后序遍历二叉树。相比使用栈或者递归（也是通过栈空间）方法，Morris 方法可以在空间复杂度为 `O(1)`，时间复杂度为 `O(n)` 的条件下实现对二叉树的遍历。

<!--more-->

## 前序遍历

![Binary-Tree-Preorder-Traversal](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfmbw1fanj20m809g0wn.jpg "Morris 前序遍历示意图")

1. 如果当前节点左孩子 cur->left 为空，输出当前节点 cur 并指向右孩子 cur->right。
2. 如果当前节点左孩子 cur->left 不为空，那么在当前节点的左子树中找出前驱节点 pre，也就是左子树中最大的点。
    - 如果前驱节点的右孩子 pre->right 为空，那么将右孩子指向当前节点。**输出当前节点**。当前节点更新为当前节点的左孩子。
    - 如果前驱节点的右孩子 pre->right 不为空，也就是指向当前节点。重新将右孩子设为空。当前节点更新为当前节点的右孩子。
3. 重复 1、2 直到当前节点为空。

```cpp
class Solution {
public:
    vector<int> preorderTraversal(TreeNode* root) {
        TreeNode* cur = root;
        TreeNode* pre = NULL;
        vector<int> result;
        while(cur!=NULL){
            if (cur->left == NULL){
                result.push_back(cur->val);
                cur = cur->right;
            }else{
                pre = cur->left;
                while(pre->right!=NULL && pre->right!=cur){
                    pre = pre->right;
                }
                if (pre->right==NULL){
                    pre->right=cur;
                    result.push_back(cur->val);
                    cur = cur->left;
                }else{
                    pre->right = NULL;
                    cur = cur->right;
                }
            }
        }
        return result;
    }
};
```

## 中序遍历

![Binary-Tree-Inorder-Traversal](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfme166lbj20m809gdjn.jpg "Morris 中序遍历示意图")

1. 如果当前节点左孩子 cur->left 为空，输出当前节点 cur 并指向右孩子 cur->right。
2. 如果当前节点左孩子 cur->left 不为空，那么在当前节点的左子树中找出前驱节点 pre，也就是左子树中最大的点。
    - 如果前驱节点的右孩子 pre->right 为空，那么将右孩子指向当前节点。当前节点更新为当前节点的左孩子。
    - 如果前驱节点的右孩子 pre->right 不为空，也就是指向当前节点。重新将右孩子设为空。**输出当前节点**。当前节点更新为当前节点的右孩子。
3. 重复 1、2 直到当前节点为空。

```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        TreeNode* cur = root;
        TreeNode* pre = NULL;
        vector<int> result;
        while(cur!=NULL){
            if (cur->left == NULL){
                result.push_back(cur->val);
                cur = cur->right;
            }else{
                pre = cur->left;
                while(pre->right!=NULL && pre->right!=cur){
                    pre = pre->right;
                }
                if (pre->right == NULL){
                    pre->right=cur;
                    cur = cur->left;
                }else{
                    pre->right = NULL;
                    result.push_back(cur->val);
                    cur = cur->right;
                }
            }
        }
        return result;
    }
};
```

## 后序遍历

![Binary-Tree-Postorder-Traversal](https://wx4.sinaimg.cn/large/e2a28cd6ly1fsfmfjy59bj20m80awgq9.jpg "Morris 后序遍历示意图")

1. 新增临时节点 dump，并且将 root 设为 dump 的左孩子。
2. 如果当前节点左孩子 cur->left 为空，输出当前节点 cur 并指向右孩子 cur->right。
3. 如果当前节点左孩子 cur->left 不为空，那么在当前节点的左子树中找出前驱节点 pre，也就是左子树中最大的点。
    - 如果前驱节点的右孩子 pre->right 为空，那么将右孩子指向当前节点。当前节点更新为当前节点的左孩子。
    - 如果前驱节点的右孩子 pre->right 不为空，也就是指向当前节点。**逆序输出当前节点左孩子到前序节点的路径**。重新将右孩子设为空。当前节点更新为当前节点的右孩子。
4. 重复 2、3 直到当前节点为空。

逆序打印路径其实就是逆序打印单链表节点。先将单链表反转，然后依次打印，接下来重新反转到初始状态。

```cpp
class Solution {
public:
    vector<int> postorderTraversal(TreeNode* root) {
        TreeNode dump(-1);
        dump.left = root;
        TreeNode* cur = &dump;
        TreeNode* pre = NULL;
        vector<int> result;
        while(cur!=NULL){
            if (cur->left == NULL){
                cur = cur->right;
            }else{
                pre = cur->left;
                while(pre->right!=NULL && pre->right!=cur){
                    pre = pre->right;
                }
                if (pre->right == NULL){
                    pre->right=cur;
                    cur = cur->left;
                }else{
                    printReverse(cur->left, pre, result);
                    pre->right = NULL;
                    cur = cur->right;
                }
            }
        }
        return result;
    }

    void printReverse(TreeNode* from, TreeNode* to, vector<int>& result){
        Reverse(from, to);
        TreeNode* p = to;
        while(true){
            result.push_back(p->val);
            if(p == from){
                break;
            }
            p = p->right;
        }
        Reverse(to, from);
    }

    void Reverse(TreeNode* from, TreeNode* to){
        TreeNode* x = from;
        TreeNode* y = from->right;
        TreeNode* z;
        if (from == to){
            return;
        }
        x->right = NULL;
        while(x != to){
            z = y->right;
            y->right = x;
            x = y;
            y = z;
        }
    }
};
```

## 总结

Morris 方法遍历之所以能够在 `O(1)` 的空间的条件下完成是因为它充分利用到叶子的左右孩子来记录上层关系，从而不需要额外的栈空间来记录顺序关系。通过三种遍历可以看到，其实总体上的代码逻辑没有发生改变，主要是改变了输出结果的时机和方式。
