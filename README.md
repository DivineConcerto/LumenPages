# LumenPages

[English](#english) · [中文](#中文)

个人主页 + 文章 + 发布页 + 管理后台。站点文案、文章和发布项在后台改，前台直接更新。

A personal homepage with articles, release pages, and an admin panel. Edit copy and posts in the admin; the site updates from that.

---

## 中文

LumenPages 用来搭个人主页。首页放介绍，下面用整屏发布页展示游戏、作品或外链，另外有文章页。管理员登录后台后可以改站点信息、写文章、上下架发布项，并给每个发布项选一种版式。

### 功能

- 首页、发布页、文章页
- 后台改站点名称、介绍、导航、联系方式
- 后台写文章（Markdown），控制发布和置顶
- 后台管理发布项：标题、介绍、跳转链接、按钮文案、版式
- 24 种发布页风格

### 发布页风格

保留原来的 4 种基础风格，再加上 20 种：

1. Legacy 01 · 轨道核心
2. Legacy 02 · 横向光带
3. Legacy 03 · 卡片层叠
4. Legacy 04 · 控制台
5. 01 · 棱镜展台
6. 02 · 极光穹顶
7. 03 · 杂志封面
8. 04 · 电影幕布
9. 05 · 地图等高线
10. 06 · 黄金格点
11. 07 · 星云矩阵
12. 08 · 玻璃陈列柜
13. 09 · 时间轴发布
14. 10 · 聚光剧场
15. 11 · 黑色碑体
16. 12 · 温室花园
17. 13 · 蓝图工程
18. 14 · 液态金属
19. 15 · 星座网络
20. 16 · 艺廊切片
21. 17 · 地平线渐层
22. 18 · 胶囊模块
23. 19 · 折纸剧场
24. 20 · 方程曲面

模板配置在 `frontend/src/releaseTemplates.js`。后台下拉或 24 宫格里选一个，保存到发布项的 `visual_style`。

### 技术栈

- 前台：React、Vite、Framer Motion、React Router
- 后台：Express、SQLite
- 文章：Markdown

### 启动

```bash
npm install
cp backend/.env.example backend/.env
# 修改 JWT_SECRET 和 ADMIN_PASSWORD
npm run dev
```

- 前台：http://localhost:5173
- 接口：http://localhost:3001
- 后台：`/admin/login`

生产环境：

```bash
npm run build
NODE_ENV=production npm start
```

上线前改好 `.env`。不要提交数据库和真实环境文件。

---

## English

LumenPages is a personal homepage: intro on the home page, full-screen release pages for games, work, or links, plus article pages. After login you can edit site copy, write posts, publish or unpublish releases, and pick a layout for each release.

### Features

- Home, release pages, and articles
- Admin editing for site name, intro, nav, and contact links
- Markdown articles, with publish and featured flags
- Releases: title, intro, URL, button label, and visual style
- 24 release-page styles

### Release styles

The original 4 layouts, plus 20 more:

1. Legacy 01 · Orbit Core
2. Legacy 02 · Ribbon
3. Legacy 03 · Card Stack
4. Legacy 04 · Console
5. 01 · Prism Stage
6. 02 · Aurora Dome
7. 03 · Magazine Cover
8. 04 · Cinema Curtain
9. 05 · Atlas Contours
10. 06 · Golden Lattice
11. 07 · Nebula Grid
12. 08 · Glass Cabinet
13. 09 · Timeline
14. 10 · Spotlight
15. 11 · Monolith
16. 12 · Greenhouse
17. 13 · Blueprint
18. 14 · Liquid Metal
19. 15 · Constellation
20. 16 · Gallery Slices
21. 17 · Horizon
22. 18 · Capsule
23. 19 · Origami
24. 20 · Equation Surface

Templates live in `frontend/src/releaseTemplates.js`. Pick one in the admin; it is stored as `visual_style`.

### Stack

- Front: React, Vite, Framer Motion, React Router
- Back: Express, SQLite
- Articles: Markdown

### Run

```bash
npm install
cp backend/.env.example backend/.env
# set JWT_SECRET and ADMIN_PASSWORD
npm run dev
```

- Front: http://localhost:5173
- API: http://localhost:3001
- Admin: `/admin/login`

Production:

```bash
npm run build
NODE_ENV=production npm start
```

Change `.env` before going live. Do not commit the database or a real env file.
