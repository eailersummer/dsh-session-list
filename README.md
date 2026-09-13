# dsh-session-list（Session-List）

[English](README_EN.md) | 中文

DSH Web GUI 插件：把聊天区右侧**官方内置的轮次导航条**，换成一套**自己的提问导航条**，并在两者之间做**默认 / 自定义**二选一切换。

> 适配 **DSH 0.1.5+**。官方自 0.1.5 起内置了 `TurnNavigator` 右侧轮次导航条；本插件用「隐藏官方 + 显示自己」的方式实现替换。

---

## 功能

**默认 / 自定义 切换**

- 位置：设置 → 通用（General）→「问题导航条」；
- 形态：一行分段控件 `[ 默认 ｜ 自定义 ]`；
- 默认 = 官方内置导航条（本插件零侵入，不渲染、不注入任何规则）；
- 自定义 = 本插件的导航条；
- 状态存浏览器 `localStorage`，即时生效、不用重启。

**自定义导航条**（选「自定义」时）

- **hover 列出全部提问**：鼠标移到右侧横线上，弹出**整段会话**的全部提问列表——每行一条、开头 16 字、超长用 `…` 截断；列表最多约 10 行（≈290px），超出用滚轮查看，并在打开时自动定位到当前项；
- **点击跳转**：点横线或列表项，平滑滚动到对应轮次；**尚未加载的历史轮次会先分页加载到该轮再跳转**；
- **当前高亮**：滚动时高亮当前阅读到的轮次，并把该标记滚动进视野；
- **位置对齐官方**：竖条读取官方导航条的**实际位置**渲染（右缘与垂直中心一致），所以「默认 ↔ 自定义」切换时不跳动；
- **长会话友好**：竖条高度封顶 420px，超出时条内滚动，上下边缘渐隐；
- **未加载区分**：尚未加载的历史轮次横线更淡更短，一眼可辨；
- **配色仿 DeepSeek 网页版**：横线常态用主题灰阶（`--dsw-alias-label-tertiary`），**当前 / 悬停高亮为 DeepSeek 蓝**；蓝色按 `body[data-ds-dark-theme]` 给明暗两套（亮色 `#4176e6` / 暗色 `#5686fe`），弹窗里的当前项为蓝底蓝字，整体随 DSH 明暗主题自动切换；
- **失效兜底**：DSH 升级若改了结构导致官方藏不住，自动退回默认模式并留一条诊断日志，不会两条线叠在一起。

**其它**

- 纯客户端（浏览器）插件，无宿主服务；
- 无构建产物：`lib/` 下即为可直接加载的文件（手写 ESM，不需要编译）。

---

## 版本更新

### v0.3.2

- 配色改为仿 DeepSeek 网页版：横线常态灰阶、**当前 / 悬停为 DeepSeek 蓝**，并用 `body[data-ds-dark-theme]` 给明暗两套蓝（亮色 `#4176e6` / 暗色 `#5686fe`），整体随 DSH 明暗主题切换；
- 弹窗里的当前项改为**蓝底蓝字**；
- 横线常态色改用 `--dsw-alias-label-tertiary`，弹窗底色改用 `--dsw-alias-bg-layer-1`（与官方预览框一致）。

### v0.3.1

- **修复**：弹窗与右侧「拖动调宽」控件冲突 —— 鼠标从弹窗移向右侧时弹窗会被关闭、变成拖宽。根因是插件的竖条挂在 `.wSkVaW_composerSeat`（`z-index: 7`）这个**层叠上下文内部**，子树里 z-index 再大也只能以 7 参与根层叠，永远压在拖动条（`z-index: 8`）下面。
- **修法**：把竖条的 DOM 用 `ReactDOM.createPortal` 挂到 `document.body`，逃出该层叠上下文，竖条自身的 `z-index: 9` 才真正生效。

### v0.3.0

- 竖条 `z-index` 8 → 9（第一次尝试修拖动条冲突，未彻底，见 v0.3.1）；
- 弹窗高度 `60vh` → 约 10 行（`290px`），超出走内部滚轮；
- 配色回到 v0.1.0 的主题变量方案（横线常态 `--dsw-alias-label-secondary`、hover/当前 `--dsw-alias-brand-primary`），横线 hover/当前宽度 18px → 16px。

