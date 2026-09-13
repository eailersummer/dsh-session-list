# dsh-session-list (Session-List)

[中文](README.md) | English

A DSH Web GUI plugin that swaps the conversation's **built-in right-edge turn navigation rail** for a **custom one**, with a **Default / Custom** switch between the two.

> Requires **DSH 0.1.5+**. DSH has shipped its own `TurnNavigator` rail since 0.1.5; this plugin "replaces" it by hiding the built-in one and drawing its own.

---

## Features

**Default / Custom switch**

- Where: Settings → General → "问题导航条" (Question navigation rail);
- What: a segmented control `[ 默认 ｜ 自定义 ]` (Default / Custom);
- **Default** = the built-in rail (this plugin renders nothing and injects no rules);
- **Custom** = this plugin's rail;
- The choice is stored in browser `localStorage` and applies instantly — no restart.

**The custom rail** (while "Custom" is selected)

- **Hover to list every question**: hovering the marks opens a popup listing **every question in the whole session** — one per line, first 16 characters, `…` when truncated. The list shows ~10 rows (≈290px) and scrolls; it auto-scrolls to the current item when opened.
- **Click to jump**: clicking a mark or a list row smooth-scrolls to that turn. **Turns that are not loaded yet are paged in first, then jumped to.**
- **Active highlight**: the turn you are currently reading is highlighted, and kept scrolled into view.
- **Aligned with the built-in rail**: the custom rail mirrors the built-in one's **actual box** (right edge and vertical centre), so switching never makes it jump.
- **Long-session friendly**: the rail is capped at 420px tall and scrolls internally, with fading edges.
- **Unloaded distinction**: turns not loaded yet use a fainter, shorter mark.
- **Theme-aware colours**: everything uses DSH theme variables (`--dsw-alias-*`), so light/dark themes adapt automatically.
- **Failure fallback**: if a DSH upgrade changes the structure so the built-in rail can no longer be hidden, the plugin reverts to Default and logs a diagnostic instead of stacking two rails.

**Other**

- Pure client-side (browser) plugin — no host service;
- No build artifacts: what ships in `lib/` is what loads (hand-written ESM, no compilation step).

---

## Changelog

### v0.3.1

- **Fixed**: the popup conflicted with the right-edge **width-drag handle** — moving the pointer from the popup toward the right edge closed the popup and started a column resize. Root cause: the rail was mounted inside `.wSkVaW_composerSeat`, which is `z-index: 7` and therefore a **stacking context**; no z-index inside that subtree can out-rank the handle (`z-index: 8`).
- **Fix**: portal the rail's DOM to `document.body` with `ReactDOM.createPortal`, escaping that stacking context so the rail's own `z-index: 9` actually applies.

### v0.3.0

- Rail `z-index` 8 → 9 (first, incomplete attempt at the handle conflict — see v0.3.1);
- Popup height `60vh` → ~10 rows (`290px`), scrolling internally;
- Colours back to the v0.1.0 theme-variable scheme (idle `--dsw-alias-label-secondary`, hover/active `--dsw-alias-brand-primary`); mark hover/active width 18px → 16px.

### v0.2.0

- **DSH 0.1.5 support**: added the Default / Custom switch; Custom hides the built-in `TurnNavigator` and shows this plugin's rail;
- The question list now comes from the `turnOutline` session projection, covering the **whole session** (including turns not loaded yet);
- Clicking an unloaded turn pages history in (`loadThrough`) before jumping;
- The rail mirrors the built-in rail's position so switching does not jump;
- Added the "revert to Default + diagnostic log" fallback.

### v0.1.0

- First release: a right-edge question rail (fixed-pitch marks, hover to list all questions, click to jump, active highlight, a General-settings toggle).

---

## Installation

### Requirements

- **DSH 0.1.5+** with a web profile (default name `web`);
- `git` (only needed for the clone route in step 1; the ZIP route needs none).

### Step 1 — get the code

This repository is currently **private**, so pick one:

1. **git clone** (requires access to the repo; GitHub will ask you to sign in the first time):

   ```bash
   git clone https://github.com/eailersummer/dsh-session-list.git
   cd dsh-session-list
   ```

2. **Download ZIP**: on the GitHub repo page, `Code` → `Download ZIP`, then unzip anywhere. The ZIP contents *are* the plugin package (no nested folder to descend into) — call that directory `<plugin-dir>` below.

### Step 2 — mount it into the profile

#### Route A: the `dsh plugin` command (recommended)

From `<plugin-dir>`:

```bash
dsh plugin --profile web add link:.
```

The package declares `dsh.bundle.patch` (the `insert` row in `cordis.patch.yml`), so `dsh plugin add` reconciles it into `dsh.profile.bundles` and applies the mount — **no profile file needs editing by hand**. **Restart DSH** afterwards.

> If your profile is not named `web`, replace `--profile web` with its real name.

#### Route B: manual install (no CLI)

1. Copy the plugin directory to `~/.dsh/profiles/<profile>/packages/session-list/`;
2. Add this to `dependencies` in `~/.dsh/profiles/<profile>/package.json`:

   ```json
   "dsh-session-list": "link:./packages/session-list"
   ```

3. Add this row to `~/.dsh/profiles/<profile>/cordis.patch.yml`:

   ```yaml
   - insert:
       - id: session-list
         name: 'dsh-session-list'
   ```

