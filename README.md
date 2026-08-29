# dsh-session-list（Session-List）

DSH Web GUI 插件：会话右侧的**提问导航条**。

在聊天区右侧中部显示一簇横线，每条横线对应会话里的一条用户提问，方便在长对话中快速定位和跳转。

## 功能

- **横线导航簇**：右侧中部一簇横线，一行一个问题，紧凑不遮挡内容；
- **hover 列出全部问题**：鼠标移到横线上，弹出全部问题列表（每行一条、超长用 `…` 截断）；
- **点击跳转**：点击横线或列表项，平滑滚动到对应消息；
- **当前高亮**：滚动时高亮当前阅读到的提问；
- **设置开关**：通用设置（General）里新增「问题导航条」开关，状态持久化到 `localStorage`（默认开启）。

纯客户端（浏览器）插件，无宿主服务、无构建产物（`lib/` 下即为可直接加载的产物）。

## 安装

### 前置条件

- 已安装 DSH，且存在 web profile（默认名为 `web`）；
- 已安装 `git`。

### 方式一：dsh plugin 命令（推荐）

```bash
git clone https://github.com/<你的用户名>/dsh-session-list.git
cd dsh-session-list
dsh plugin --profile web add link:.
```

本包自带 `dsh.bundle.patch`（`cordis.patch.yml` 里的 `insert` 挂载行），`dsh plugin add` 会自动 reconcile 到 `dsh.profile.bundles` 并应用挂载，**无需手动改任何 profile 文件**。完成后重启 DSH 即可。

> 若你的 profile 名不是 `web`，把 `--profile web` 换成实际名字。

### 方式二：手动安装

如果 `dsh plugin` 命令不可用，可手动挂载：

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

## 更新

使用 `link:` 方式挂载时，插件源码就是被链接的目录本身：

```bash
cd dsh-session-list
git pull
```

改完重启 DSH 即可生效（无需重新 `pnpm install`）。

## 卸载

方式一（若 CLI 支持）：`dsh plugin --profile web remove dsh-session-list`。

方式二（手动）：

1. 删除 `~/.dsh/profiles/<profile>/package.json` 里的 `dsh-session-list` 依赖；
2. 删除 `~/.dsh/profiles/<profile>/cordis.patch.yml` 里的对应 `insert` 行；
3. 删除 `~/.dsh/profiles/<profile>/packages/session-list`；
4. 在 profile 目录运行 `pnpm install`；
5. 重启 DSH。

## 设置

- 开关位置：DSH 设置 → 通用（General）→「问题导航条」；
- 开关状态存于浏览器 `localStorage`，key 为 `dsh.session-list.enabled.v1`，与 DSH 进程无关。

## 目录结构

```
dsh-session-list/
├── package.json          # 包元数据 + dsh.client / dsh.bundle.patch 声明
├── cordis.patch.yml      # bundle patch：insert 挂载行
├── lib/
│   ├── index.js          # 宿主半身（空插件，仅用于行挂载）
│   ├── index.d.ts
│   ├── client.js         # 浏览器半身（导航条全部逻辑）
│   └── client.d.ts
├── README.md
└── LICENSE
```

## 原理

纯客户端插件：在浏览器半身里声明依赖 `slots` 服务，注册两个官方槽位——

- `conversation.input.dock`：挂载右侧导航条组件，通过该槽的 owner props（`session`，即 `ConversationSnapshot`）读取会话中的用户提问；
- `settings.general.item`：在通用设置里挂载开关行。

导航条的位置/跳转/高亮依赖会话流自身的两个稳定 DOM 锚点：滚动容器 `[data-conversation-scroll]` 与用户消息行 `[data-chat-flow-kind="user"]`。样式走 DSH 主题 CSS 变量（`--dsw-alias-*`），自动适配浅色/深色主题。

## 许可

MIT
