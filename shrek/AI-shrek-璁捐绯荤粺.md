# AI-shrek Design System

## 1. 设计定位

AI-shrek 是面向工业机械设计、3D 文件导入、AI 建模对话、仿真与版本管理的深色专业工具系统。

设计关键词：

- 工业感
- 专业高效
- 暗色沉浸
- 机械金属质感
- 信息密度适中
- 交互反馈明确
- 适合长时间工作

核心页面：

- 登录页：品牌入口与身份验证。
- 我的工作台：首页项目管理。
- 工作台详情页：3D 预览、上传历史、AI 对话、历史版本、仿真与工程图。

## 2. 设计原则

### 2.1 专业优先

界面服务于机械设计任务，避免营销式装饰。按钮、面板、工具栏、历史记录、上传区都应清晰表达功能。

### 2.2 暗色沉浸

主界面以深灰黑作为底色，降低视觉疲劳。蓝色仅用于主要操作、激活态和可交互反馈。

### 2.3 功能可感知

所有可点击区域必须有 hover / active / selected 状态。上传、拖拽、全屏、历史打开、模型切换都需要即时反馈。

### 2.4 真实交互

不要只做静态样式。组件必须有对应业务状态：

- 默认
- hover
- active
- disabled
- loading
- empty
- error
- success

### 2.5 响应式稳定

浏览器缩放、窗口拉伸、全屏、移动端窄屏下，组件不能重叠、文字不能溢出、主操作不能丢失。

## 3. 设计 Token

### 3.1 基础色彩

```css
:root {
  --color-bg-page: #121416;
  --color-bg-panel: #1a1c1e;
  --color-bg-panel-2: #202224;
  --color-bg-input: rgba(4, 5, 9, 0.8);

  --color-border-default: #27292b;
  --color-border-soft: rgba(69, 70, 82, 0.5);
  --color-border-active: rgba(48, 122, 255, 0.7);

  --color-text-primary: rgba(255, 255, 255, 0.92);
  --color-text-secondary: rgba(255, 255, 255, 0.78);
  --color-text-muted: rgba(255, 255, 255, 0.6);
  --color-text-faint: rgba(255, 255, 255, 0.4);

  --color-brand-blue: #307aff;
  --color-brand-cyan: #38b8d0;
  --color-danger: #ff7474;
  --color-warning: #ffb56c;
  --color-success: #39b66d;
}
```

### 3.2 渐变

```css
--gradient-primary: linear-gradient(96deg, #005fff 0%, #5338ff 45%, #38b8d0 100%);
--gradient-login-border: linear-gradient(137deg, rgba(73, 217, 219, 0.39), rgba(116, 125, 134, 0.19) 54%, rgba(71, 111, 246, 0.63));
--gradient-send: linear-gradient(90deg, #5636d9, #145c76);
```

