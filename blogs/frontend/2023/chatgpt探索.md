---
title: chatgpt探索
date: 2023-07-04
tags:
  - nodejs
  - JavaScript
  - Vue3
categories:
  - 前端
isShowComments: true
sticky:
  - true
  - 1
---

### 项目介绍
基于openai api服务本地化部署项目实现AI对话，借助腾讯云函数。  
从统一的IP请求openai API服务，防止账号被封；无需vpn也可以访问。
对接了飞书api，实现了单点登录。


#### 项目仓库地址
https://gitee.com/pdzz/pd-openai
https://gitee.com/pdzz/pluschat


#### 相关技术栈
前端：vite + pinia
后端：express + sequelize
部署：前端nginx、后端pm2
