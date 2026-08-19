# Lumen Journal Design System

## 设计方向

这次重构围绕三个词展开：克制、层级、空气感。页面要像一间光线处理很好的展厅，文字和作品有足够呼吸空间，动效只负责把内容托出来，不能喧宾夺主。

## 模块化宣传页机制

所有展示页模板集中在：

```text
frontend/src/releaseTemplates.js
```

每个模板包含：

- `value`：保存到数据库的模板 ID
- `label`：后台显示名称
- `visual`：前台视觉组件类型
- `mood`：明暗气质
- `accent` / `accent2`：主辅强调色
- `ink`：文字颜色
- `bg`：背景底色

前台渲染时，`HomePage.jsx` 根据 release 的 `visual_style` 调用 `getReleaseTemplate()`，再交给 `ReleaseTemplateStage` 渲染。后台编辑时，`AdminDashboardPage.jsx` 使用同一份 `RELEASE_TEMPLATES`，避免前后台各唱各的戏。

## 24 款模板

| ID | 名称 | 气质 |
|---|---|---|
| orbit | Legacy 01 · 轨道核心 | 深色、环形、理性 |
| ribbon | Legacy 02 · 横向光带 | 纸感、横向叙事、醒目 |
| stack | Legacy 03 · 卡片层叠 | 卡片、产品感、轻松 |
| console | Legacy 04 · 控制台 | 技术、终端、密集信息 |
| prism | 01 · 棱镜展台 | 折射、斜切、空间感 |
| aurora | 02 · 极光穹顶 | 深色、柔光、流体 |
| editorial | 03 · 杂志封面 | 大标题、版式、出版感 |
| cinema | 04 · 电影幕布 | 暗场、聚焦、叙事 |
| atlas | 05 · 地图等高线 | 地图、路径、探索 |
| lattice | 06 · 黄金格点 | 数学、格点、秩序 |
| nebula | 07 · 星云矩阵 | 星云、点阵、未来感 |
| glass | 08 · 玻璃陈列柜 | 玻璃、透亮、产品陈列 |
| timeline | 09 · 时间轴发布 | 进程、节点、发布节奏 |
| spotlight | 10 · 聚光剧场 | 剧场、强焦点、戏剧性 |
| monolith | 11 · 黑色碑体 | 极简、黑白、重量感 |
| garden | 12 · 温室花园 | 有机、柔和、生长 |
| blueprint | 13 · 蓝图工程 | 工程、坐标、结构图 |
| liquid | 14 · 液态金属 | 曲面、流动、金属光 |
| constellation | 15 · 星座网络 | 星图、连接、关系网络 |
| gallery | 16 · 艺廊切片 | 画廊、切片、策展感 |
| horizon | 17 · 地平线渐层 | 远景、层叠、开阔 |
| capsule | 18 · 胶囊模块 | 胶囊 UI、模块化、轻科技 |
| origami | 19 · 折纸剧场 | 纸张、折面、手工几何 |
| equation | 20 · 方程曲面 | 数学、曲面、证明感 |

## 扩展新模板的方法

1. 在 `frontend/src/releaseTemplates.js` 增加一项模板配置。
2. 在 `HomePage.jsx` 的 `TemplateVisual` 中增加对应 `visual` 分支。
3. 在 `index.css` 增加 `.visual-xxx` 相关样式。
4. 在 `backend/db.js` 的 `releaseStyles` 中加入新 ID。
5. 运行 `npm run build` 验证。

这样新增模板后，后台会自动出现对应选项。
