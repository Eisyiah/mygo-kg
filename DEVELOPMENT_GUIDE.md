# MyGO Knowledge Graph Archive - 开发指南

> 本文档面向后续 AI 助手（或其他开发者），记录项目架构、已使用的外部项目、调试方法及剩余工作。

---

## 项目概况

基于 plan.txt 的设计，用 Astro 静态站点框架构建 BanG Dream! It's MyGO!!!!! / Ave Mujica 的知识图谱档案站。所有内容节点（角色、歌曲、事件、文档、段落、句子）可互相关联、搜索、可视化。

**部署目标**: GitHub Pages（静态生成，无后端）

---

## 目录结构

```
E:\openGO\
├── astro.config.mjs          # Astro 配置（MDX, Sitemap 集成）
├── package.json              # 依赖管理
├── tsconfig.json             # TypeScript 配置（路径别名）
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── public/
│   ├── favicon.svg
│   └── data/                 # 构建生成的 JSON 数据（relationships, backlinks, timeline, graph, search-index）
├── scripts/
│   ├── build-all.ts          # 一键构建所有数据
│   ├── build-relationships.ts # 关系引擎 + 反向链接 + 搜索索引 + 时间线 + 图数据
│   ├── build-search-index.ts  # FlexSearch 配置
│   └── build-graph.ts        # 独立图数据构建（可选）
└── src/
    ├── content/
    │   ├── config.ts          # Astro Content Collections 定义（9个集合）
    │   ├── characters/        # 角色内容（frontmatter + MD）
    │   ├── songs/             # 歌曲内容
    │   ├── episodes/          # 动画集数
    │   ├── events/            # 事件
    │   ├── radio/             # 广播
    │   ├── interviews/        # 访谈
    │   ├── lives/             # 演唱会
    │   ├── tags/              # 标签
    │   └── documents/         # 文档（最长内容）
    ├── types/
    │   ├── entities.ts        # 所有实体类型定义
    │   ├── relationships.ts    # 关系/边类型定义 + 评分权重
    │   └── index.ts           # 统一导出
    ├── lib/
    │   ├── index.ts           # 统一导出
    │   ├── id.ts              # ID 生成系统（entityId, contentId, parseId, idToUrl）
    │   ├── content-parser.ts  # Markdown → Document 解析（gray-matter）
    │   ├── paragraph-splitter.ts # 段落分割（双换行）
    │   ├── sentence-splitter.ts   # 句子分割（中英文句号/问号/感叹号）
    │   ├── entity-linker.ts   # 实体自动链接（正则匹配角色/歌曲/事件名）
    │   ├── relationship-engine.ts  # 关系评分引擎（共享角色+3, 歌曲+4, 事件+5 等）
    │   ├── backlinks.ts       # 反向链接索引构建
    │   ├── search-index.ts    # FlexSearch 索引构建
    │   ├── timeline.ts        # 时间线数据生成 + 按角色/类型过滤
    │   ├── graph.ts           # Cytoscape.js 图数据构建 + 过滤 + 转换
    │   ├── recommendation.ts  # 推荐系统（基于关系评分 Top-N）
    │   └── import/
    │       ├── index.ts        # 统一导出
    │       ├── markdown.ts    # Markdown 导入（gray-matter 解析）
    │       ├── txt.ts         # 纯文本导入
    │       ├── json.ts        # JSON 导入
    │       ├── html.ts        # HTML 导入（linkedom 解析）
    │       └── bulk.ts        # 批量文件夹导入
    ├── layouts/
    │   ├── BaseLayout.astro   # 基础布局（导航 + 页脚 + 全局样式）
    │   ├── EntityLayout.astro # 实体页面布局（内容 + 反向链接 + 推荐）
    │   └── DocumentLayout.astro # 文档页面布局（内容 + 反向链接）
    ├── pages/                 # 所有页面路由
    │   ├── index.astro        # 首页
    │   ├── about.astro        # 关于页
    │   ├── search.astro       # 搜索页
    │   ├── graph.astro        # 知识图谱页
    │   ├── characters/        # 角色列表 + [id] 详情
    │   ├── songs/             # 歌曲列表 + [id] 详情
    │   ├── episodes/          # 集数列表 + [id] 详情
    │   ├── events/            # 事件列表 + [id] 详情
    │   ├── radio/             # 广播列表 + [id] 详情
    │   ├── interviews/        # 访谈列表 + [id] 详情
    │   ├── lives/             # 演唱会列表 + [id] 详情
    │   ├── tags/              # 标签云 + [id] 详情
    │   ├── timeline/          # 时间线
    │   ├── sentence/[id].astro
    │   └── paragraph/[id].astro
    ├── components/
    │   ├── graph/KnowledgeGraph.astro    # Cytoscape.js 交互图谱
    │   ├── search/SearchBox.astro        # FlexSearch 搜索框
    │   ├── timeline/Timeline.astro       # 时间线视图
    │   ├── backlinks/Backlinks.astro     # 反向链接组件
    │   └── recommendations/Recommendations.astro  # 推荐组件
    └── styles/
        └── global.css        # 全局样式（暗色主题 + 响应式）
```

