# AI-shrek Figma 组件库说明

这份说明配合 `AI-shrek.tokens.json` 使用。先在 Figma 中通过 Tokens Studio 导入 Token，再按本文件创建组件、变体与交互状态。

## 1. 推荐 Figma 页面结构

- `00 Cover`
- `01 Foundations`
- `02 Components / Button`
- `03 Components / Form`
- `04 Components / Upload`
- `05 Components / Workspace`
- `06 Components / Chat`
- `07 Patterns`
- `08 Page Templates`

## 2. Token 导入方式

1. 打开 Figma 文件。
2. 安装或打开 `Tokens Studio for Figma`。
3. 选择 `Import JSON`。
4. 导入 `figma/AI-shrek.tokens.json`。
5. 开启主题：
   - `AI-shrek Dark`
   - `AI-shrek Light`
6. 将 Token 同步为 Figma Variables。

## 3. 全局组件规范

所有组件默认遵循：

- 圆角：8px，面板可使用 12px。
- 图标：线性图标，16 / 20 / 24px 三档。
- 字体：中文优先 `PingFang SC`，英文优先 `Inter`。
- 卡片不嵌套卡片。
- 操作区需要具备默认、悬浮、按下、禁用、加载、错误、成功状态。
- 工作台类组件默认暗色主题优先。

## 4. Button

### 4.1 Component Properties

- `type`: `primary | secondary | ghost | danger`
- `size`: `sm | md | lg`
- `state`: `default | hover | pressed | disabled | loading`
- `iconLeft`: boolean
- `iconRight`: boolean
- `label`: text

### 4.2 尺寸

| Size | Height | Padding X | Gap | Font |
| --- | --- | --- | --- | --- |
| sm | 32 | 12 | 6 | 12 |
| md | 40 | 16 | 8 | 14 |
| lg | 48 | 20 | 8 | 16 |

### 4.3 样式

- Primary：蓝青渐变，白色文字。
- Secondary：深灰面板，弱边框，白色文字。
- Ghost：透明底，hover 使用白色 8% 背景。
- Danger：红色文字和红色弱边框。

## 5. Icon Button

### 5.1 Component Properties

- `size`: `sm | md | lg`
- `state`: `default | hover | active | disabled`
- `shape`: `square | circle`
- `icon`: instance swap

### 5.2 使用场景

- 视图切换。
- 历史版本下载。
- 删除。
- 关闭弹窗。
- 工具栏快捷操作。

## 6. Input

### 6.1 Component Properties

- `state`: `default | focus | filled | error | disabled`
- `prefixIcon`: boolean
- `suffixIcon`: boolean
- `placeholder`: text
- `value`: text
- `helperText`: text

### 6.2 交互规则

- focus 时边框使用 `brand.primary`。
- error 时边框和辅助文案使用 `status.danger`。
- disabled 时透明度 50%，不可输入。

## 7. Select / Dropdown

### 7.1 Component Properties

- `state`: `default | hover | open | disabled`
- `value`: text
- `hasIcon`: boolean

### 7.2 规格

- 高度：40px。
- 圆角：8px。
- 下拉层使用 `shadow.popover`。
- 点击外部关闭。
- 选项 hover 有浅色背景反馈。

## 8. Tabs

### 8.1 工作台模式 Tabs

组件名称：`ModeTabs`

变体：

- `mode`: `general | precision`
- `state`: `default | active`

规则：

- 容器内左右平分。
- 激活项背景使用蓝色弱透明。
- 非激活项文字使用次级文字。

### 8.2 视图切换 Tabs

组件名称：`ViewSwitch`

变体：

- `view`: `grid | list`
- `state`: `active | inactive`

规则：

- 图标按钮必须在完整边框容器内。
- 边框不可被裁切。
- active 使用蓝色描边或深蓝底。

## 9. Upload Dropzone

### 9.1 Component Properties

- `mode`: `general | precision`
- `state`: `empty | hover | dragging | uploading | uploaded | error`
- `title`: text
- `description`: text
- `hasFile`: boolean

### 9.2 通用建模文案

标题：`拖入或点击上传`

副文案：

```text
支持 STL、STEP、PDF、JPG、PNG 格式
最大 10MB
```

### 9.3 原生精密文案

标题：`拖入或点击上传`

副文案：

```text
支持 PRT、ASM、STL、STEP、OBJ、PLY、3MF 格式
最大 10MB
```

### 9.4 交互

- hover：边框变亮。
- dragging：出现蓝色描边和浅蓝蒙层。
- uploading：显示进度。
- uploaded：文件加入上传历史。
- error：显示格式或大小错误。

## 10. Upload History Item

### 10.1 Component Properties

- `state`: `default | hover | active | error`
- `fileType`: `stl | step | pdf | image | other`
- `title`: text
- `time`: text

### 10.2 规格

- 标题字号：14px。
- 时间字号：12px。
- 时间不换行。
- 当前文件 active 需要显示蓝色强调。
- 点击列表项切换中间 3D 文件预览。

## 11. Project Card

### 11.1 Component Properties

- `view`: `grid | list`
- `state`: `default | hover | selected`
- `title`: text
- `meta`: text
- `thumbnail`: image

### 11.2 网格规则

- 桌面端默认一行 4 个。
- 标题单行省略。
- hover 标题通过 tooltip 展示完整内容。
- 卡片 hover 轻微上移 2px。

## 12. Workspace Toolbar