### v0.2.0

- **适配 DSH 0.1.5**：新增「默认 / 自定义」切换，自定义时隐藏官方 `TurnNavigator` 并显示本插件导航条；
- 提问列表改用会话投影 `turnOutline`，覆盖**整段会话**（含尚未加载的历史轮次）；
- 点击未加载轮次会先 `loadThrough` 加载再跳转；
- 竖条位置对齐官方导航条，切换不跳动；
- 增加「失效自动退回默认 + 诊断日志」兜底。

### v0.1.0

- 初版：右侧提问导航条（固定间距竖簇、hover 弹出全部提问、点击跳转、当前高亮、通用设置开关）。

---

## 安装

### 前置条件

- 已安装 **DSH 0.1.5+**，且存在 web profile（默认名为 `web`）；
- 已安装 `git`（方式一按仓库直装时需要；方式二可只用下载包）。

### 第一步：获取代码（下载方案）

本仓库当前为**私有仓库**，二选一：

1. **git clone**（需要该仓库的访问权限，首次会要求 GitHub 登录授权）：

   ```bash
   git clone https://github.com/eailersummer/dsh-session-list.git
   cd dsh-session-list
   ```

2. **下载 ZIP**：在 GitHub 仓库页面点 `Code` → `Download ZIP`，解压到任意目录（ZIP 内容即插件包本身，无需再 `cd` 进子目录；下面把该目录记为 `<插件目录>`）。

### 第二步：挂载到 profile

#### 方式一：dsh plugin 命令（推荐）

在 `<插件目录>` 下执行：

```bash
dsh plugin --profile web add link:.
```

本包自带 `dsh.bundle.patch`（`cordis.patch.yml` 里的 `insert` 挂载行），`dsh plugin add` 会自动 reconcile 到 `dsh.profile.bundles` 并应用挂载，**无需手改任何 profile 文件**。完成后**重启 DSH** 即可。

> profile 名不是 `web` 时，把 `--profile web` 换成实际名字。

#### 方式二：手动安装（不使用 CLI 时）

1. 把插件目录复制到 `~/.dsh/profiles/<profile>/packages/session-list/`；
2. 在 `~/.dsh/profiles/<profile>/package.json` 的 `dependencies` 里加：

   ```json
   "dsh-session-list": "link:./packages/session-list"
   ```

3. 在 `~/.dsh/profiles/<profile>/cordis.patch.yml` 里加挂载行：

   ```yaml
   - insert:
       - id: session-list
         name: 'dsh-session-list'
   ```

4. 在 profile 目录运行 `pnpm install`；
5. **重启 DSH**。

> 手工改 `package.json` / `cordis.patch.yml` 时注意存成 **UTF-8 无 BOM**（带 BOM 会让 pnpm 报 `Invalid package.json`）。

---

## 使用

设置 → 通用（General）→「问题导航条」→ 选 **默认** 或 **自定义**。

- 选「默认」：官方内置导航条；本插件不渲染任何东西、也不注入隐藏规则；
- 选「自定义」：隐藏官方导航条，显示本插件导航条（hover 弹全部提问、点击跳转）。

状态存于浏览器 `localStorage`，key 为 `dsh.session-list.mode.v1`（值 `default` / `custom`），与 DSH 进程无关。

---

## 更新

用 `link:` 方式挂载时，插件源码就是被链接的目录本身：

```bash
cd <插件目录>
git pull
```

改完**重启 DSH** 即可（无需重新 `pnpm install`）。

---

## 卸载

- 方式一（CLI 可用时）：`dsh plugin --profile web remove dsh-session-list`；
- 方式二（手动）：删除 profile `package.json` 里的 `dsh-session-list` 依赖、`cordis.patch.yml` 里对应的 `insert` 行，以及 `packages/session-list` 目录，然后 `pnpm install` 并重启。

---

## 目录结构

```
dsh-session-list/
├── package.json          # 包元数据 + dsh.client / dsh.bundle.patch 声明
├── cordis.patch.yml      # bundle patch：insert 挂载行
├── lib/
│   ├── index.js          # 宿主半身（空插件，仅用于行挂载）
│   ├── index.d.ts
│   ├── client.js         # 浏览器半身（切换 + 导航条全部逻辑）
│   └── client.d.ts
├── README.md             # 中文说明（本文件）
├── README_EN.md          # English README
└── LICENSE
```

