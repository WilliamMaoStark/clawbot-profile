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

// 批量同步接口
app.post('/api/sync', verifyPassword, (req, res) => {
    try {
        const { changes } = req.body;
        
        if (!changes || changes.length === 0) {
            return res.json({ success: true, message: '没有需要同步的更改' });
        }
        
        console.log('收到 ' + changes.length + ' 个更改请求');
        
        // 按类型分组处理
        const memoryChanges = changes.filter(c => c.type === 'memory');
        const skillChanges = changes.filter(c => c.type === 'skill');
        
        let hasError = false;
        
        // 处理记忆项修改
        if (memoryChanges.length > 0) {
            const memoryPath = CONFIG.workspace + '/MEMORY.md';
            let memoryContent = fs.readFileSync(memoryPath, 'utf-8');
            const memoryLines = memoryContent.split('\n');
            
            // 按行号降序排序，避免删除后行号变化
            memoryChanges.sort((a, b) => b.lineIndex - a.lineIndex);
            
            for (const change of memoryChanges) {
                if (change.action === 'delete') {
                    // 删除行
                    if (change.lineIndex >= 0 && change.lineIndex < memoryLines.length) {
                        memoryLines.splice(change.lineIndex, 1);
                        console.log('删除记忆行 ' + change.lineIndex);
                    }
                } else if (change.action === 'edit') {
                    // 编辑行
                    if (change.lineIndex >= 0 && change.lineIndex < memoryLines.length) {
                        // 保留原有的前缀标记
                        const oldLine = memoryLines[change.lineIndex];
                        const prefixMatch = oldLine.match(/^(\s*-\s*\[P\d\](?:\[.*?\])?\s*)/);
                        const prefix = prefixMatch ? prefixMatch[1] : '- ';
                        memoryLines[change.lineIndex] = prefix + change.newContent;
                        console.log('编辑记忆行 ' + change.lineIndex);
                    }
                }
            }
            
            fs.writeFileSync(memoryPath, memoryLines.join('\n'));
        }
        
        // 处理技能修改
        if (skillChanges.length > 0) {
            const skillsPath = CONFIG.profileDir + '/generate-profile.js';
            let skillsContent = fs.readFileSync(skillsPath, 'utf-8');
            
            for (const change of skillChanges) {
                if (change.action === 'edit' && change.name && change.newDesc) {
                    // 使用正则替换技能描述
                    const regex = new RegExp(`(name: '${change.name}',[^}]+?desc: )'([^']+)'`, 's');
                    skillsContent = skillsContent.replace(regex, `$1'${change.newDesc}'`);
                    console.log('编辑技能: ' + change.name);
                } else if (change.action === 'delete' && change.name) {
                    // 删除技能对象
                    const regex = new RegExp(`\\s*\\{[^}]*name: '${change.name}'[^}]*\\},?`, 's');
                    skillsContent = skillsContent.replace(regex, '');
                    console.log('删除技能: ' + change.name);
                }
            }
            
            fs.writeFileSync(skillsPath, skillsContent);
        }
        
        // 重新生成 HTML
        exec('node generate-profile.js', { cwd: CONFIG.profileDir }, (error) => {
            if (error) {
                console.error('生成失败:', error);
                return res.status(500).json({ error: '生成HTML失败' });
            }
            
            console.log('HTML生成成功');
            
            // 一次性提交所有更改到GitHub
            const commitMessage = `Batch sync: ${changes.length} changes\n\n${changes.map(c => 
                c.type === 'memory' 
                    ? `- ${c.action} memory: ${c.originalContent?.substring(0, 30) || 'item'}...`
                    : `- ${c.action} skill: ${c.name}`
            ).join('\n')}`;
            
            exec(`git add -A && git commit -m "${commitMessage.replace(/"/g, '\\"')}" && git push origin main`, 
                { cwd: CONFIG.profileDir },
                (err, stdout, stderr) => {
                    if (err) {
                        console.error('Git推送失败:', err);
                        // 即使推送失败，本地修改已保存
                        return res.json({ 
                            success: true, 
                            warning: '本地已保存，但推送到GitHub失败',
                            changes: changes.length
                        });
                    }
                    
                    console.log('GitHub推送成功');
                    res.json({ 
                        success: true, 
                        message: `成功同步 ${changes.length} 个更改`,
                        changes: changes.length,
                        github: true
                    });
                }
            );
        });
        
    } catch (e) {
        console.error('同步失败:', e);
        res.status(500).json({ error: e.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log('Batch sync API is ready');
});