---

## 外部项目使用情况（c/ 文件夹）

| 项目 | 路径 | 是否直接使用 | 使用方式 |
|------|------|:---:|------|
| **Cytoscape.js** | `c/cytoscape.js-unstable/` | ✅ 是 | 作为 npm 依赖 `cytoscape`，在 `KnowledgeGraph.astro` 组件中用于知识图谱可视化（节点+边的交互渲染） |
| **Logseq** | `c/logseq-master/` | ❌ 间接参考 | 参考了其 DataScript 数据模型、块（Block）嵌套结构、反向链接概念。具体参考了 `src/main/frontend/db/model.cljs` 的实体字段设计和 `src/main/frontend/graph.cljs` 的图视图思路 |
| **MarkItDown** | `c/markitdown-0.1.6/` | ❌ 间接参考 | 参考了其格式转换架构（多路由器分发模式），影响了 `src/lib/import/` 导入管线的设计：每种格式一个导入器，统一路由 |
| **Quartz** | `c/quartz-5/` | ❌ 间接参考 | 参考了其构建管线（transformer → filter → emitter）、FlexSearch 集成、反向链接、图可视化组件。Astro 的 Content Collections 模式类似 Quartz 的插件系统。具体参考了 `quartz/plugins/transformers/`、`quartz/components/Graph.tsx`、`quartz/components/Search.tsx` |
| **Unstructured** | `c/unstructured-main/` | ❌ 间接参考 | 参考了其文档分区（partitioning）和分块（chunking）概念，影响了 `paragraph-splitter.ts` 和 `sentence-splitter.ts` 的设计。元素类型体系（Title, NarrativeText, ListItem 等）影响了 `entities.ts` 中的类型定义 |

### 总结

只有 **Cytoscape.js** 是直接代码依赖（npm 包）。其他四个项目作为**设计参考**，提供了以下核心概念：

- Logseq → 节点化数据模型、反向链接
- MarkItDown → 多格式导入管线
- Quartz → 构建管线、FlexSearch 集成、静态站点生成
- Unstructured → 文档分段/分句、元素类型体系

---

## 调试方法

### 1. 安装依赖

```bash
cd E:\openGO
npm install
```

### 2. 开发服务器

```bash
npm run dev
# 或
npm start
# 访问 http://localhost:4321
```

Astro 开发服务器支持 HMR 热更新。修改 `.astro`、`.ts`、`.css` 文件后浏览器自动刷新。

### 3. 构建数据

```bash
# 一键构建所有数据（关系到 JSON）
npm run build:data
# 或逐步执行
npm run build:relationships
npm run build:search
npm run build:graph
```

构建产物输出到 `public/data/` 目录：
- `relationships.json` — 关系评分数据
- `backlinks.json` — 反向链接索引
- `search-index.json` — 搜索条目
- `timeline.json` — 时间线数据
- `graph.json` — Cytoscape.js 图数据
- `search-config.json` — FlexSearch 配置

### 4. 完整构建

```bash
npm run build:full
# 等价于: npm run build:data && npm run build
```

### 5. 预览构建结果

```bash
npm run preview
```

### 6. 添加内容

在 `src/content/` 对应子目录中添加 `.md` 文件，遵循 frontmatter schema（见 `src/content/config.ts`）。

示例（角色）：
```markdown
---
name: 高松 燈
nameJa: 高松 燈
aliases:
  - Tomori
description: MyGO!!!!!的主唱
group: mygo
voiceActor: 羊宮 妃那
---

# 高松 燈

（正文内容...）
```

### 7. 调试 TypeScript 模块

```bash
# 运行单个脚本调试
npx tsx scripts/build-relationships.ts
```

### 8. GitHub Actions 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动执行：
1. `npm ci`
2. `npm run build:data`
3. `npm run build`
4. 部署到 GitHub Pages

---

## 剩余工作

### P0 - 核心功能待实现

1. **FlexSearch 客户端搜索逻辑** — `SearchBox.astro` 中目前是空壳，需要加载 `search-index.json` 并初始化 FlexSearch 索引，实现实时搜索和高级筛选（角色/歌曲/事件/标签/类型/日期范围）
2. **Cytoscape.js 图谱交互完善** — `KnowledgeGraph.astro` 需要完善：焦点模式（focus mode）、实体类型过滤（类型复选框与 cytoscape 联动）、关系类型过滤、路径探索功能
3. **Sentence/Paragraph 详情页** — `sentence/[id].astro` 和 `paragraph/[id].astro` 目前是占位空页面，需要实现：从 JSON 数据加载具体句子/段落、显示上下文、显示关联实体、显示反向链接
4. **Document 内容页面** — 缺少 `documents/[id].astro`，需要实现文档的完整内容渲染（分层展示 Document → Section → Paragraph → Sentence）
5. **构建脚本完善** — `build-relationships.ts` 中 `getCollection` 是 Astro 运行时 API，不能在 tsx 脚本中直接调用。需要改为直接读取 `src/content/` 目录的 MD 文件并用 `gray-matter` 解析

