# dsh-session-list（Session-List）

DSH Web GUI 插件：把聊天区右侧**官方内置的轮次导航条**，换成一套**自己的提问导航条**，并在两者之间做**默认 / 自定义**二选一切换。

> 适配 **DSH 0.1.5+**（官方在 0.1.5 起内置了 `TurnNavigator` 右侧轮次导航条；本插件用它做「隐藏官方 + 显示自己」的替换）。

## 功能

- **默认 / 自定义 切换**：设置 → 通用（General）里一行分段控件 `[ 默认 ｜ 自定义 ]`；默认=官方导航条，自定义=本插件的导航条；状态持久化到 `localStorage`，即时生效、不用重启。
- **自定义导航条**（选「自定义」时）：
  - **hover 列出全部提问**：鼠标移到右侧横线上，弹出**整段会话**的全部提问列表（每行一条、开头 16 字、超长用 `…` 截断，列表内可滚动并自动定位当前项）；
  - **点击跳转**：点横线或列表项，平滑滚动到对应轮次；**未加载的历史轮次会先加载再跳转**；
  - **当前高亮**：滚动时高亮当前阅读到的轮次；
  - **位置对齐官方**：自定义条按官方导航条的**实际位置**渲染（右缘与垂直中心一致），切换时不跳动；
  - **长会话友好**：竖条高度封顶（420px），超出时条内滚动；
  - **失效兜底**：DSH 升级若改了结构导致官方藏不住，自动退回默认模式并留一条诊断日志，避免两条线叠在一起。
- **隐藏官方**采用结构化选择器 + JS 兜底（详见「原理」），不依赖易变的哈希类名或本地化文案。

纯客户端（浏览器）插件，无宿主服务、无构建产物（`lib/` 下即为可直接加载的产物）。

## 安装

### 前置条件

- 已安装 **DSH 0.1.5+**，且存在 web profile（默认名为 `web`）；
- 已安装 `git`。

### 方式一：dsh plugin 命令（推荐）

```bash
git clone https://github.com/eailersummer/dsh-session-list.git
cd dsh-session-list
dsh plugin --profile web add link:.
```

本包自带 `dsh.bundle.patch`（`cordis.patch.yml` 里的 `insert` 挂载行），`dsh plugin add` 会自动 reconcile 到 `dsh.profile.bundles` 并应用挂载，**无需手动改任何 profile 文件**。完成后重启 DSH 即可。

> 若你的 profile 名不是 `web`，把 `--profile web` 换成实际名字。

### 方式二：手动安装

1. 把本仓库复制到 `~/.dsh/profiles/<profile>/packages/session-list/`；
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
5. 重启 DSH。

## 使用

设置 → 通用（General）→「问题导航条」→ 选 **默认** 或 **自定义**。

- 选「默认」：官方内置导航条，本插件不渲染任何东西、也不注入隐藏规则；
- 选「自定义」：隐藏官方导航条，显示本插件的导航条（hover 弹全部提问、点击跳转）。

状态存于浏览器 `localStorage`，key 为 `dsh.session-list.mode.v1`（值 `default` / `custom`），与 DSH 进程无关。

## 更新

使用 `link:` 方式挂载时，插件源码就是被链接的目录本身：

```bash
cd dsh-session-list
git pull
```

改完重启 DSH 即可生效（无需重新 `pnpm install`）。

## 卸载

方式一（若 CLI 支持）：`dsh plugin --profile web remove dsh-session-list`。

方式二（手动）：删掉 profile `package.json` 里的 `dsh-session-list` 依赖、`cordis.patch.yml` 里对应的 `insert` 行，以及 `packages/session-list` 目录，然后 `pnpm install` 并重启。

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
├── README.md
└── LICENSE
```

## 原理

**为什么不能「真正替换」**：DSH 0.1.5 的官方导航条（`TurnNavigator`，位于 `@deepseek-ai/dsh-client-ui-chat`）是**硬编码渲染在聊天视图内部的组件，不是可插拔槽位**，也没有任何设置开关、主题变量或组合开关能关掉它。所以「切换」只能实现为：自定义模式下**隐藏官方 + 显示自己的**。

**隐藏官方**（两条独立机制，互为兜底）：

1. 结构化 CSS（不依赖哈希类名、不依赖文案）：

   ```css
   div:has(> [data-chat-flow]) > :first-child:not([data-chat-flow]) { visibility: hidden !important; }
   ```

   即隐藏「直接包含聊天流 `[data-chat-flow]` 的那层元素里、排在最前、且不是聊天流本身」的那个——当前正好就是官方导航条的外层容器。
2. JS 兜底：定位同一个容器并直接 `style.visibility = 'hidden'`，用 `MutationObserver` 在官方条挂载/卸载时复贴。

用 `visibility`（而不是 `display`）是为了**保留盒子可测量**——自定义条需要读取官方条的实际矩形来对齐位置。

**数据与跳转**：

- 提问列表来自会话投影 `useProjection('turnOutline')`（`@deepseek-ai/dsh-session-turn-outline`），它是**整段会话**的轮次大纲（每条含 `turn` / `seq` / 提问预览 `prompt`），因此能列到尚未加载的历史轮次；
- 点未加载轮次时，通过 `ctx.sessions.binding(sessionId).session.loadThrough(seq)` 先把历史分页加载到该轮，再滚动定位；
- 当前位置由 DOM 锚点 `[data-chat-turn]` + `document.elementsFromPoint` 一次命中判定。

**注册的槽位**：`conversation.input.dock`（挂载自定义导航条与隐藏逻辑）与 `settings.general.item`（通用设置里的默认/自定义分段控件）。

## 已知限制

- **依赖结构锚点**：官方导航条不是槽位，隐藏只能靠结构选择器。DSH 大版本若调整聊天视图结构，可能需要在 `lib/client.js` 里更新 `HIDE_CSS` / `findOfficialSlot()`。届时若隐藏失效，插件会自动退回默认模式（不会两条线叠加），并在控制台留一条诊断。
- **默认模式零侵入**：选「默认」时本插件不注入任何隐藏规则、不渲染任何覆盖层。

## 许可

MIT
