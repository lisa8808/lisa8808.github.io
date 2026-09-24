# AI-shrek Design System

## 1. Product Feel
AI-shrek uses a dark industrial workspace aesthetic for mechanical design. The interface should feel precise, technical, and calm, with blue accents reserved for primary actions and active states.

## 2. Color Tokens
- Page background: `#1d1f20` for home, `#121416` for workspace.
- Panel background: `#1a1c1e` primary, `#222426` secondary, `#282a2c` controls.
- Thumbnail background: `#0c0e10` for project/workbench thumbnails.
- Borders: `rgba(67, 70, 86, 0.5)` for home surfaces, `#27292b` for workspace dividers.
- Primary accent: `#307aff` for primary buttons, active states, and CAD highlights.
- Text primary: `rgba(255, 255, 255, 0.86)`.
- Text secondary: `rgba(255, 255, 255, 0.56)`.
- Text muted: `rgba(255, 255, 255, 0.45)`.
- Danger: `#ff7474` or `rgba(255, 132, 132, 0.92)`.

## 3. Typography
- Font stack: `PingFang SC`, `Microsoft YaHei`, `Arial`, sans-serif.
- Page title: 20px, 28px line-height, 500 weight.
- Card title: 14px, 20px line-height, 500 weight.
- Body/control text: 14px.
- Metadata/caption text: 13px.

## 4. Spacing And Layout
- Base spacing unit: 4px.
- Home topbar height: 72px.
- Workspace topbar height: 60px.
- Home side padding: `clamp(24px, 10.42vw, 200px)`.
- Card grid gap: 24px.
- Card radius: 8px.
- Control height: 38px.

## 5. Components
- Project card: dark panel with 160px thumbnail, 16px content padding, hover border and small translate lift.
- Create card: dashed/soft bordered placeholder card with centered add affordance.
- Modal: centered dark panel, 10px radius, 28px padding, existing backdrop.
- Context menu: 128px floating dark menu with 8px padding and hover rows.
- Empty state: CAD document illustration on a gridded dark surface.

## 6. Motion
- Use short 160ms transitions for hover, focus, transforms, border color, and shadows.
- Animate only `transform`, `opacity`, or `filter`.
- Keep interaction feedback subtle and utilitarian.

## 7. Accessibility
- Preserve semantic buttons and focusable cards.
- Maintain visible focus states via existing hover/focus styles.
- Avoid emoji icons in new UI; use existing SVG assets or inline SVG.