### P1 - 内容填充

6. **角色内容** — 目前只有 5 个角色（Tomori, Anon, Rana, Soyo, Taki），需要补充：若叶睦、三角初华、喵梦、丰川祥子等 Ave Mujica 角色，以及其他 BanG Dream 角色
7. **歌曲内容** — 只有 1 首（春日影），需要补充碧天伴走、影色舞、迷星叫、诗超绊等所有 MyGO/Ave Mujica 曲目
8. **动画集数** — 需要 13 集 MyGO + Ave Mujica 集数内容
9. **事件内容** — 只有 CRYCHIC 解散，需要补充大量故事事件
10. **标签内容** — 只有 2 个，需要补充：conflict, growth, betrayal, reunion, foreshadowing, character-development, band-history 等

### P2 - 功能增强

11. **实体链接完善** — `entity-linker.ts` 中 `ENTITY_PATTERNS` 初始为空，需要在构建时从 Content Collections 加载所有角色/歌曲/事件名，调用 `registerEntityPattern()` 注册
12. **反向链接组件数据对接** — `Backlinks.astro` 当前从 `/data/backlinks.json` 加载，需要确保构建脚本正确生成该文件且 key 与实体 ID 匹配
13. **推荐组件数据对接** — 同上，`Recommendations.astro` 需要 `/data/relationships.json` 与当前页面 nodeId 匹配
14. **高级搜索** — plan.txt 中要求支持 `character=tomori song=haruhikage event=crychic-breakup tag=regret type=radio date>2023 speaker=sakiko` 这样的查询语法
15. **Timeline 交互** — 类型筛选下拉菜单需要有 JS 逻辑与前端时间线联动（按系列/角色/类型过滤）
16. **内容层级导航** — Document → Section → Paragraph → Sentence 需要每层可独立寻址且面包屑导航

### P3 - 体验优化

17. **暗色/亮色主题切换** — `global.css` 已有 `prefers-color-scheme` 变量，但缺少手动切换按钮
18. **移动端导航** — 导航栏在移动端隐藏了链接（CSS media query），需要汉堡菜单
19. **图谱性能优化** — 大量节点时 Cytoscape.js 可能卡顿，需考虑虚拟化或分页加载
20. **MDX 支持** — 已配置 `@astrojs/mdx`，可在内容中使用 JSX 组件（如嵌入图表、交互组件）
21. **i18n 多语言** — plan.txt 未要求，但内容自身是日文+中文标题

### P4 - 未来

22. **Graph RAG** — plan.txt Phase 4: 本地嵌入向量、客户端检索、问答、知识路径发现
23. **高级查询语言** — plan.txt Phase 3: 类 Datalog 的查询语法
24. **图分析** — plan.txt Phase 3: 参考 c/ 中的 Cytoscape.js 算法模块（PageRank, 中心性等）

---

## 关键设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 框架 | Astro | 静态站点生成，Content Collections 天然适合内容驱动站点 |
| 图谱库 | Cytoscape.js | 项目已有（c/），功能全面（布局算法、交互、样式） |
| 搜索 | FlexSearch | 参考 Quartz 的方案，纯客户端，无需后端 |
| ID 方案 | `char-tomori`, `doc-radio-12`, `para-radio-12-01-01` | plan.txt 规定的稳定 ID 体系 |
| 关系评分 | 共享角色+3, 歌曲+4, 事件+5, 标签+1, 同月+1, 同类型+1, 同说话人+2 | plan.txt 规定 |
| 内容格式 | Markdown + frontmatter | Astro Content Collections 原生支持 |
| 数据传递 | 构建时生成 JSON → 客户端 Fetch 加载 | 静态站点无后端，数据嵌入 public/data/ |

---

## 常见问题

**Q: 为什么不用 Quartz 直接做？**
A: Quartz 是数字花园笔记站，MyGO 项目需要更细粒度的节点（句子级）、关系引擎、Cytoscape.js 图谱等，超出了 Quartz 的设计范围。但参考了其构建管线和搜索集成思路。

**Q: 为什么不用 Logseq？**
A: Logseq 是笔记工具，数据在 DataScript（内存 Datalog），难以生成静态站点。参考了其块级数据模型和反向链接概念。

**Q: 构建脚本为什么不能直接用 `getCollection`？**
A: `getCollection('characters')` 是 Astro 运行时 API，只在 `.astro` 文件或构建hooks中可用。独立 tsx 脚本需要直接读文件系统 + gray-matter 解析。

**Q: 如何添加新的内容类型？**
1. 在 `src/types/entities.ts` 添加类型
2. 在 `src/content/config.ts` 添加集合定义
3. 在 `src/pages/` 添加列表页 + 详情页
4. 在 `src/lib/id.ts` 的 `ENTITY_PREFIXES` 中添加前缀