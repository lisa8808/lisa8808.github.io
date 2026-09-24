# AI-Shrek 展厅 Demo

## 启动

双击 `index.html`，即可在现代浏览器中运行。

Demo 是纯静态前端展品，只使用目录内的 HTML、CSS、JavaScript、图片、视频、STL 和 GLB 资源。运行时不启动后台进程，不监听端口，不连接 API，也不依赖 PowerShell、Python、Node、CAD 软件或文件转换工具。

## 默认演示文件

上传文件位于 `source-files/`：

- 通用建模：`source-files/general/`
- 原生精密：`source-files/precision/`

STEP 文件通过文件名匹配预置 GLB 展示 Before/After，不在展厅计算机上执行 STEP 解析或转换。

## 迁移

复制完整 `shrek` 目录并保留内部相对目录结构。目录名称、磁盘和上级路径可以改变。

最低环境：支持 WebGL 的现代桌面浏览器。
