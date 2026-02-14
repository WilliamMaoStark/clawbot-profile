#!/bin/bash
# ClawBot Profile GitHub Pages 部署脚本

set -e

REPO_NAME="clawbot-profile"
GH_USER=""

echo "🚀 ClawBot Profile GitHub Pages 部署"
echo "===================================="
echo ""

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ 请先安装 GitHub CLI:"
    echo "   sudo apt install gh"
    exit 1
fi

# 检查登录状态
if ! gh auth status &> /dev/null; then
    echo "🔐 请先登录 GitHub:"
    echo "   gh auth login"
    echo ""
    echo "登录步骤:"
    echo "1. 选择 GitHub.com"
    echo "2. 选择 HTTPS"
    echo "3. 选择登录到浏览器 (Login with a web browser)"
    echo "4. 按提示完成授权"
    exit 1
fi

GH_USER=$(gh api user -q .login)
echo "✅ 已登录: $GH_USER"
echo ""

# 检查仓库是否存在
if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null; then
    echo "📦 仓库已存在: $GH_USER/$REPO_NAME"
else
    echo "📦 创建新仓库: $REPO_NAME"
    gh repo create "$REPO_NAME" --public --description "ClawBot Personal Profile" || true
    sleep 2
fi

# 创建临时目录
DEPLOY_DIR=$(mktemp -d)
echo "📁 部署目录: $DEPLOY_DIR"

# 克隆仓库
echo "📥 克隆仓库..."
gh repo clone "$GH_USER/$REPO_NAME" "$DEPLOY_DIR" 2>/dev/null || {
    # 如果克隆失败（空仓库），初始化
    cd "$DEPLOY_DIR"
    git init
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
}

# 复制文件
echo "📋 复制文件..."
cp ~/.openclaw/workspace/projects/clawbot-profile/index.html "$DEPLOY_DIR/"

# 创建 README
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# ClawBot Profile

Personal profile page for ClawBot - OpenClaw AI Assistant.

## Features

- Memory visualization (P0/P1/P2)
- Skills matrix
- API configuration status
- Auto-sync daily at 04:00 CST

## URL

https://YOUR_USERNAME.github.io/clawbot-profile

## Auto Deploy

This page is automatically updated daily via GitHub Actions.
EOF

# 提交更改
cd "$DEPLOY_DIR"
git add -A
git commit -m "Update profile: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes"
git branch -M main 2>/dev/null || true
git push -u origin main

# 启用 GitHub Pages
echo ""
echo "🌐 启用 GitHub Pages..."
gh api "repos/$GH_USER/$REPO_NAME/pages" -X POST \
    -f source='{"branch":"main","path":"/"}' 2>/dev/null || {
    echo "Pages 可能已经启用，检查状态..."
}

# 获取 Pages URL
sleep 3
PAGES_URL=$(gh api "repos/$GH_USER/$REPO_NAME/pages" -q .html_url 2>/dev/null || echo "https://$GH_USER.github.io/$REPO_NAME")

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   $PAGES_URL"
echo ""
echo "📦 仓库地址:"
echo "   https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "⚠️  注意:"
echo "   GitHub Pages 首次部署可能需要几分钟才能生效"
echo ""

# 清理
rm -rf "$DEPLOY_DIR"
