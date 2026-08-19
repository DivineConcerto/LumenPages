# LumenPages

[English](#english) · [中文](#中文)

一个用来安放自己的个人主页：写文章、发布作品、介绍项目。前台安静，后台可以直接改字、换版式、上下架内容。

A personal homepage for writing, publishing work, and introducing projects. The front is quiet. The back lets you change copy, switch layouts, and ship or unship pages.

---

## 中文

### 这是什么

LumenPages 是一套个人主页系统。它不是再做一个热闹的信息流，而是给你一个自己的地方：首页介绍你是谁、正在做什么；往下用整屏宣传页展示游戏、作品或外部项目；文章页用来放更完整的判断和长期写作。

站点名字、介绍、联系方式、导航、文章和发布项，都可以在后台改。改完立刻反映到前台，不用重新改代码。

### 为什么做它

社交平台适合传播，不适合安放。一句话会被切短，一篇长文要先让位给封面和标题，个人主页则把顺序交还给作者。

LumenPages 按这个想法来做：前台像展厅，文字和作品有呼吸空间；后台像编辑台，负责维护、重写、下线和重新排序。长期写下去，它会慢慢变成一个人的坐标系，而不是一堆发过就散的碎片。

### 打开之后能看到什么

- **首页**：一段个人介绍，再往下是按发布时间排列的宣传屏。
- **宣传页**：每一个发布项都可以选一种视觉骨架。游戏、文章、工具、外部链接都能做成单独一屏。
- **文章**：适合慢慢读的正文，支持 Markdown。
- **管理后台**：登录后改站点信息、写文章、管理发布项、切换模板。

宣传页现在有二十多种模板，从轨道、光带、控制台，到杂志封面、电影幕布、蓝图和艺廊。同一套内容，换一个模板就是换一种出场方式。

### 它怎么工作

前台是 React 页面，负责阅读和浏览。后台接口由 Express 提供，内容存在本地 SQLite 里。管理员登录后拿到短期凭证，才能改站点和发布内容。第一次启动会生成一份示例数据和默认管理员账号，方便你先走通，再换成自己的文字。

本地开发时，前台在 `5173`，接口在 `3001`。生产构建后，后端会直接托管前端页面。

```bash
npm install
cp backend/.env.example backend/.env
# 把 JWT_SECRET 和 ADMIN_PASSWORD 改成你自己的值
npm run dev
```

后台入口：`/admin/login`

默认只用于本地第一次启动。上线前请改掉 `.env` 里的密钥和密码，不要把数据库和真实环境文件提交进仓库。

### 适合谁

适合想要一个自己的站点、又希望后台改字就能上线的人。它适合个人介绍、作品发布、长期写作，不追求做成又一个内容平台。

---

## English

### What this is

LumenPages is a personal homepage system. It is not another noisy feed. It is a place of your own: a front page for who you are and what you are making, full-screen release pages for games, work, or outside projects, and article pages for longer thinking.

Site name, introduction, contact links, navigation, essays, and releases can all be edited in the admin. Changes show up on the site without rewriting the code.

### Why it exists

Social platforms are good at distribution and poor at keeping a person intact. A sentence gets shortened. A long piece has to make room for a cover and a title. A homepage gives the order back to the author.

LumenPages is built around that idea. The front feels like a gallery: type and work have room to breathe. The back feels like an editing desk: maintain, rewrite, take down, reorder. Kept over time, the site becomes a coordinate system, not a pile of posts that vanish after they ship.

### What you see

- **Home**: a short introduction, then release screens in publish order.
- **Release pages**: each item can pick a visual frame. A game, an essay, a tool, or an external link can each take a full screen.
- **Articles**: long-form pages, written in Markdown.
- **Admin**: change site copy, write articles, manage releases, and switch templates after login.

There are more than twenty templates, from orbit, ribbon, and console to magazine cover, cinema curtain, blueprint, and gallery. Same content, different entrance.

### How it works

The front is a React site for reading. Express serves the API. SQLite keeps the content on disk. An admin login issues a short-lived token before anything can be edited. The first launch seeds sample writing and a default admin account, so you can walk through the site, then replace the words with your own.

In development the front runs on `5173` and the API on `3001`. After a production build, the backend hosts the front as well.

```bash
npm install
cp backend/.env.example backend/.env
# set your own JWT_SECRET and ADMIN_PASSWORD
npm run dev
```

Admin: `/admin/login`

The defaults are only for the first local start. Change the secret and password in `.env` before you put the site online. Do not commit the database or a real environment file.

### Who it is for

It is for someone who wants a site of their own, and wants to publish by editing words rather than shipping code every time. It fits a personal introduction, a release wall, and long writing. It is not trying to be another content platform.
