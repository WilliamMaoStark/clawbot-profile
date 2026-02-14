#!/bin/bash
# ClawBot Profile 自动更新脚本
# 添加到 crontab: 0 4 * * * /home/clawbot/.openclaw/workspace/projects/clawbot-profile/update-profile.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/update.log"
PIDFILE="/tmp/clawbot-profile-server.pid"

echo "========================================" >> "$LOG_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') - 开始更新 Profile" >> "$LOG_FILE"

cd "$SCRIPT_DIR"

# 运行生成脚本
node generate-profile.js >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ 更新成功" >> "$LOG_FILE"
    
    # 确保HTTP服务器在运行
    if [ ! -f "$PIDFILE" ] || ! kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 🔄 重启HTTP服务器" >> "$LOG_FILE"
        python3 -m http.server 8080 > /dev/null 2>&1 &
        echo $! > "$PIDFILE"
    fi
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 更新失败" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
