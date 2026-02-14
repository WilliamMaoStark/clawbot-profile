#!/bin/bash
# ClawBot Profile 远程访问启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="/tmp/clawbot-profile-server.pid"
TUNNEL_PIDFILE="/tmp/clawbot-profile-tunnel.pid"

start() {
    echo "🚀 启动 ClawBot Profile 服务..."
    
    # 启动HTTP服务器
    cd "$SCRIPT_DIR"
    python3 -m http.server 8080 > /dev/null 2>&1 &
    echo $! > "$PIDFILE"
    echo "✅ HTTP服务器已启动: http://localhost:8080"
    
    # 等待HTTP服务器启动
    sleep 2
    
    # 检查cloudflared
    if [ ! -f /tmp/cloudflared ]; then
        echo "📥 下载 cloudflared..."
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
        chmod +x /tmp/cloudflared
    fi
    
    # 启动tunnel
    echo "🌐 启动内网穿透..."
    /tmp/cloudflared tunnel --url http://localhost:8080 > /tmp/cloudflared.log 2>&1 &
    TUNNEL_PID=$!
    echo $TUNNEL_PID > "$TUNNEL_PIDFILE"
    
    # 等待tunnel建立
    sleep 5
    
    # 获取URL
    URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log | head -1)
    
    if [ -n "$URL" ]; then
        echo ""
        echo "🎉 服务已启动！"
        echo ""
        echo "📱 本地访问: http://localhost:8080"
        echo "🌍 远程访问: $URL"
        echo ""
        echo "⚠️  注意: 这是一个临时tunnel，重启后会变更地址"
        echo ""
        echo "停止服务: ./remote-access.sh stop"
    else
        echo "❌ Tunnel启动失败，请检查日志: /tmp/cloudflared.log"
    fi
}

stop() {
    if [ -f "$PIDFILE" ]; then
        kill $(cat "$PIDFILE") 2>/dev/null
        rm -f "$PIDFILE"
        echo "✅ HTTP服务器已停止"
    fi
    
    if [ -f "$TUNNEL_PIDFILE" ]; then
        kill $(cat "$TUNNEL_PIDFILE") 2>/dev/null
        rm -f "$TUNNEL_PIDFILE"
        echo "✅ Tunnel已停止"
    fi
    
    # 清理所有相关进程
    pkill -f "python3 -m http.server 8080" 2>/dev/null
    pkill -f "cloudflared tunnel" 2>/dev/null
    
    echo "🛑 所有服务已停止"
}

status() {
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo "✅ HTTP服务器运行中 (PID: $(cat $PIDFILE))"
    else
        echo "❌ HTTP服务器未运行"
    fi
    
    if [ -f "$TUNNEL_PIDFILE" ] && kill -0 $(cat "$TUNNEL_PIDFILE") 2>/dev/null; then
        URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)
        echo "✅ Tunnel运行中 (PID: $(cat $TUNNEL_PIDFILE))"
        if [ -n "$URL" ]; then
            echo "🌍 访问地址: $URL"
        fi
    else
        echo "❌ Tunnel未运行"
    fi
}

restart() {
    stop
    sleep 1
    start
}

case "${1:-start}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