---

## 原理

### 为什么不能「真正替换」

DSH 0.1.5 的官方导航条（`TurnNavigator`，位于 `@deepseek-ai/dsh-client-ui-chat`）是**硬编码渲染在聊天视图内部的组件，不是可插拔槽位**，也没有任何设置开关、主题变量或组合开关能关掉它。所以「切换」只能实现为：自定义模式下**隐藏官方 + 显示自己的**。

### 隐藏官方（两条独立机制，互为兜底）

1. **结构化 CSS**（不依赖易变的哈希类名、也不依赖本地化文案）：

   ```css
   div:has(> [data-chat-flow]) > :first-child:not([data-chat-flow]) { visibility: hidden !important; }
   ```

   即隐藏「直接包含聊天流 `[data-chat-flow]` 的那层元素里、排在最前、且不是聊天流本身」的那个——当前正好就是官方导航条的外层容器。

2. **JS 兜底**：用同一套定位找到该容器并直接 `style.visibility = 'hidden'`，并用 `MutationObserver` 在官方条挂载/卸载时复贴。

用 `visibility`（而不是 `display`）是为了**保留盒子可测量**——自定义竖条需要读取官方条的实际矩形来对齐位置。

### 与「拖动调宽」控件共存

右侧内容列的拖动条是 `.wSkVaW_widthHandle`（`position:absolute; z-index:8`），而且是 `.wSkVaW_body` 的最后一个子元素；它所在的整条祖先链都不创建层叠上下文，所以它的 `z-index:8` 是在**根层叠上下文**里参与比较的，并且同 z-index 时「靠后的子树」绘制在上面。

插件最初把竖条渲染在 `conversation.input.dock` 里，而该位置在 **`.wSkVaW_composerSeat`（`z-index: 7`）** 这个层叠上下文内部——子树里再大的 z-index 也只能以 7 参与根层叠，因此弹窗会被拖动条（8）盖住并抢走 hover。

修法是把竖条的 DOM 用 **`ReactDOM.createPortal` 挂到 `document.body`**，逃出该层叠上下文，竖条自身的 `z-index: 9` 才真正生效：弹窗范围内由弹窗接管指针，拖动条在该范围内让位（竖条本体在常见宽布局下与拖动条并不重叠，只有内容列很窄时才会压到拖动条边缘）。

### 数据与跳转

- 提问列表来自会话投影 `useProjection('turnOutline')`（`@deepseek-ai/dsh-session-turn-outline`），它是**整段会话**的轮次大纲（每条含 `turn` / `seq` / 提问预览 `prompt`），因此能列到尚未加载的历史轮次；
- 点未加载轮次时，通过 `ctx.sessions.binding(sessionId).session.loadThrough(seq)` 先把历史分页加载到该轮，再滚动定位；
- 当前位置由 DOM 锚点 `[data-chat-turn]` + `document.elementsFromPoint` 一次命中判定。

### 注册的槽位

- `conversation.input.dock`：挂载自定义导航条与隐藏逻辑；
- `settings.general.item`：通用设置里的「默认 / 自定义」分段控件。

---

## 已知限制

- **依赖结构锚点**：官方导航条不是槽位，隐藏只能靠结构选择器。DSH 大版本若调整聊天视图结构，可能需要在 `lib/client.js` 里更新 `HIDE_CSS` / `findOfficialSlot()`。届时若隐藏失效，插件会**自动退回默认模式**（不会两条线叠加），并在控制台留一条 `[dsh-session-list]` 诊断；
- **默认模式零侵入**：选「默认」时本插件不注入任何隐藏规则、不渲染任何覆盖层；
- **高亮蓝是插件自带的**：没有使用 DSH 的 `--dsw-alias-brand-primary`（该 token 在 0.1.5 是中性的黑白强对比色，不是蓝色）。想换蓝色只需改 `lib/client.js` 里 `.sl-rail` 的 `--sl-accent` / `--sl-accent-soft`（含 `body[data-ds-dark-theme]` 那条暗色覆盖）。

---

## 许可

MIT
