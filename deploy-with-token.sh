#!/bin/bash
# 使用 GitHub Token 部署（更安全的方式）

set -e

REPO_NAME="clawbot-profile"

echo "🚀 ClawBot Profile GitHub Pages 部署"
echo "===================================="
echo ""

# 从环境变量获取Token
if [ -z "$GH_TOKEN" ]; then
    echo "❌ 请设置 GitHub Token 环境变量:"
    echo "   export GH_TOKEN=your_github_token"
    echo ""
    echo "获取 Token 步骤:"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 和 'workflow' 权限"
    echo "4. 生成并复制 token"
    exit 1
fi

# 配置 git
export GIT_CONFIG_GLOBAL=/tmp/gitconfig_$$
git config --global user.email "clawbot@openclaw.local"
git config --global user.name "ClawBot"

# 获取用户名
echo "🔍 获取 GitHub 用户信息..."
GH_USER=$(curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user | grep '"login"' | head -1 | cut -d'"' -f4)

if [ -z "$GH_USER" ]; then
    echo "❌ Token 无效或已过期"
    exit 1
fi

echo "✅ 用户: $GH_USER"

# 检查仓库是否存在
echo "📦 检查仓库..."
REPO_EXISTS=$(curl -s -H "Authorization: token $GH_TOKEN" "https://api.github.com/repos/$GH_USER/$REPO_NAME" | grep '"id"' | wc -l)

if [ "$REPO_EXISTS" -eq 0 ]; then
    echo "📦 创建仓库..."
    curl -s -H "Authorization: token $GH_TOKEN" \
         -H "Accept: application/vnd.github.v3+json" \
         -d '{"name":"'$REPO_NAME'","description":"ClawBot Personal Profile","public":true}' \
         https://api.github.com/user/repos
    sleep 3
else
    echo "📦 仓库已存在"
fi

# 创建临时目录
DEPLOY_DIR=$(mktemp -d)
cd "$DEPLOY_DIR"

# 初始化 git
git init
git remote add origin "https://$GH_TOKEN@github.com/$GH_USER/$REPO_NAME.git"

# 创建文件
cp ~/.openclaw/workspace/projects/clawbot-profile/index.html .

# 创建工作流目录
mkdir -p .github/workflows
cp ~/.openclaw/workspace/projects/clawbot-profile/.github/workflows/deploy.yml .github/workflows/

# 创建 README
cat > README.md << EOF
# ClawBot Profile

Personal profile page for ClawBot - OpenClaw AI Assistant.

## URL

https://$GH_USER.github.io/$REPO_NAME

## Last Updated

$(date '+%Y-%m-%d %H:%M:%S')
EOF

# 提交
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes"
git branch -M main

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push -f origin main

# 启用 Pages
echo "🌐 启用 GitHub Pages..."
curl -s -X POST \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"source":{"branch":"main","path":"/"}}' \
    "https://api.github.com/repos/$GH_USER/$REPO_NAME/pages" >/dev/null || true

# 输出结果
echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   https://$GH_USER.github.io/$REPO_NAME"
echo ""
echo "📦 仓库地址:"
echo "   https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "⏰ 页面将在 2-5 分钟后生效"

# 清理
cd /
rm -rf "$DEPLOY_DIR"
rm -f "$GIT_CONFIG_GLOBAL"
