const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;
const PASSWORD = '002324';

// 配置
const CONFIG = {
    workspace: process.env.HOME + '/.openclaw/workspace',
    profileDir: process.env.HOME + '/.openclaw/workspace/projects/clawbot-profile'
};

app.use(express.json());

// CORS 允许前端访问
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 验证密码中间件
function verifyPassword(req, res, next) {
    const { password } = req.body;
    if (password !== PASSWORD) {
        return res.status(403).json({ error: '密码错误' });
    }
    next();
}

// 读取 MEMORY.md
app.get('/api/memory', (req, res) => {
    try {
        const content = fs.readFileSync(CONFIG.workspace + '/MEMORY.md', 'utf-8');
        res.json({ success: true, content });
    } catch (e) {
        res.status(500).json({ error: '读取失败' });
    }
});

// 更新 MEMORY.md
app.post('/api/memory', verifyPassword, (req, res) => {
    try {
        const { content } = req.body;
        fs.writeFileSync(CONFIG.workspace + '/MEMORY.md', content);
        
        // 重新生成 HTML
        exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
            if (error) {
                console.error('生成失败:', error);
                return res.status(500).json({ error: '生成失败' });
            }
            
            // 提交到 GitHub
            exec('git add -A && git commit -m "Update from web editor" && git push origin main', 
                { cwd: CONFIG.profileDir }, 
                (err) => {
                    if (err) console.error('推送失败:', err);
                }
            );
            
            res.json({ success: true, message: '已保存并重新生成' });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 编辑记忆项
app.put('/api/memory/item', verifyPassword, (req, res) => {
    try {
        const { level, index, newContent } = req.body;
        const filePath = CONFIG.workspace + '/MEMORY.md';
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // 找到对应项并替换
        const lines = content.split('\n');
        let foundLevel = false;
        let itemCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('## ')) {
                foundLevel = false;
            }
            
            if (line.includes(`[${level}]`)) {
                foundLevel = true;
            }
            
            if (foundLevel && line.match(/-\s*\[P\d\]/)) {
                if (itemCount === index) {
                    // 保留原有的前缀和标记
                    const prefix = line.match(/(-\s*\[P\d\](?:\[.*?\])?\s*)/)?.[1] || '';
                    lines[i] = prefix + newContent;
                    break;
                }
                itemCount++;
            }
        }
        
        fs.writeFileSync(filePath, lines.join('\n'));
        
        // 重新生成和部署
        exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
            if (error) return res.status(500).json({ error: '生成失败' });
            
            exec('git add -A && git commit -m "Update memory from web" && git push origin main', 
                { cwd: CONFIG.profileDir },
                (err) => {
                    if (err) console.error('推送失败:', err);
                }
            );
            
            res.json({ success: true });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 删除记忆项
app.delete('/api/memory/item', verifyPassword, (req, res) => {
    try {
        const { level, index } = req.body;
        const filePath = CONFIG.workspace + '/MEMORY.md';
        let content = fs.readFileSync(filePath, 'utf-8');
        
        const lines = content.split('\n');
        let foundLevel = false;
        let itemCount = 0;
        let deleteIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('## ')) {
                foundLevel = false;
            }
            
            if (line.includes(`[${level}]`)) {
                foundLevel = true;
            }
            
            if (foundLevel && line.match(/-\s*\[P\d\]/)) {
                if (itemCount === index) {
                    deleteIndex = i;
                    break;
                }
                itemCount++;
            }
        }
        
        if (deleteIndex >= 0) {
            lines.splice(deleteIndex, 1);
            fs.writeFileSync(filePath, lines.join('\n'));
            
            // 重新生成和部署
            exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
                if (error) return res.status(500).json({ error: '生成失败' });
                
                exec('git add -A && git commit -m "Delete memory from web" && git push origin main', 
                    { cwd: CONFIG.profileDir },
                    (err) => {
                        if (err) console.error('推送失败:', err);
                    }
                );
                
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ error: '未找到' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 编辑技能（修改描述）
app.put('/api/skill', verifyPassword, (req, res) => {
    try {
        const { name, newDesc } = req.body;
        
        // 修改 generate-profile.js 中的技能数据
        const filePath = CONFIG.profileDir + '/generate-profile.js';
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // 使用正则替换技能描述
        const regex = new RegExp(`(name: '${name}',[^}]+?desc: )'([^']+)'`, 's');
        content = content.replace(regex, `$1'${newDesc}'`);
        
        fs.writeFileSync(filePath, content);
        
        // 重新生成和部署
        exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
            if (error) return res.status(500).json({ error: '生成失败' });
            
            exec('git add -A && git commit -m "Update skill from web" && git push origin main', 
                { cwd: CONFIG.profileDir },
                (err) => {
                    if (err) console.error('推送失败:', err);
                }
            );
            
            res.json({ success: true });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 删除技能
app.delete('/api/skill', verifyPassword, (req, res) => {
    try {
        const { name } = req.body;
        
        // 从 generate-profile.js 中删除技能
        const filePath = CONFIG.profileDir + '/generate-profile.js';
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // 使用正则删除技能对象
        const regex = new RegExp(`\\s*\\{[^}]*name: '${name}'[^}]*\\},?`, 's');
        content = content.replace(regex, '');
        
        fs.writeFileSync(filePath, content);
        
        // 重新生成和部署
        exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
            if (error) return res.status(500).json({ error: '生成失败' });
            
            exec('git add -A && git commit -m "Delete skill from web" && git push origin main', 
                { cwd: CONFIG.profileDir },
                (err) => {
                    if (err) console.error('推送失败:', err);
                }
            );
            
            res.json({ success: true });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log('Memory edit/delete API is ready');
});
