# SLSY 博客维护说明

站点地址：<https://slsy00.github.io/>

这份 README 是可直接照做的操作手册，包含：

1. 当前 Hexo 项目目录分别代表什么。
2. 如何本地修改与调试预览。
3. 如何把更新推送到 GitHub Pages。
4. 如何在不同电脑之间拉取并继续更新。

## 一、当前项目目录代表什么

在本项目 `C:\Users\11402\Desktop\hexo` 下，常见目录作用如下：

```text
hexo/
├─ source/            # 站点源文件（文章、页面、图片等）
│  └─ _posts/         # 博客文章 Markdown 文件
├─ themes/            # 主题文件（当前使用 Fluid 主题）
├─ public/            # hexo generate 后生成的静态站点文件（可删除重建）
├─ scaffolds/         # 新建文章时使用的模板
├─ node_modules/      # npm 安装的依赖
├─ .deploy_git/       # hexo deploy 使用的发布临时仓库
├─ _config.yml        # Hexo 主配置（站点信息、部署配置等）
└─ package.json       # npm 脚本与依赖清单
```

## 二、首次环境准备（新电脑只需做一次）

### 1）安装 Node.js（运行 Hexo 所需）

```powershell
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

用途：安装 Node.js LTS 与 npm。

### 2）安装 Git（拉取与推送所需）

```powershell
winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
```

用途：安装 Git 命令行工具。

### 3）配置 Git 身份（提交作者信息）

```powershell
& "C:\Program Files\Git\cmd\git.exe" config --global user.name "SLSY00"
& "C:\Program Files\Git\cmd\git.exe" config --global user.email "1140262747@qq.com"
```

用途：设置提交记录中的用户名和邮箱。

### 4）如果 Git 推送超时，配置代理（按需）

```powershell
& "C:\Program Files\Git\cmd\git.exe" config --global http.proxy http://127.0.0.1:7890
& "C:\Program Files\Git\cmd\git.exe" config --global https.proxy http://127.0.0.1:7890
```

用途：让 Git 走本地代理，解决浏览器可访问但 Git 无法 push 的情况。

不再需要代理时可取消：

```powershell
& "C:\Program Files\Git\cmd\git.exe" config --global --unset http.proxy
& "C:\Program Files\Git\cmd\git.exe" config --global --unset https.proxy
```

用途：移除 Git 代理配置。

## 三、本地修改与调试预览

### 1）进入项目目录

```powershell
cd C:\Users\11402\Desktop\hexo
```

用途：切换到 Hexo 项目根目录。

### 2）新建文章（可选）

```powershell
& "C:\Program Files\nodejs\npx.cmd" hexo new post "文章标题"
```

用途：在 `source/_posts/` 里创建一篇带 front-matter 的新文章。

### 3）启动本地预览

```powershell
& "C:\Program Files\nodejs\npm.cmd" run server
```

用途：启动本地服务，默认访问 `http://localhost:4000`。

说明：修改 `source/`、`themes/` 内容后，页面通常会自动更新；若没有变化，手动刷新浏览器。

## 四、最终如何推送 Hexo 更新（发布上线）

在项目根目录执行：

```powershell
& "C:\Program Files\nodejs\npm.cmd" run clean
& "C:\Program Files\nodejs\npm.cmd" run build
& "C:\Program Files\nodejs\npm.cmd" run deploy
```

每条命令用途：

1. `run clean`：清空旧缓存与旧 `public` 结果，避免历史残留。
2. `run build`：重新生成静态站点文件到 `public/`。
3. `run deploy`：把生成后的静态文件推送到 GitHub Pages 仓库分支（当前配置是 `SLSY00/SLSY00.github.io` 的 `main`）。

## 五、在不同电脑上拉取并继续更新

推荐做法：维护一个“Hexo 源码仓库”（和 `SLSY00.github.io` 发布仓库分开）。

### A. 新电脑首次拉取源码并运行

```powershell
# 1) 克隆你的 Hexo 源码仓库（示例名：hexo-source）
& "C:\Program Files\Git\cmd\git.exe" clone https://github.com/SLSY00/hexo-source.git C:\work\hexo

# 2) 进入目录
cd C:\work\hexo

# 3) 安装依赖
& "C:\Program Files\nodejs\npm.cmd" install

# 4) 本地预览
& "C:\Program Files\nodejs\npm.cmd" run server

# 5) 发布上线
& "C:\Program Files\nodejs\npm.cmd" run clean
& "C:\Program Files\nodejs\npm.cmd" run build
& "C:\Program Files\nodejs\npm.cmd" run deploy
```

用途：在新电脑恢复完整写作与发布能力。

### B. 日常多电脑同步（改完源码后）

在“当前电脑”提交源码：

```powershell
& "C:\Program Files\Git\cmd\git.exe" add .
& "C:\Program Files\Git\cmd\git.exe" commit -m "更新文章与配置"
& "C:\Program Files\Git\cmd\git.exe" push origin main
```

用途：把 `source/`、`themes/`、配置等源码同步到远端源码仓库。

在“另一台电脑”开始工作前先拉取：

```powershell
cd C:\work\hexo
& "C:\Program Files\Git\cmd\git.exe" pull origin main
```

用途：先同步最新源码，再继续编辑与发布，避免覆盖彼此修改。

---

如果当前还没有“Hexo 源码仓库”，建议尽快新建一个（私有或公开都行），这样多电脑协作会稳定很多。