### 3.3 圆角

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-pill: 999px;
```

使用规则：

- 工具型组件：`6px`
- 卡片 / 弹窗 / 输入框：`8px`
- 登录面板：`16px`
- 圆形头像 / pill 按钮：`999px`

### 3.4 间距

```css
--space-2: 2px;
--space-4: 4px;
--space-6: 6px;
--space-8: 8px;
--space-10: 10px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
--space-32: 32px;
```

### 3.5 字体

```css
font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
```

字号规范：

| 层级 | 字号 | 行高 | 场景 |
|---|---:|---:|---|
| 页面标题 | 24px | 32px | 我的工作台标题 |
| 模块标题 | 18px | 24px | 历史版本、导入零件 |
| 面板标题 | 16px | 24px | 创造对话、弹窗标题 |
| 正文 | 14px | 22px | 卡片、消息、表单 |
| 辅助 | 13px | 20px | 说明、提示 |
| 小标签 | 12px | 18px | 时间、状态 |

### 3.6 阴影

```css
--shadow-panel: 0 16px 32px rgba(0, 0, 0, 0.28);
--shadow-modal: 0 24px 60px rgba(0, 0, 0, 0.42);
--shadow-glow-blue: 0 0 18px rgba(48, 122, 255, 0.42);
--shadow-model: 0 34px 42px rgba(0, 0, 0, 0.46);
```

### 3.7 动效

```css
--motion-fast: 120ms ease;
--motion-normal: 160ms ease;
--motion-panel: 180ms ease;
```

使用规则：

- hover：`160ms`
- 拖拽高度：`120ms`
- 历史面板展开：`180ms`
- 避免复杂动画和大面积渐变闪烁。

## 4. 布局系统

### 4.1 登录页

结构：

- 左侧品牌视觉。
- 右侧登录面板。
- 背景使用工业机械深色图。

响应式：

- 大屏：品牌左侧、登录面板右侧。
- 中屏：登录面板随 viewport 缩放。
- 小屏：登录面板居中，品牌弱化。

### 4.2 我的工作台

结构：

- 顶部导航：Logo + 用户头像菜单。
- 工具栏：标题、搜索、筛选、视图切换、新建按钮。
- 内容区：项目卡片网格 / 列表。

网格规则：

- 桌面端默认 4 列。
- 中屏 3 列。
- 小屏 1-2 列。
- 标题超长省略，hover 显示完整内容。

### 4.3 工作台详情页

结构：

```text
顶部 Header
左栏：模式切换 + 上传区 + 上传历史
中栏：3D 预览区 + AI 对话区
右栏：历史版本面板，默认隐藏
```

推荐比例：

```text
左栏：320px
中栏：minmax(520px, 1fr)
右栏：384px
```

全屏模式：

- 隐藏 Header、左栏、右栏、聊天区。
- 只保留 3D 主视图区。

## 5. 组件库

## 5.1 Button 按钮

### Primary Button

用途：

- 登录
- 新建项目
- 弹窗主操作
- 导入授权

样式：

```css
.btn-primary {
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: var(--gradient-primary);
}
```

状态：

- default：品牌渐变背景。
- hover：亮度提升。
- active：轻微下压 `translateY(1px)`。
- disabled：透明度 50%，不可点击。
- loading：保留宽度，显示加载指示。

### Ghost Button

用途：

- 返回
- 历史操作
- 工具栏按钮

样式：

```css
.btn-ghost {
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.76);
  background: transparent;
}
```

### Icon Button

用途：

- 视图切换
- 删除
- 下载
- 历史打开
- 关闭弹窗

规则：

- 仅图标按钮必须有 `aria-label`。
- 图标尺寸 20-24px。
- hover 颜色跟随文字主题。

## 5.2 Input 输入框

用途：

- 登录账号密码。
- 搜索项目。
- 对话输入。
- 表单字段。

状态：

- default：暗色底。
- focus：蓝色边框。
- invalid：红色边框。
- disabled：透明度降低。
- placeholder：`rgba(255,255,255,0.34)`。

## 5.3 Tabs 标签切换

工作台模式：

- 通用建模
- 原生精密

规范：

- 容器内左右平分。
- 当前项蓝色边框或蓝色背景。
- 切换时必须同步刷新上传历史和中间 3D 预览。

状态：

- default：深灰背景。
- active：蓝色高亮。
- disabled：用于未授权能力。

## 5.4 Upload Dropzone 上传区

用途：

- 上传 3D / PDF / 图片。

文案：

```text
拖入或点击上传
支持 STL、STEP、PDF、JPG、PNG 格式
最大 10MB
```

状态：

- default：虚线或弱边框。
- hover：边框变蓝。
- dragging：蓝色高亮遮罩。
- loading：显示加载态。
- error：Toast 提示文件不支持或超过 10MB。
- success：文件进入上传历史并切换预览。

交互：

- 点击上传区触发 file input。
- 拖入上传区可上传。
- 拖入 3D 预览区也可上传。
- 双击预览区可打开文件选择。

## 5.5 Upload History 上传历史卡片

结构：

```text
文件图标 | 文件名 | 文件大小 + 时间 + 缓存状态 | 加载 | 删除
```

规范：

- 标题 14px。
- 时间 12-14px，禁止换行。
- 当前文件卡片高亮。
- 点击整张卡片加载文件。
- 删除按钮 hover 红色。

状态：

- default
- hover
- active
- metadata-only
- cached

## 5.6 Project Card 项目卡片

内容：

- 文件图标 / 项目封面。
- 项目名称。
- 更新时间。
- 文件数 / 版本数。
- 更多操作。

规则：

- 网格视图 4 列。
- 标题超长省略。
- hover 显示完整标题。
- 列表视图去掉大面积添加占位。

## 5.7 Floating Toolbar 3D 工具栏

按钮：

- 等轴线
- 前视图
- 俯视图
- 右视图
- 标记
- 爆炸视图
- 回到原稿
- 全屏

规范：

- 浮动于 3D 视口顶部居中。
- 胶囊背景。
- 当前视图 active 高亮。
- 移动端允许横向滚动。

交互：

- 等轴线 / 前视 / 俯视 / 右视：改变模型观察角度。
- 标记：进入坐标标记模式。
- 爆炸视图：模型拆解 / 合拢。
- 回到原稿：原稿状态与修改状态来回切换。
- 全屏：隐藏其他区域，仅显示主视区。

## 5.8 3D Viewport 视口

视觉元素：

- 深色背景。
- 高清 canvas 地面网格。
- 鼠标跟随高亮。
- 金属齿轮代理模型。
- STL 三角面预览。

状态：

- empty：未加载文件。
- loading：加载中。
- model-loaded：模型已加载。
- marker-mode：标记模式。
- fullscreen：全屏模式。
- dragging-file：文件拖入状态。

交互：

- 鼠标移动驱动网格光效。
- 拖拽文件上传。
- 双击打开文件选择。
- 视图按钮改变模型角度。
- 聊天指令改变模型 visual 状态。

## 5.9 Chat Dock 对话面板

区域：

- 顶部标题和操作按钮。
- 消息列表。
- 输入栏。
- 模式下拉：专家模式 / 自动模式。

消息规则：

### 用户提问

```css
.message.user {
  width: fit-content;
  max-width: min(720px, 100%);
  align-self: flex-end;
}
```

- 根据内容自适应宽度。
- 最大 720px。
- 超出自动换行。
- 右对齐。

### AI 输出

```css
.message.assistant {
  width: fit-content;
  max-width: 100%;
  align-self: flex-start;
}
```

- 根据内容自适应。
- 最大为对话区域内容宽度。
- 超出自动换行。
- 左对齐。

输入交互：

- 空内容禁止发送。
- Enter / 提交按钮发送。
- 发送后清空输入。
- 自动滚动到底部。

模式：

- 专家模式：直接执行本地解析或保存设计指令。
- 自动模式：先输出规划建议。

支持本地指令：

- 帮助
- 分析 / 尺寸
- 撤销
- 重置
- 颜色
- 透明度
- 线框 / 实体
- 缩放
- 旋转
- 工程图
- 结构仿真
- 动力学仿真

## 5.10 History Panel 历史版本

结构：

- 标题栏。
- 版本卡片列表。
- 当前版本高亮。
- 操作区：恢复 / 指令 / 下载 / 删除。

规则：

- 默认隐藏。
- 点击聊天头部历史按钮显示。
- 点击关闭按钮隐藏。
- 版本卡片标题 14px。
- 时间 12px，不换行。
- 下载和删除 icon 右对齐。

状态：

- current
- done
- failed
- hover

## 5.11 Modal 弹窗

用途：

- 账户信息。
- 成员管理。
- CAD 联动。
- 模型配置。
- 增值服务。
- 仿真参数。
- License 提示。
- 转换报告。

规范：

- 遮罩居中。
- 点击遮罩可关闭。
- ESC 可关闭。
- 关闭按钮右上角。
- 表单提交后 Toast。

## 5.12 Toast 轻提示

位置：

- 页面底部居中。

用途：

- 上传成功。
- 文件不支持。
- 保存成功。
- 删除成功。
- 版本恢复。
- License 提示。

规范：

- 展示 1.8s。
- 不阻塞用户操作。

## 6. 图标系统

当前系统支持两类图标：

### 6.1 内联 SVG Sprite

适合：

- 工作台工具栏。
- 历史版本。
- 上传操作。
- 本地离线页面。

规则：

- 线性图标。
- 统一 `stroke-width: 1.8-2`。
- 小图标 16px。
- 常规按钮 20px。
- 工具操作 24px。

### 6.2 Multi Style Icon Lib

适合：

- 用户菜单。
- 通用后台图标。

当前使用：

- 账户信息：user
- 成员管理：members
- 设计联动：link
- 模型配置：setting
- 增值服务：star
- 使用轨迹：chart
- 退出登录：logout

规则：

- 默认风格：linear。
- CDN 失败时使用内联 SVG fallback。
- hover 颜色跟随文字。

## 7. 交互模式

## 7.1 文件上传流程

```text
点击/拖拽文件
→ 格式校验
→ 大小校验
→ 读取文件
→ 清空当前版本历史
→ 加入上传历史
→ 中间区域显示 3D 预览
→ 自动输出几何分析报告
→ 启用聊天修改
```

## 7.2 历史文件切换

```text
点击上传历史卡片
→ 设置 activeFileId
→ 渲染 3D 预览
→ 更新上传列表 active 状态
→ 输出加载提示
```

## 7.3 聊天修改

```text
用户输入指令
→ 添加用户气泡
→ 专家模式执行本地解析
→ 成功则修改模型 visual 状态
→ 保存版本
→ 打开历史面板
```

## 7.4 回到原稿

```text
首次点击：备份当前状态，恢复 originalSnapshot
再次点击：恢复 currentStateBackup
```

## 7.5 撤销

```text
修改前 saveUndoState()
→ 执行修改
→ 用户输入撤销/undo
→ 从 undoStack 恢复上一步
```

## 8. 表单规范

表单字段：

- label 清晰描述。
- 输入框必须有 placeholder。
- 必填字段使用 `required`。
- 错误时 `.invalid` 红色边框。

提交：

- 空值不可提交。
- 成功 Toast。
- 失败显示错误文案。

## 9. 状态规范

### 9.1 Loading

用于：

- 文件上传。
- 模型加载。
- 仿真计算。

表现：

- 按钮禁用。
- 显示 loading class。
- 禁止重复提交。

### 9.2 Empty

用于：

- 无项目。
- 无上传历史。
- 无版本历史。

表现：

- 虚线边框。
- 简短说明。
- 可选主操作按钮。

### 9.3 Error

用于：

- 登录失败。
- 文件格式不支持。
- 文件超过 10MB。
- License 未开通。

表现：

- 红色文本 / Toast。
- 不破坏当前页面状态。

### 9.4 Success

用于：

- 上传成功。
- 保存配置。
- 导出成功。
- 版本恢复。

表现：

- Toast。
- 对应列表刷新。

## 10. 响应式规范

断点：

```css
@media (max-width: 1380px) {}
@media (max-width: 900px) {}
@media (max-width: 520px) {}
```

规则：

- `1380px` 以下历史面板改为固定抽屉。
- `900px` 以下工作台由三栏变为纵向布局。
- `520px` 以下输入区允许换行。
- 浮动工具栏允许横向滚动。
- 对话气泡不能超出屏幕。

## 11. 无障碍规范

必须保留：

- 图标按钮 `aria-label`。
- 弹窗 `role="dialog"` 和 `aria-modal="true"`。
- 上传 input 保持可访问。
- Toast 使用简短文字。
- 键盘 ESC 可关闭弹窗。
- 表单错误文本可读。

对比度：

- 正文至少 `rgba(255,255,255,0.76)`。
- 辅助文字不低于 `rgba(255,255,255,0.4)`。
- 蓝色激活态搭配深色背景。

## 12. 组件命名规范

页面级：

- `.login-page`
- `.project-home`
- `.workspace-shell`

模块级：

- `.home-toolbar`
- `.workspace-left`
- `.workspace-center`
- `.history-panel`
- `.chat-dock`
- `.viewport-panel`

组件级：

- `.upload-card`
- `.history-card`
- `.floating-toolbar`
- `.message`
- `.modal-backdrop`
- `.project-modal`

状态类：

- `.active`
- `.current`
- `.failed`
- `.loading`
- `.dragging`
- `.dragging-file`
- `.fullscreen-mode`
- `.marker-mode`
- `.stl-preview-mode`
- `.cad-preview-mode`

## 13. 页面模板

### 13.1 登录页模板

```html
<main class="login-page">
  <section class="hero-brand"></section>
  <section class="login-panel">
    <form class="login-form"></form>
  </section>