4. Run `pnpm install` inside the profile directory;
5. **Restart DSH**.

> When editing `package.json` / `cordis.patch.yml` by hand, save them as **UTF-8 without BOM** (a BOM makes pnpm fail with `Invalid package.json`).

---

## Usage

Settings → General → "问题导航条" → pick **Default** or **Custom**.

- **Default**: the built-in rail; this plugin renders nothing and injects no hiding rules.
- **Custom**: the built-in rail is hidden and this plugin's rail is shown (hover lists every question, click jumps).

The choice lives in browser `localStorage` under the key `dsh.session-list.mode.v1` (values `default` / `custom`) and is independent of the DSH process.

---

## Updating

With a `link:` mount, the plugin source *is* the linked directory:

```bash
cd <plugin-dir>
git pull
```

Then **restart DSH** (no `pnpm install` needed).

---

## Uninstalling

- Route A (if the CLI supports it): `dsh plugin --profile web remove dsh-session-list`;
- Route B (manual): delete the `dsh-session-list` dependency from the profile `package.json`, the matching `insert` row from `cordis.patch.yml`, and the `packages/session-list` directory; then `pnpm install` and restart.

---

## Layout

```
dsh-session-list/
├── package.json          # package metadata + dsh.client / dsh.bundle.patch declarations
├── cordis.patch.yml      # bundle patch: the insert mount row
├── lib/
│   ├── index.js          # host half (an empty plugin, only so the row can mount)
│   ├── index.d.ts
│   ├── client.js         # browser half (the switch + the whole rail)
│   └── client.d.ts
├── README.md             # 中文说明 (Chinese)
├── README_EN.md          # English (this file)
└── LICENSE
```

---

## How it works

### Why this is not a true replacement

The built-in rail (`TurnNavigator`, in `@deepseek-ai/dsh-client-ui-chat`) is a component **hard-coded inside the chat view — not a pluggable slot** — and no setting, theme token or composition switch can turn it off. So "switching" can only be implemented as: in Custom mode, **hide the built-in one and draw your own**.

### Hiding the built-in rail (two independent mechanisms, each backing the other up)

1. **Structural CSS** (dependent on neither the hashed class names nor localized copy):

   ```css
   div:has(> [data-chat-flow]) > :first-child:not([data-chat-flow]) { visibility: hidden !important; }
   ```

   i.e. hide "the first child, that is not the chat flow itself, of the element that directly contains `[data-chat-flow]`" — today exactly the built-in rail's wrapper.

2. **JS backstop**: locate the same wrapper and set `style.visibility = 'hidden'` on it, re-applied by a `MutationObserver` whenever the built-in rail mounts or unmounts.

`visibility` (not `display`) is deliberate: it **keeps the box measurable**, which the custom rail needs in order to mirror the built-in rail's exact geometry.

### Coexisting with the width-drag handle

The right-edge resize grabber is `.wSkVaW_widthHandle` (`position:absolute; z-index:8`), and it is the **last child of `.wSkVaW_body`**; no ancestor on its chain creates a stacking context, so its `z-index:8` competes in the **root stacking context**, where equal z-index resolves by tree order (later subtree paints on top).

The rail was originally rendered inside `conversation.input.dock`, which sits inside **`.wSkVaW_composerSeat` (`z-index: 7`)** — a stacking context. No z-index inside that subtree can exceed 7 at the root level, so the drag handle (8) covered the popup and stole the pointer.

The fix portals the rail's DOM to **`document.body`** with `ReactDOM.createPortal`, escaping that stacking context; the rail's own `z-index: 9` then actually applies, so the popup owns the pointer where it overlaps and the handle yields there. (In common wide layouts the rail itself does not overlap the handle at all — only the popup reaches that far in; the rail only clips the handle's edge when the content column is very narrow.)

### Data and navigation

- The question list comes from the `turnOutline` session projection (`@deepseek-ai/dsh-session-turn-outline`) — a whole-session outline where each entry carries `turn` / `seq` / a prompt preview `prompt` — so it can list turns that are not loaded yet;
- Clicking an unloaded turn calls `ctx.sessions.binding(sessionId).session.loadThrough(seq)` to page history in up to that turn, then scrolls to it;
- The current position is resolved in a single hit test: the `[data-chat-turn]` DOM anchor plus `document.elementsFromPoint`.

### Slots it registers

- `conversation.input.dock`: hosts the custom rail and the hiding logic;
- `settings.general.item`: the Default / Custom segmented control in General settings.

---

## Known limitations

- **Structure-dependent**: the built-in rail is not a slot, so hiding it relies on a structural selector. If a major DSH release reshapes the chat view, `HIDE_CSS` / `findOfficialSlot()` in `lib/client.js` may need updating. When hiding breaks, the plugin **reverts to Default** (never stacks two rails) and logs a `[dsh-session-list]` diagnostic to the console.
- **Default mode is zero-intrusion**: in Default mode the plugin injects no hiding rules and renders no overlay.
- **`--dsw-alias-brand-primary` is a high-contrast neutral in 0.1.5** (light `#0f1115` / dark `#f9fafb`), not a blue accent, so the hover/active marks are black-and-white highlights. For a blue accent, switch to `--dsw-alias-state-business-primary`.

---

## License

MIT
