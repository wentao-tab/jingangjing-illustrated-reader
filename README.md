# 金刚经配图版

> 原文《金刚经》提炼每一品最能代表主题的核心句整理，并配以 16:9 水墨佛学风格插图。
>
> An illustrated reader of the Diamond Sutra: selected core lines from each chapter, plain-language interpretation, audio reading, and 16:9 ink-style illustrations.

[在线阅读](https://wentao-tab.github.io/jingangjing-illustrated-reader/) · [个人站版本](https://liwentao.com/jingangjing/) · [License](./LICENSE)

**中文** | [English](#english)

![金刚经配图版预览](./public/assets/jingangjing/c32-s01.png)

作者：@文韬推荐

## 这是什么

《金刚经配图版》是一个经典阅读实验：把《金刚经》三十二品整理为图文卡片，每品提炼 2 条代表性经文，配合白话理解、水墨风格插图和诵读音频，降低第一次阅读《金刚经》的门槛。

它不是逐字逐句的权威注疏，而是一个更适合普通读者进入经典的可视化阅读入口：先抓住每一品的核心句，再通过图像、白话和章节导航建立整体印象。

## 当前进度

- 32 品全部整理完成。
- 64 条核心经文卡片。
- 64 张 16:9 水墨佛学风格配图。
- 支持章节目录、上一品/下一品、下拉选择品目。
- 支持图文卡片阅读和 lightbox 灯箱查看。
- 支持诵读音频播放、暂停和头部微动效反馈。
- 已拆成独立开源仓库，同时保留个人站版本。

## 技术栈

- [Astro](https://astro.build/)：静态站点生成。
- TypeScript：页面数据和交互脚本。
- SCSS：页面布局、响应式样式和微动效。
- 原生 HTML Audio：诵读音频播放控制。
- GitHub Pages：开源版本静态部署。

## 项目结构

```text
src/pages/index.astro              # 主阅读器页面
src/components/MainHead.astro      # 页面 head 与 favicon
src/utils/paths.ts                 # base path 工具
public/assets/jingangjing/         # 64 张配图与诵读音频
public/favicon.png                 # 项目图标
```

## 必须坦诚的限制

这个项目不是“权威佛学译注”，也不替代正式经文版本或法师讲解。

目前的白话解释偏向普通读者阅读体验，选句也遵循“每品提炼两个最适合图文阅读的核心句”的原则，并非完整逐句注解。

另外：

- 配图由 AI 生成，可能存在意象不准确、风格不一致等问题。
- 某些佛教意象可能只是视觉化表达，不应被理解为教义定论。
- 仓库包含图片和音频资源，体积较大。
- 音频文件超过 GitHub 推荐的 50MB 单文件大小，但未超过 100MB 硬限制。

## 快速开始

```bash
npm install
npm run dev
```

构建静态页面：

```bash
npm run build
```

## GitHub Pages 部署

如果部署到 GitHub Pages，并且仓库名不是根域名仓库，可以在构建时设置：

```bash
PUBLIC_BASE_PATH=/jingangjing-illustrated-reader/ npm run build
```

本仓库已包含 GitHub Actions workflow，推送到 `main` 后可以通过 GitHub Pages 自动部署。

## License

MIT

---

## English

[中文](#金刚经配图版) | **English**

## What Is This

Jingangjing Illustrated Reader is a visual reading experiment for the Diamond Sutra. It reorganizes the 32 chapters into illustrated reading cards. Each chapter contains two selected core lines, a plain-language note, a 16:9 ink-style illustration, and optional audio reading.

This is not an authoritative Buddhist commentary. It is a gentle entry point for readers who want to approach the text through structure, images, and short explanations before going deeper into formal translations or commentaries.

## Progress

- 32 chapters completed.
- 64 selected sutra lines.
- 64 AI-generated 16:9 illustrations.
- Chapter navigation, card reading, and lightbox view.
- Audio playback with subtle header animation.
- Standalone open-source version plus a personal-site version.

## Tech Stack

- [Astro](https://astro.build/) for static site generation.
- TypeScript for page data and interaction logic.
- SCSS for layout, responsive styling, and micro animations.
- Native HTML Audio for playback control.
- GitHub Pages for static deployment.

## Limitations

This project is not a scholarly translation or an official commentary. The selected lines and plain-language notes are designed for general readers and visual reading.

The illustrations are AI-generated and may contain inaccurate symbols, inconsistent styles, or imperfect visual interpretations. Contributions and corrections are welcome.

## Development

```bash
npm install
npm run dev
npm run build
```

## License

MIT
