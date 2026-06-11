# openGO 项目源代码详细内容指南（Claude Code 用）

> **路径**: `E:\openGO\c`
> **用途**: 为 Claude Code 提供项目导航和代码理解参考
> **生成日期**: 2026-06-11

---

## 目录

1. [项目总览](#项目总览)
2. [Cytoscape.js](#1-cytoscapejs)
3. [Logseq](#2-logseq)
4. [MarkItDown](#3-markitdown)
5. [Quartz](#4-quartz)
6. [Unstructured](#5-unstructured)
7. [项目间关联](#项目间关联)

---

## 项目总览

| # | 项目 | 版本 | 语言 | 用途 |
|---|------|------|------|------|
| 1 | Cytoscape.js | 3.35.0-unstable | JavaScript | 图论 / 网络可视化库 |
| 2 | Logseq | 0.0.1 (master) | ClojureScript | 知识管理与协作平台 |
| 3 | MarkItDown | 0.1.6 | Python | 文件格式转 Markdown |
| 4 | Quartz | 5.0.0 | TypeScript | Markdown 数字花园静态站点生成器 |
| 5 | Unstructured | main | Python | 非结构化文档预处理库 |

---

## 1. Cytoscape.js

**路径**: `E:\openGO\c\cytoscape.js-unstable\`
**定位**: 纯 JavaScript 图论（网络）库，用于关系数据的可视化和分析。
**背景**: 多伦多大学开发，发表于 Oxford Bioinformatics (2016, 2023)。

### 核心入口

| 入口 | 文件 | 说明 |
|------|------|------|
| ESM 入口 | `src/index.mjs` | `cytoscape()` 工厂函数，创建 Core 实例或注册扩展 |
| UMD 包 | `dist/cytoscape.umd.js` | 浏览器 UMD 打包 |
| ESM 打包 | `dist/cytoscape.esm.mjs` | 浏览器 ESM 打包 |
| CJS 入口 | `src/cjs.mjs` | CommonJS 项目用 |

### 目录结构

```
cytoscape.js-unstable/
├── src/
│   ├── index.mjs              # 主入口：cytoscape() 工厂函数
│   ├── cjs.mjs                # CJS 入口
│   ├── extension.mjs          # 扩展/插件注册系统
│   ├── core/                  # 核心图实例
│   │   ├── index.mjs          # Core 构造函数
│   │   ├── add-remove.mjs     # 元素增删
│   │   ├── animation.mjs      # 动画系统
│   │   ├── events.mjs         # 事件系统
│   │   ├── export.mjs         # 导出 (JSON, 图片)
│   │   ├── layout.mjs         # 布局管理
│   │   ├── notification.mjs   # 通知/日志
│   │   ├── renderer.mjs       # 渲染器管理
│   │   ├── search.mjs         # 图搜索
│   │   ├── style.mjs          # 样式管理
│   │   └── viewport.mjs       # 视口操作 (zoom/pan/fit)
│   ├── collection/            # 图元素 (节点/边) 操作
│   │   ├── index.mjs          # Collection 构造
│   │   ├── algorithms/        # 图论算法集（重点目录）
│   │   │   ├── a-star.mjs
│   │   │   ├── bellman-ford.mjs
│   │   │   ├── bfs-dfs.mjs
│   │   │   ├── betweenness-centrality.mjs
│   │   │   ├── closeness-centrality.mjs
│   │   │   ├── degree-centrality.mjs
│   │   │   ├── dijkstra.mjs
│   │   │   ├── floyd-warshall.mjs
│   │   │   ├── kruskal.mjs           # 最小生成树
│   │   │   ├── pagerank.mjs
│   │   │   ├── karger-stein.mjs      # 最小割
│   │   │   ├── hierholzer.mjs        # 欧拉回路
│   │   │   ├── tarjan-strongly-connected.mjs
│   │   │   ├── hopcroft-tarjan-biconnected.mjs
│   │   │   ├── markov-clustering.mjs
│   │   │   ├── hierarchical-clustering.mjs
│   │   │   ├── k-clustering.mjs
│   │   │   └── affinity-propagation.mjs
│   │   ├── build-style.mjs    # 样式构建
│   │   ├── comparison.mjs     # 元素比较
│   │   ├── compounds.mjs      # 复合节点
│   │   ├── data.mjs           # 数据存取
│   │   ├── dimensions.mjs     # 尺寸/边界
│   │   ├── events.mjs
│   │   └── traversal.mjs
│   └── extensions/            # 内置扩展
│       ├── layout/            # 布局算法
│       │   ├── breadthfirst.mjs
│       │   ├── circle.mjs
│       │   ├── concentric.mjs
│       │   ├── cose.mjs       # CoSE 力导向布局
│       │   ├── grid.mjs
│       │   └── random.mjs
│       └── renderer/          # Canvas 渲染器
│           ├── canvas/        # 底层 Canvas 绘制
│           └── ...各种形状/边/标签绘制模块
├── dist/                      # 构建产物
├── benchmark/                 # 性能基准测试
├── test/                      # Mocha + Playwright 测试
├── documentation/             # 文档源文件
├── package.json
└── rollup.config.mjs          # Rollup 构建配置
```

### API 设计要点

- **`cytoscape(options)`**: 工厂函数，创建 `Core` 实例
- **`cytoscape.use(extension)`**: 注册扩展/插件
- **Core**: 全局操作 (添加/删除元素、布局、视口、事件、样式)
- **Collection**: 元素集合操作 (过滤、遍历、算法、数据读写)
- **Elements**: `eles.nodes()`, `eles.edges()`, `eles.filter()`
- **Algorithms**: `eles.dijkstra()`, `eles.pagerank()`, `eles.aStar()` 等

### 关键依赖

- **运行时**: 零依赖
- **构建**: Rollup, Babel
- **测试**: Mocha, Playwright, Benchmark.js

---

## 2. Logseq

**路径**: `E:\openGO\c\logseq-master\`
**定位**: 隐私优先的开源知识管理平台（类似 Roam Research）。
**范式**: 大纲式编辑 + Markdown/Org-mode + 本地优先存储 + DataScript (Datalog 数据库)。

### 核心入口

| 入口 | 文件 | 说明 |
|------|------|------|
| 前端启动 | `src/main/frontend/core.cljs` | `frontend.core/init` 和 `/start` |
| Electron 主进程 | `src/electron/electron/core.cljs` | 桌面端 |
| CLI | `static/logseq-cli.js` | 命令行工具 |

### 目录结构

```
logseq-master/
├── src/
│   ├── main/
│   │   ├── frontend/          # 🔥 前端核心（ClojureScript + React/Rum）
│   │   │   ├── core.cljs      # 启动/初始化
│   │   │   ├── handler.cljs   # 全局事件处理器
│   │   │   ├── state.cljs     # 全局状态管理
│   │   │   ├── ui.cljs        # UI 基础设施
│   │   │   ├── components/    # UI 组件 (React/Rum)
│   │   │   ├── editor.cljs    # 编辑器核心（富文本/代码编辑）
│   │   │   ├── blocks.cljs    # 块（Block）操作
│   │   │   ├── pages.cljs     # 页面管理
│   │   │   ├── graph.cljs     # 图视图/关系视图
│   │   │   ├── search.cljs    # 全文搜索
│   │   │   ├── commands.cljs  # 命令面板
│   │   │   ├── config.cljs    # 配置管理
│   │   │   ├── db/
│   │   │   │   ├── model.cljs # DataScript 数据模型/Schema
│   │   │   │   └── frontend.rules.cljc # Datalog 规则
│   │   │   ├── extensions/    # 插件系统
│   │   │   ├── format/        # 格式/语法高亮
│   │   │   ├── modules/       # 功能模块
│   │   │   ├── util/          # 工具函数
│   │   │   └── whiteboard.cljs # 白板功能
│   │   ├── electron/          # Electron 桌面端
│   │   └── logseq/            # 命名空间工具
│   ├── main-src/              # 本地源文件
│   └── gen/                   # 自动生成的代码
├── deps/                      # 内部依赖库
│   ├── graph-parser/          # Markdown/Org-mode 解析器 → DataScript 事实
│   ├── outliner/              # 大纲数据模型和操作核心
│   ├── db-sync/               # 实时协作同步 (RTC)
│   ├── publishing/            # 发布/导出功能
│   └── pdfjs-namespaces/      # PDF.js 命名空间
├── resources/                 # 静态资源
├── static/                    # 构建后静态文件
├── scripts/                   # 构建/发布脚本
├── packages/
│   └── ui/                    # shadcn 组件系统包
├── shadow-cljs.edn            # 🔑 ClojureScript 编译配置（核心构建文件）
├── deps.edn                   # Clojure 依赖
├── package.json               # JS 依赖
└── gulpfile.mjs               # Gulp 构建管道
```

### 数据模型（核心理解）

Logseq 用 **DataScript**（内存中的不可变 Datalog 数据库）存储所有数据：

```
Entity (页面/块)
  ├── :block/uuid        # 唯一 ID
  ├── :block/title       # 标题
  ├── :block/content     # 内容
  ├── :block/format      # markdown / org
  ├── :block/parent      # 父块引用
  ├── :block/left        # 同级前一个块
  ├── :block/refs        # 引用其他块/页面
  ├── :block/properties  # 属性 (key-value)
  └── :block/tags        # 标签
```

### 关键依赖

| 类别 | 依赖 |
|------|------|
| 数据 | DataScript (Datalog DB) |
| UI | Rum (React 封装), React 19, shadcn |
| 路由 | Reitit |
| 插件 | SCI (沙盒 Clojure 解释器) |
| 构建 | shadow-cljs, Gulp, Webpack, pnpm |
| 桌面 | Electron |
| 移动 | Capacitor (Android/iOS) |
| 其他 | D3-force, CodeMirror, KaTeX, PDF.js, Pixi.js |

### 平台

- **桌面**: Electron (Windows/Mac/Linux)
- **Web**: 浏览器 SPA
- **移动**: Capacitor (Android/iOS)

---

## 3. MarkItDown

**路径**: `E:\openGO\c\markitdown-0.1.6\`
**定位**: 微软出品的轻量 Python 工具，将各种文件格式转换为 Markdown，用于 LLM 和文本分析管线。

### 核心入口

| 入口 | 文件 | 说明 |
|------|------|------|
| CLI | `packages/markitdown/src/markitdown/__main__.py` | `markitdown` 命令行 |
| API | `packages/markitdown/src/markitdown/_markitdown.py` | `MarkItDown` 类 |

### 目录结构

```
markitdown-0.1.6/
├── packages/
│   ├── markitdown/
│   │   └── src/markitdown/
│   │       ├── __init__.py
│   │       ├── __main__.py     # CLI 入口
│   │       ├── _markitdown.py  # 🔑 MarkItDown 核心类
│   │       ├── _converter.py   # DocumentConverter 基类
│   │       ├── converters/     # 🔥 所有格式转换器
│   │       │   ├── _html_converter.py
│   │       │   ├── _pdf_converter.py
│   │       │   ├── _docx_converter.py
│   │       │   ├── _xlsx_converter.py
│   │       │   ├── _xls_converter.py
│   │       │   ├── _pptx_converter.py
│   │       │   ├── _image_converter.py
│   │       │   ├── _audio_converter.py
│   │       │   ├── _youtube_converter.py
│   │       │   ├── _wikipedia_converter.py
│   │       │   ├── _outlook_msg_converter.py
│   │       │   ├── _epub_converter.py
│   │       │   ├── _zip_converter.py
│   │       │   ├── _rss_converter.py
│   │       │   ├── _jupyter_converter.py
│   │       │   ├── _csv_converter.py
│   │       │   ├── _json_converter.py
│   │       │   └── _xml_converter.py
│   │       ├── plugins/        # 第三方插件系统
│   │       │   └── _plugin_loader.py
│   │       └── utils/
│   ├── markitdown-mcp/         # MCP 服务器封装
│   ├── markitdown-ocr/         # OCR 插件 (LLM Vision)
│   └── markitdown-sample-plugin/
├── python/
│   └── pyproject.toml          # Python 项目配置
└── docs/
```

### 架构设计

```
用户输入 (文件/流/URL)
    │
    ▼
MarkItDown.convert()  ← 核心入口
    │
    ├── 文件类型检测 (magika + mimetypes)
    │
    ├── 转换器路由 (按优先级匹配 accepts())
    │   ├── 特定格式 (优先级 ~0): PDF, DOCX, XLSX, PPTX, EPUB...
    │   └── 通用回退 (优先级 ~10): PlainText
    │
    ▼
DocumentConverter.convert() → DocumentConverterResult
    │
    ▼
Markdown 输出 (纯文本/流式)
```

### 支持的格式

| 格式 | 转换器 | 关键依赖 |
|------|--------|----------|
| PDF | `_pdf_converter.py` | pdfminer.six + pdfplumber |
| DOCX | `_docx_converter.py` | mammoth + lxml |
| XLSX | `_xlsx_converter.py` | pandas + openpyxl |
| XLS | `_xls_converter.py` | pandas + xlrd |
| PPTX | `_pptx_converter.py` | python-pptx |
| HTML | `_html_converter.py` | beautifulsoup4 |
| 图片 | `_image_converter.py` | EXIF + OCR (tesseract/Gemini/GPT-4o) |
| 音频 | `_audio_converter.py` | SpeechRecognition + pydub |
| EPUB | `_epub_converter.py` | ebooklib |
| Outlook MSG | `_outlook_msg_converter.py` | olefile |
| YouTube | `_youtube_converter.py` | Transcript API |
| Wikipedia | `_wikipedia_converter.py` | API |
| ZIP | `_zip_converter.py` | 递归遍历 |
| RSS | `_rss_converter.py` | feedparser |
| Jupyter | `_jupyter_converter.py` | nbformat |
| CSV/JSON/XML | 各自转换器 | 标准库/pandas |

### 云服务集成

- **Azure Document Intelligence**: 云端文档提取
- **Azure Content Understanding**: 多模态（文档/图片/音频/视频）+ 结构化字段提取

### 关键依赖

- **核心**: beautifulsoup4, requests, markdownify, magika, charset-normalizer, defusedxml
- **文档**: python-pptx, mammoth, pandas, openpyxl, xlrd, pdfminer.six, pdfplumber
- **音视频**: pydub, SpeechRecognition
- **云**: azure-ai-documentintelligence, azure-ai-contentunderstanding

---

## 4. Quartz

**路径**: `E:\openGO\c\quartz-5\`
**定位**: 静态站点生成器，专为发布"数字花园"（Markdown 笔记集合）设计。
**作者**: jackyzha0
**特色**: Obsidian 风格 Markdown、Wikilinks、关系图谱、全文搜索、反向链接。

### 核心入口

| 入口 | 文件 | 说明 |
|------|------|------|
| CLI | `quartz/bootstrap-cli.mjs` | `quartz` 命令 (yargs) |

### CLI 命令

```
quartz build       # 构建站点
quartz create      # 创建新项目
quartz upgrade     # 升级
quartz restore     # 恢复
quartz sync        # 同步
quartz tui         # 终端 UI 插件管理器
quartz plugin      # 插件管理 (install/add/remove/list/enable/disable/config/prune)
```

### 目录结构

```
quartz-5/
├── quartz/                    # 核心库
│   ├── bootstrap-cli.mjs      # 🔑 CLI 入口
│   ├── build.ts               # 🔑 构建管线（核心流程）
│   ├── cfg.ts                 # 配置定义 (GlobalConfiguration + QuartzConfig)
│   ├── plugins/               # 🔥 插件系统（4 类）
│   │   ├── transformers/      #   转换器：处理 Markdown AST
│   │   │   ├── ofm.ts         #   Obsidian Flavored Markdown
│   │   │   ├── latex.ts       #   LaTeX 支持
│   │   │   ├── syntax.ts      #   语法高亮
│   │   │   ├── links.ts       #   Wikilinks 处理
│   │   │   ├── description.ts #   描述提取
│   │   │   ├── frontmatter.ts #   前置元数据
│   │   │   ├── citations.ts   #   引用
│   │   │   ├── gfm.ts         #   GitHub Flavored Markdown
│   │   │   └── ...
│   │   ├── filters/           #   过滤器：排除内容
│   │   │   ├── draft.ts       #   移除草稿
│   │   │   └── filter.ts      #   显式过滤
│   │   ├── emitters/          #   输出器：生成静态文件
│   │   │   ├── contentPage.tsx    # 内容页 HTML
│   │   │   ├── static.ts         # 静态资源
│   │   │   ├── assets.ts         # 资源处理
│   │   │   ├── componentResources.ts # 组件资源
│   │   │   ├── ogImage.tsx       # Open Graph 图片
│   │   │   ├── aliases.ts        # 别名/重定向
│   │   │   ├── rss.tsx           # RSS Feed
│   │   │   └── ...
│   │   └── pageTypes/         #   页面类型
│   │       ├── folder.tsx
│   │       ├── tag.tsx
│   │       ├── bases.tsx
│   │       └── canvas.tsx
│   ├── components/            # 🔥 组件（Preact，构建时渲染）
│   │   ├── Head.tsx
│   │   ├── Header.tsx
│   │   ├── Body.tsx
│   │   ├── Footer.tsx
│   │   ├── PageList.tsx
│   │   ├── Search.tsx         # 全文搜索 (FlexSearch)
│   │   ├── Graph.tsx          # 关系图谱
│   │   ├── Backlinks.tsx      # 反向链接
│   │   ├── Explorer.tsx       # 文件浏览器
│   │   ├── TableOfContents.tsx
│   │   ├── RecentNotes.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── TagList.tsx
│   │   └── ...
│   ├── i18n/                  # 多语言支持
│   │   ├── index.ts
│   │   └── locales/           # ar-SA, ca-ES, cs-CZ, de-DE, en-US, ...
│   ├── util/                  # 工具函数
│   └── static/                # 默认静态资源
├── docs/                      # Quartz 官方文档（本身就是 Quartz 站点）
├── content/                   # 示例内容
├── package.json
└── quartz.config.ts           # 用户配置示例
```

### 构建管线

```
1. 清理输出目录
2. Glob 匹配输入文件 (Markdown)
3. 解析 Markdown (unified/remark/rehype)
4. Transformers 处理 AST
5. Filters 过滤内容
6. Emitters 生成 HTML 文件
7. 输出到 public/ 目录
```

### 配置模型

```typescript
QuartzConfig {
  configuration: GlobalConfiguration {
    pageTitle,        // 站点标题
    enableSPA,        // SPA 模式 (micromorph)
    enablePopovers,   // 链接预览弹窗
    analytics,        // 分析
    theme,            // 主题 (颜色/排版)
    locale,           // 语言
  }
  plugins: {
    transformers,     // Markdown 转换
    filters,          // 内容过滤
    emitters,         // 输出生成
  }
}
```

### 布局系统

可配置的页面布局，包含：
- Head, Header, beforeBody, pageBody, afterBody, left, right, Footer
- 页面框架：DefaultFrame, FullWidthFrame, MinimalFrame

### 关键依赖

| 类别 | 依赖 |
|------|------|
| 运行时 | Preact, unified/remark/rehype (Markdown 解析) |
| 搜索 | FlexSearch |
| 构建 | esbuild, lightningcss, sharp (图片) |
| 工具 | yargs, chokidar, isomorphic-git, Workerpool |

---

## 5. Unstructured

**路径**: `E:\openGO\c\unstructured-main\`
**定位**: 非结构化文档预处理库，将 PDF、HTML、Word、图片、邮件等分区为结构化元素（标题、段落、表格、列表、图片），供下游 ML/LLM 使用。

### 核心入口

| 入口 | 文件 | 说明 |
|------|------|------|
| CLI | `unstructured/cli.py` | `unstructured` 命令行 |
| API | `unstructured/partition/auto.py` | `partition()` 自动分区函数 |
| Ingest | `unstructured/ingest/` | 数据摄取子系统 |

### 目录结构

```
unstructured-main/
├── unstructured/
│   ├── __init__.py
│   ├── cli.py               # CLI 入口
│   ├── documents/           # 文档模型定义
│   ├── errors.py            # 错误类型
│   ├── logger.py            # 日志
│   ├── nlp.py               # NLP 工具
│   ├── utils.py             # 工具函数
│   ├── partition/           # 🔥 文档分区（核心）
│   │   ├── __init__.py
│   │   ├── auto.py          #   自动分区（路由分发）
│   │   ├── common/          #   通用工具和基类
│   │   ├── pdf.py           #   PDF 分区
│   │   ├── pdf_image/       #   PDF 图片处理
│   │   ├── doc.py           #   DOC 分区
│   │   ├── docx.py          #   DOCX 分区
│   │   ├── ppt.py           #   PPT 分区
│   │   ├── pptx.py          #   PPTX 分区
│   │   ├── xlsx.py          #   XLSX 分区
│   │   ├── html/            #   HTML 分区（自定义解析器）
│   │   ├── email.py         #   EML 邮件分区
│   │   ├── msg.py           #   Outlook MSG 分区
│   │   ├── image.py         #   图片 OCR 分区
│   │   ├── audio.py         #   音频语音转录
│   │   ├── md.py            #   Markdown 分区
│   │   ├── epub.py          #   EPUB 分区
│   │   ├── odt.py           #   ODT 分区
│   │   ├── org.py           #   Org-mode 分区
│   │   ├── rst.py           #   reStructuredText 分区
│   │   ├── rtf.py           #   RTF 分区
│   │   ├── csv.tsv.py       #   CSV/TSV 分区
│   │   ├── json.py          #   JSON 分区
│   │   ├── xml.py           #   XML 分区
│   │   └── utils/           #   分区工具
│   │       └── ocr_models/  #   OCR 模型 (Tesseract/PaddleOCR/GoogleVision)
│   ├── chunking/            # 🔥 文档分块 (用于 Embedding/RAG)
│   │   ├── __init__.py
│   │   ├── base.py          #   基础分块
│   │   └── title.py         #   按标题分块
│   ├── embed/               # Embedding 接口
│   │   ├── __init__.py
│   │   ├── openai.py        #   OpenAI
│   │   ├── huggingface.py   #   HuggingFace
│   │   ├── bedrock.py       #   AWS Bedrock
│   │   ├── vertexai.py      #   Google VertexAI
│   │   ├── voyageai.py      #   VoyageAI
│   │   ├── mixedbread.py    #   MixedBread
│   │   └── octoai.py        #   OctoAI
│   ├── cleaners/            # 文本清洗工具
│   ├── metrics/             # 评估指标（文本/表格/元素类型）
│   ├── staging/             # 为不同下游平台的数据暂存
│   └── ingest/              # 🔥 数据摄取 (40+ 数据源)
│       ├── cli/
│       ├── connector/       #    连接器
│       └── ...
├── scripts/                 # 工具脚本
├── docs/                    # 文档
├── pyproject.toml           # Python 项目配置
└── Makefile
```

### PDF 分区策略

```
策略选择 (auto/fast/hi_res/ocr_only)
    │
    ├── fast: pdfminer.six / pypdf (文本提取)
    ├── hi_res: 布局检测模型 (YOLOX/DocTR) + OCR
    └── ocr_only: 仅 OCR (Tesseract/PaddleOCR/Google Vision)
```

### 元素类型

```
Title, NarrativeText, Text, ListItem, Table, TableChunk,
Image, PageBreak, Header, Footer, FigureCaption,
Checklist, Formula, Address, EmailAddress, ...
```

### 数据摄取连接器（40+）

| 类别 | 连接器 |
|------|--------|
| 云存储 | S3, Azure Blob, GCS, Box, Dropbox, OneDrive, SharePoint |
| 协作 | Confluence, Jira, Slack, Notion, Teams |
| 代码 | GitHub, GitLab |
| 数据库 | MongoDB, Postgres, Pinecone, Qdrant, Weaviate, Chroma, Elasticsearch |
| 消息 | Kafka, Discord, Outlook |
| 其他 | Salesforce, Reddit, Wikipedia, HubSpot, SFTP |

### 分块策略

```
ChunkingOptions {
  max_characters,          # 最大字符数
  new_after_n_chars,       # N 字符后新块
  overlap,                 # 重叠字符数
  overlap_all,             # 是否全部重叠
  include_orig_elements,   # 是否包含原始元素
  multipage_sections,      # 跨页处理
  combine_text_under_n_chars,  # 合并过短文本
}
```

### 关键依赖

| 类别 | 依赖 |
|------|------|
| 核心 | beautifulsoup4, lxml, spacy, numpy, python-magic, rapidfuzz |
| 文档 | python-docx, python-pptx, pandas, pypdf, pdfminer.six |
| ML/AI | torch, transformers, paddlepaddle, openai-whisper, unstructured-inference |
| OCR | tesseract, paddleocr |

---

## 项目间关联

### 功能对比矩阵

| 功能 | Cytoscape.js | Logseq | MarkItDown | Quartz | Unstructured |
|------|:---:|:---:|:---:|:---:|:---:|
| 图论/网络可视化 | ✅ 核心 | ✅ 知识图谱 | ❌ | ✅ 关系图 | ❌ |
| Markdown 处理 | ❌ | ✅ 编辑+解析 | ✅ 输出 | ✅ 发布 | ✅ 分区 |
| 文件格式转换 | ❌ | ✅ 导入 | ✅ 核心 | ❌ | ✅ 核心 |
| 知识管理 | ❌ | ✅ 核心 | ❌ | ✅ 发布 | ❌ |
| LLM/ML 管线 | ❌ | ❌ | ✅ 专为 LLM | ❌ | ✅ 核心 |
| 文档分区 | ❌ | ❌ | ❌ | ❌ | ✅ 核心 |
| 静态站点生成 | ❌ | ❌ | ❌ | ✅ 核心 | ❌ |
| 插件系统 | ✅ | ✅ | ✅ | ✅ | ❌ |

### 技术互补关系

```
笔记工作流:
  打笔记 (Logseq) → 导出 Markdown → 发布 (Quartz)

LLM 数据管线:
  文档 → MarkItDown (转 Markdown) → LLM 处理
  文档 → Unstructured (分区) → Chunking → Embedding → RAG

图谱可视化:
  数据 → Cytoscape.js 渲染图 → 浏览器展示
  Logseq 知识图谱 → Cytoscape.js 风格展示
```

### 语言分布

```
JavaScript/TS:  Cytoscape.js, Quartz
ClojureScript:  Logseq
Python:         MarkItDown, Unstructured
```

---

## 快速参考：修改某功能应找哪个文件

### Cytoscape.js

| 想做的事 | 文件 |
|----------|------|
| 添加新布局算法 | `src/extensions/layout/` 下新建文件 |
| 添加新图论算法 | `src/collection/algorithms/` 下新建文件 |
| 修改节点形状 | `src/extensions/renderer/canvas/node-shapes.mjs` |
| 修改边绘制 | `src/extensions/renderer/canvas/edges.mjs` |
| 修改样式系统 | `src/core/style.mjs` |
| 注册新扩展 | `src/extension.mjs` |

### Logseq

| 想做的事 | 文件 |
|----------|------|
| 修改编辑器行为 | `src/main/frontend/editor.cljs` |
| 修改数据模型 | `src/main/frontend/db/model.cljs` |
| 修改页面/块逻辑 | `src/main/frontend/blocks.cljs` 和 `pages.cljs` |
| 修改插件系统 | `src/main/frontend/extensions/` |
| 修改 UI 组件 | `src/main/frontend/components/` |
| 修改 Markdown 解析 | `deps/graph-parser/` |
| 修改大纲模型 | `deps/outliner/` |
| 修改构建配置 | `shadow-cljs.edn` |

### MarkItDown

| 想做的事 | 文件 |
|----------|------|
| 添加新格式支持 | `packages/markitdown/src/markitdown/converters/` 下新建 |
| 修改转换核心逻辑 | `packages/markitdown/src/markitdown/_markitdown.py` |
| 修改文件类型检测 | `_markitdown.py` 中的 `_detect_format()` |
| 添加云服务集成 | `_markitdown.py` 中的云服务方法 |
| 修改 CLI | `packages/markitdown/src/markitdown/__main__.py` |
| 开发第三方插件 | `packages/markitdown/src/markitdown/plugins/` |

### Quartz

| 想做的事 | 文件 |
|----------|------|
| 修改 Markdown 处理 | `quartz/plugins/transformers/` |
| 添加新页面类型 | `quartz/plugins/pageTypes/` 下新建 |
| 修改输出格式 | `quartz/plugins/emitters/` |
| 修改布局 | `quartz/components/` 中相关组件 |
| 修改搜索 | `quartz/components/Search.tsx` |
| 修改关系图谱 | `quartz/components/Graph.tsx` |
| 修改构建流程 | `quartz/build.ts` |
| 修改配置模型 | `quartz/cfg.ts` |
| 添加新语言 | `quartz/i18n/locales/` 下新建 |

### Unstructured

| 想做的事 | 文件 |
|----------|------|
| 添加新文档格式支持 | `unstructured/partition/` 下新建分区文件 |
| 修改分区路由逻辑 | `unstructured/partition/auto.py` |
| 修改 PDF 处理 | `unstructured/partition/pdf.py` |
| 修改分块策略 | `unstructured/chunking/` |
| 添加新 Embedding 提供者 | `unstructured/embed/` 下新建 |
| 添加新数据源连接器 | `unstructured/ingest/connector/` |
| 修改元素类型 | `unstructured/documents/` |
| 添加 OCR 模型 | `unstructured/partition/utils/ocr_models/` |

---

*本指南供 Claude Code 在当前项目中使用，帮助快速定位和理解各子项目的源代码结构。*