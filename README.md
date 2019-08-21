### 快速开始

#### 克隆项目地址

``` bash
$ git clone http://git.jd.com/sjds-MP/blogs.git
```
如果没有权限，请联系：huangshaolu

#### 进入文章目录
``` bash
$ cd blogs/source/_posts
```

#### 开始写博客吧！
``` bash
$ vim myblog.md
```

注意：hexo博客有布局和模板，可以参考：[Writing](https://hexo.io/docs/writing.html)。或者复制本md，修改之后发布。
新增的md文件，确认头部需要加上如下信息：
```
---
title: 标题
subtitle: 描述
cover: 封面图片地址
date: 时间（YYYY-MM-DD HH:II:SS）
tags: 标签
categories: 所属分类（只能从如下分类中选择：H5开发，小程序开发，RN开发，PC端开发，NodeJS，性能优化，知识分享，项目总结，转载翻译，资源合集，生活玩乐）
ckey: 对应评论的issureid（如：1代表：http://git.jd.com/sjds-MP/blogs/issues/1）。如果需要为文章新增评论功能，需要作者手动去http://git.jd.com/sjds-MP/blogs/issues页新增issues，并把生成的issureid，填到ckey字段
author:
    nick: 昵称
    github_name: 填写erp吧
---

```


#### 提交即发布！
``` bash
$ git commit
$ git push
```

#### 线上预览
几秒之后，即可在首页查看了：http://wqadmin.jd.com/webstatic/blogs/index.html

<br/>

###### 当然，你还可以搭建本地环境
``` bash
npm install hexo-cli -g
npm install
hexo server
```

###### 评论功能
可查看`开始写博客吧！`模板头部里面的`ckey`字段介绍