组件名称：`WorkspaceToolbar`

按钮：

- 等轴线
- 前视图
- 俯视图
- 右视图
- 标记
- 爆炸视图
- 回到原稿
- 全屏

每个按钮需要：

- 默认态。
- hover 态。
- active 态。
- disabled 态。
- tooltip。

交互说明：

- 等轴线：模型恢复等轴视角。
- 前视图：模型切换前视角。
- 俯视图：模型切换俯视角。
- 右视图：模型切换右视角。
- 标记：进入标记模式。
- 爆炸视图：模型部件分离展示。
- 回到原稿：恢复导入初始状态。
- 全屏：隐藏左侧列表和对话区域，只展示主视区。

## 13. 3D Viewport

### 13.1 组成

- 画布背景。
- 交互地面网格。
- 3D 模型主体。
- 视图工具栏。
- 文件状态角标。
- 拖拽上传覆盖层。

### 13.2 状态

- empty：未导入文件。
- loading：解析文件中。
- ready：显示 3D 文件。
- error：文件解析失败。
- fullscreen：主视区全屏。

### 13.3 视觉

- 背景：深色工业场景。
- 网格：透视地面网格，线条随远近衰减。
- 模型：金属材质，高光，阴影。
- 文件导入后模型需要居中且占据主视区 60% 到 75%。

## 14. Chat Dock

### 14.1 Component Properties

- `state`: `default | dragging | resized | loading`
- `mode`: `expert | auto`
- `historyOpen`: boolean

### 14.2 对话气泡

用户气泡：

- 右对齐。
- 宽度随内容自适应。
- 最大宽度 720px。
- 内容超过最大宽度自动换行。

AI 气泡：

- 左对齐。
- 宽度随内容自适应。
- 最大宽度为对话内容区域宽度。
- 左右间距与用户气泡保持一致。

### 14.3 输入区

- 模式选择：`专家模式 | 自动模式`。
- 文案不换行。
- 输入框支持回车发送。
- 发送按钮 disabled 状态需要透明度降低。
- 发送中显示 loading。

### 14.4 拖拽拉伸

- 拖拽横杠上下调整对话框高度。
- 最小高度：260px。
- 最大高度：680px。
- 拖动时内容区域平滑过渡。

## 15. History Version Card

### 15.1 Component Properties

- `state`: `default | current | hover`
- `title`: text
- `time`: text

### 15.2 规格

- 标题 14px。
- 时间 12px，不换行。
- 操作区右对齐。
- 只保留下载 icon 和删除 icon。
- 当前版本显示当前状态标识。

## 16. Avatar Menu

### 16.1 Component Properties

- `state`: `closed | open`
- `userName`: text

### 16.2 菜单项

- 个人资料
- 设置
- 帮助中心
- 退出登录

规则：

- 每项左侧都有线性图标。
- 文案和图标垂直居中。
- 气泡右对齐头像。
- 点击外部关闭。

## 17. Modal

### 17.1 Component Properties

- `size`: `sm | md | lg`
- `state`: `default | loading | success | error`
- `showClose`: boolean

### 17.2 行为

- ESC 关闭。
- 点击遮罩关闭。
- 主按钮 loading。
- 成功或失败 Toast 反馈。

## 18. Toast

### 18.1 Component Properties

- `type`: `success | error | warning | info`
- `state`: `enter | visible | exit`

### 18.2 规格

- 位置：右上角。
- 圆角：8px。
- 阴影：popover。
- 自动关闭：2.4s。

## 19. Page Templates

### 19.1 登录页

结构：

- 全屏机械臂背景。
- 右侧登录面板。
- 账号、密码、记住我、登录按钮。
- 默认记住密码。
- 登录按钮在账号密码为空时透明度 50%。
- 输入完成后激活。

### 19.2 我的工作台

结构：

- 顶部导航。
- 搜索、筛选、视图切换、新建按钮同一行。
- 网格视图一行 4 个。
- 列表视图隐藏大占位添加块。

### 19.3 工作台详情页

结构：

- 左侧上传与历史列表。
- 中间 3D 主视区。
- 右侧历史版本面板，可开关。
- 底部创造对话，可拖拽调整高度。

## 20. Figma 组件命名

建议使用：

- `AI/Button`
- `AI/IconButton`
- `AI/Input`
- `AI/Select`
- `AI/Tabs/ModeTabs`
- `AI/Tabs/ViewSwitch`
- `AI/Upload/Dropzone`
- `AI/Upload/HistoryItem`
- `AI/Project/Card`
- `AI/Workspace/Toolbar`
- `AI/Workspace/Viewport`
- `AI/Chat/Dock`
- `AI/Chat/Message`
- `AI/History/VersionCard`
- `AI/Avatar/Menu`
- `AI/Feedback/Modal`
- `AI/Feedback/Toast`

## 21. UI/UE 验收标准

- 组件必须有完整状态。
- 可点击元素最小点击区域不低于 32px。
- 主要按钮必须能从视觉上区分默认、hover、disabled。
- 上传后必须有文件进入历史列表。
- 历史列表点击后必须切换中间预览内容。
- 3D 工具栏点击后必须有视觉和状态反馈。
- 对话框拖拽必须流畅，不能卡顿。
- 全屏时只保留主区域。
- 所有标题和时间不能出现意外换行。
- 320px 宽度下页面不可横向溢出。
- 深色背景下正文对比度需要达到 WCAG AA。