</main>
```

### 13.2 工作台首页模板

```html
<main class="project-home">
  <header class="home-topbar"></header>
  <section class="home-toolbar"></section>
  <section class="project-grid"></section>
</main>
```

### 13.3 工作台详情页模板

```html
<main class="workspace-shell">
  <header class="workspace-topbar"></header>
  <section class="workspace-main">
    <aside class="workspace-left"></aside>
    <section class="workspace-center"></section>
    <aside class="history-panel"></aside>
  </section>
</main>
```

## 14. 后续扩展方向

建议新增文件：

- `tokens.css`：集中管理设计 Token。
- `components.css`：组件库样式。
- `interactions.js`：通用交互工具。
- `icons.js`：图标映射。
- `DESIGN_SYSTEM.json`：供 Figma / 前端同步的 Token JSON。

建议组件化：

- Button
- IconButton
- Modal
- Toast
- UploadDropzone
- UploadHistoryItem
- ProjectCard
- ViewToolbar
- ChatMessage
- HistoryVersionCard
- DataTable
- EmptyState
- LicenseAlert

## 15. 设计验收清单

每次新增页面或组件，需要检查：

- 是否符合暗色 Token。
- 是否有 hover / active / disabled 状态。
- 是否支持 320px 最小宽度。
- 文案是否不溢出。
- 图标是否统一线性风格。
- 弹窗是否可 ESC / 遮罩关闭。
- 表单是否有错误状态。
- 上传/删除/保存是否有 Toast。
- 是否不会破坏 3D 主视区。
- 是否可被键盘和读屏工具识别。
