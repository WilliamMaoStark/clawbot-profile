#!/usr/bin/env node
/**
 * ClawBot Profile Generator v3
 * 优化版：信息架构重构 + 搜索功能 + 分类展示
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    workspace: process.env.HOME + '/.openclaw/workspace',
    output: process.env.HOME + '/.openclaw/workspace/projects/clawbot-profile/index.html',
    memoryDir: process.env.HOME + '/.openclaw/workspace/memory'
};

// 更低饱和度的配色
const COLORS = {
    bg: '#0a0d12',
    bgSecondary: '#0f1419',
    bgTertiary: '#151b22',
    glassBg: 'rgba(21, 27, 34, 0.6)',
    glassBorder: 'rgba(130, 150, 170, 0.06)',
    accentCyan: '#5a9a8e',
    accentBlue: '#6a8a9a',
    accentSlate: '#8a9aa8',
    p0: '#b07070',
    p1: '#b0a070',
    p2: '#70a080',
    textPrimary: '#d8e0e8',
    textSecondary: '#8a9aa8',
    textTertiary: '#5a6a78'
};

// SVG 图标
const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    skills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 6.34L2.1 2.1m18.8 18.8l-4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 17.66l-4.24 4.24"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 9 12 15 18 9"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
};

// 技能数据 - 增加分类和频率
const SKILLS_DATA = [
    // 核心技能 - 每日使用
    { name: 'md-to-feishu', category: '飞书工具', desc: 'Markdown一键同步到飞书云文档', icon: 'link', tags: ['免费', '核心'], frequency: 'daily', docUrl: '/skills/md-to-feishu/SKILL.md' },
    { name: 'feishu-doc-optimizer', category: '飞书工具', desc: '飞书文档优化写入工具', icon: 'document', tags: ['免费', '核心'], frequency: 'daily', docUrl: '/skills/feishu-doc-optimizer/' },
    { name: 'parallel', category: '研究分析', desc: '高精度网络搜索、深度研究', icon: 'search', tags: ['已配置', '核心'], frequency: 'daily', docUrl: '/skills/parallel/' },
    
    // 常用技能 - 每周使用
    { name: 'pdf-generator', category: '文档处理', desc: 'Markdown或HTML转PDF', icon: 'document', tags: ['免费', '常用'], frequency: 'weekly', docUrl: '/skills/pdf-generator/' },
    { name: 'diagram-generator', category: '文档处理', desc: 'Mermaid/PlantUML生成技术图表', icon: 'chart', tags: ['免费', '常用'], frequency: 'weekly', docUrl: '/skills/diagram-generator/' },
    { name: 'project-scaffolder', category: '代码开发', desc: '项目脚手架工具', icon: 'code', tags: ['免费', '常用'], frequency: 'weekly', docUrl: '/skills/project-scaffolder/' },
    { name: 'feishu-doc-advanced', category: '飞书工具', desc: '本地图片上传到飞书云空间', icon: 'link', tags: ['免费', '高级'], frequency: 'weekly', docUrl: '/skills/feishu-doc-advanced/' },
    
    // 备用技能 - 按需使用
    { name: 'markdown-slides', category: '文档处理', desc: 'Markdown转HTML幻灯片', icon: 'document', tags: ['免费'], frequency: 'rare', docUrl: '/skills/markdown-slides/' },
    { name: 'basecamp', category: '项目管理', desc: 'Basecamp API集成', icon: 'folder', tags: ['API Key'], frequency: 'rare', docUrl: '/skills/basecamp/' },
    { name: 'data-cog', category: '研究分析', desc: '数据分析、CSV处理、可视化', icon: 'database', tags: ['CellCog'], frequency: 'rare', docUrl: '/skills/data-cog/' },
    { name: 'fin-cog', category: '研究分析', desc: '金融分析、股票研究', icon: 'chart', tags: ['CellCog'], frequency: 'rare', docUrl: '/skills/fin-cog/' },
    { name: 'proto-cog', category: '产品设计', desc: '产品原型设计（UI/UX）', icon: 'settings', tags: ['CellCog'], frequency: 'rare', docUrl: '/skills/proto-cog/' },
    { name: 'technical-seo-checker', category: '研究分析', desc: '技术SEO审计', icon: 'search', tags: ['免费'], frequency: 'rare', docUrl: '/skills/technical-seo-checker/' },
    { name: 'search-x', category: '研究分析', desc: 'X/Twitter实时搜索', icon: 'globe', tags: ['待配置'], frequency: 'rare', docUrl: '/skills/search-x/' },
    { name: 'xai', category: '研究分析', desc: 'Grok模型对话', icon: 'cpu', tags: ['待配置'], frequency: 'rare', docUrl: '/skills/xai/' },
    { name: 'ai-notes-ofvideo', category: '研究分析', desc: '视频转AI笔记', icon: 'video', tags: ['待配置'], frequency: 'rare', docUrl: '/skills/ai-notes-ofvideo/' },
    { name: 'low-power-panoramic-stitching', category: '图像处理', desc: '低功耗全景图像拼接', icon: 'layers', tags: ['免费'], frequency: 'rare', docUrl: '/skills/low-power-panoramic-stitching/' }
];

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        return '';
    }
}

// 解析记忆，增加分类和行索引
function parseMemory(content) {
    const memories = {
        P0: [],
        P1: [],
        P2: []
    };
    
    const lines = content.split('\n');
    let currentCategory = '其他';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cleanLine = line.replace(/\*\*/g, '').replace(/`/g, '').trim();
        
        // 检测分类标题
        if (line.startsWith('## ')) {
            const catMatch = line.match(/##\s*(.+)/);
            if (catMatch) {
                currentCategory = catMatch[1].replace(/\[.*?\]/g, '').trim();
            }
        }
        
        const p0Match = cleanLine.match(/-\s*\[P0\]\s*(.+)/);
        const p1Match = cleanLine.match(/-\s*\[P1\]\[(\d{4}-\d{2}-\d{2})\]\s*(.+)/);
        const p2Match = cleanLine.match(/-\s*\[P2\]\[(\d{4}-\d{2}-\d{2})\]\s*(.+)/);
        
        if (p0Match) {
            memories.P0.push({
                content: cleanMarkdown(p0Match[1].trim()),
                category: currentCategory,
                date: '永久',
                tags: extractTags(p0Match[1]),
                lineIndex: i
            });
        } else if (p1Match) {
            memories.P1.push({
                content: cleanMarkdown(p1Match[2].trim()),
                category: currentCategory,
                date: p1Match[1],
                tags: extractTags(p1Match[2]),
                lineIndex: i
            });
        } else if (p2Match) {
            memories.P2.push({
                content: cleanMarkdown(p2Match[2].trim()),
                category: currentCategory,
                date: p2Match[1],
                tags: extractTags(p2Match[2]),
                lineIndex: i
            });
        }
    }
    
    return memories;
}

function cleanMarkdown(text) {
    return text
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .replace(/\[|\]/g, '')
        .replace(/\n/g, ' ')
        .trim();
}

function extractTags(text) {
    const tags = [];
    if (text.includes('成本')) tags.push('硬件');
    if (text.includes('研究') || text.includes('调研')) tags.push('研究');
    if (text.includes('任务') || text.includes('自动')) tags.push('自动化');
    if (text.includes('GitHub') || text.includes('部署')) tags.push('DevOps');
    return tags;
}

function parseAPIs() {
    return [
        { name: 'Parallel API', env: 'PARALLEL_API_KEY', status: 'active', note: '深度研究、学术调研', icon: 'search' },
        { name: 'xAI API', env: 'XAI_API_KEY', status: 'pending', note: 'X搜索、Grok对话', icon: 'cpu' },
        { name: 'Brave Search', env: 'BRAVE_API_KEY', status: 'pending', note: '网络搜索', icon: 'search' },
        { name: 'Baidu API', env: 'BAIDU_API_KEY', status: 'pending', note: '视频转AI笔记', icon: 'video' },
        { name: 'CellCog API', env: 'CellCog API', status: 'pending', note: 'data-cog、fin-cog、proto-cog', icon: 'database' },
        { name: 'Maton API', env: 'MATON_API_KEY', status: 'pending', note: 'Basecamp项目管理', icon: 'folder' }
    ];
}

// 生成按分类分组的记忆HTML
function generateMemoryByCategory(memories, level) {
    const items = memories[level] || [];
    const grouped = {};
    
    // 按分类分组
    items.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });
    
    const colorClass = `badge-${level.toLowerCase()}`;
    
    return Object.entries(grouped).map(([category, items]) => `
        <div class="category-group">
            <div class="category-header" onclick="toggleCategory(this)">
                <span class="category-icon">${ICONS.folder}</span>
                <span class="category-name">${category}</span>
                <span class="category-count">${items.length}</span>
                <span class="category-toggle">${ICONS.chevronDown}</span>
            </div>
            <div class="category-content">
                ${items.map((item, idx) => `
                    <div class="memory-item-compact" data-id="${level}-${idx}" data-line-index="${item.lineIndex || idx}">
                        <div class="memory-badges">
                            <span class="priority-badge ${colorClass}">${level}</span>
                            ${item.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                            <div class="item-actions">
                                <button class="action-btn edit-btn" onclick="editMemory('${level}', ${idx}, '${item.content.replace(/'/g, "\\'")}', ${item.lineIndex || idx})" title="编辑">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="action-btn delete-btn" onclick="deleteItem('${level}', ${idx}, '${item.content.replace(/'/g, "\\'")}', ${item.lineIndex || idx})" title="删除">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div class="memory-text">${item.content}</div>
                        <div class="memory-meta">${item.date}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 生成技能卡片（优化版）
function generateSkillCards() {
    // 按频率分组
    const groups = {
        daily: SKILLS_DATA.filter(s => s.frequency === 'daily'),
        weekly: SKILLS_DATA.filter(s => s.frequency === 'weekly'),
        rare: SKILLS_DATA.filter(s => s.frequency === 'rare')
    };
    
    const frequencyLabels = {
        daily: { label: '核心技能', desc: '每日使用', color: '#5a9a8e' },
        weekly: { label: '常用技能', desc: '每周使用', color: '#6a8a9a' },
        rare: { label: '备用技能', desc: '按需使用', color: '#8a9aa8' }
    };
    
    return Object.entries(groups).map(([freq, skills]) => `
        <div class="skill-group">
            <div class="skill-group-header">
                <div class="skill-group-title" style="color: ${frequencyLabels[freq].color}">
                    ${frequencyLabels[freq].label}
                </div>
                <div class="skill-group-desc">${frequencyLabels[freq].desc} · ${skills.length}个</div>
            </div>
            <div class="skills-grid">
                ${skills.map((skill, index) => `
                    <div class="skill-card" onclick="toggleSkillDetail(this)" data-skill="${skill.name}">
                        <div class="skill-header">
                            <div class="skill-icon">${ICONS[skill.icon]}</div>
                            <div class="skill-info">
                                <div class="skill-name">${skill.name}</div>
                                <div class="skill-category">${skill.category}</div>
                            </div>
                            <div class="item-actions" onclick="event.stopPropagation()">
                                <button class="action-btn edit-btn" onclick="editSkill('${skill.name}', '${skill.desc.replace(/'/g, "\\'")}')" title="编辑">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="action-btn delete-btn" onclick="deleteSkill('${skill.name}')" title="删除">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                            <div class="skill-expand">${ICONS.chevronDown}</div>
                        </div>
                        <div class="skill-desc">${skill.desc}</div>
                        <div class="skill-tags">
                            ${skill.tags.map(tag => `<span class="skill-tag tag-${tag === '已配置' ? 'active' : tag === '待配置' ? 'pending' : 'normal'}">${tag}</span>`).join('')}
                        </div>
                        <div class="skill-detail">
                            <div class="skill-detail-content">
                                <div class="detail-row">
                                    <span class="detail-label">文档路径:</span>
                                    <code class="detail-code">${skill.docUrl}</code>
                                </div>
                                <div class="detail-actions">
                                    <button class="detail-btn" onclick="event.stopPropagation(); copyToClipboard('${skill.docUrl}')">
                                        ${ICONS.link} 复制路径
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function generateAPIList() {
    const apis = parseAPIs();
    const activeCount = apis.filter(a => a.status === 'active').length;
    
    return `
        <div class="api-stats">
            <div class="api-stat-item">
                <div class="api-stat-value" style="color: ${COLORS.p2}">${activeCount}</div>
                <div class="api-stat-label">已配置</div>
            </div>
            <div class="api-stat-item">
                <div class="api-stat-value" style="color: ${COLORS.p1}">${apis.length - activeCount}</div>
                <div class="api-stat-label">待配置</div>
            </div>
            <div class="api-stat-item">
                <div class="api-stat-value">${apis.length}</div>
                <div class="api-stat-label">总计</div>
            </div>
        </div>
        <div class="api-list">
            ${apis.map(api => `
                <div class="api-item">
                    <div class="api-icon">${ICONS[api.icon]}</div>
                    <div class="api-status ${api.status}"></div>
                    <div class="api-info">
                        <div class="api-name">${api.name}</div>
                        <div class="api-desc">${api.note}</div>
                        <div class="api-env">
                            <code>${api.env}</code>
                            <button class="copy-btn" onclick="copyToClipboard('export ${api.env}=your_key_here')">
                                ${ICONS.link}
                            </button>
                        </div>
                    </div>
                    <div class="api-badge ${api.status}">${api.status === 'active' ? '已配置' : '待配置'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateCSS() {
    return `
        :root {
            --bg-primary: ${COLORS.bg};
            --bg-secondary: ${COLORS.bgSecondary};
            --bg-tertiary: ${COLORS.bgTertiary};
            --glass-bg: ${COLORS.glassBg};
            --glass-border: ${COLORS.glassBorder};
            --accent-cyan: ${COLORS.accentCyan};
            --accent-blue: ${COLORS.accentBlue};
            --accent-slate: ${COLORS.accentSlate};
            --p0-color: ${COLORS.p0};
            --p1-color: ${COLORS.p1};
            --p2-color: ${COLORS.p2};
            --text-primary: ${COLORS.textPrimary};
            --text-secondary: ${COLORS.textSecondary};
            --text-tertiary: ${COLORS.textTertiary};
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
            --space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 0.75rem;
            --space-lg: 1rem; --space-xl: 1.5rem; --space-2xl: 2rem;
            --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        
        body {
            font-family: var(--font-sans);
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            overflow-x: hidden;
            line-height: 1.5;
            font-size: 14px;
        }

        /* Background effects */
        .bg-glow {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 0;
            background: 
                radial-gradient(ellipse 50% 30% at 20% 20%, rgba(90, 154, 142, 0.04) 0%, transparent 60%),
                radial-gradient(ellipse 40% 25% at 80% 70%, rgba(106, 138, 154, 0.03) 0%, transparent 50%);
        }

        .bg-grid {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 0;
            background-image: 
                linear-gradient(rgba(130, 150, 170, 0.015) 1px, transparent 1px),
                linear-gradient(90deg, rgba(130, 150, 170, 0.015) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .update-banner {
            position: fixed; top: 0; left: 0; right: 0;
            background: rgba(15, 20, 25, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--glass-border);
            padding: 0.4rem 1rem;
            text-align: center;
            font-size: 0.7rem;
            color: var(--text-tertiary);
            z-index: 200;
            font-family: var(--font-mono);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .app-container {
            display: flex; min-height: 100vh;
            position: relative; z-index: 1;
            padding-top: 32px;
        }

        /* Sidebar */
        .sidebar {
            width: 240px;
            background: var(--glass-bg);
            backdrop-filter: blur(24px);
            border-right: 1px solid var(--glass-border);
            position: fixed; height: 100vh;
            display: flex; flex-direction: column;
            z-index: 100;
        }

        .sidebar-header {
            padding: 1.25rem;
            border-bottom: 1px solid var(--glass-border);
        }

        .logo {
            display: flex; align-items: center; gap: 0.6rem;
        }

        .logo-icon {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, rgba(90, 154, 142, 0.25), rgba(106, 138, 154, 0.15));
            border-radius: var(--radius-md);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(90, 154, 142, 0.15);
        }

        .logo-icon svg { width: 18px; height: 18px; color: var(--accent-cyan); }
        .logo-text { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }

        .nav-menu { flex: 1; padding: 0.75rem; overflow-y: auto; }
        .nav-section { margin-bottom: 1.25rem; }
        .nav-section-title {
            font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; color: var(--text-tertiary);
            margin-bottom: 0.4rem; padding-left: 0.6rem;
        }

        .nav-item {
            display: flex; align-items: center; gap: 0.6rem;
            padding: 0.5rem 0.6rem;
            border-radius: var(--radius-md);
            cursor: pointer; transition: all 0.15s ease;
            color: var(--text-secondary);
            margin-bottom: 1px;
            font-size: 0.85rem;
            position: relative;
        }

        .nav-item:hover { background: rgba(130, 150, 170, 0.06); color: var(--text-primary); }
        .nav-item.active { background: rgba(90, 154, 142, 0.1); color: var(--accent-cyan); }
        .nav-icon { width: 16px; height: 16px; opacity: 0.7; flex-shrink: 0; }
        .nav-icon svg { width: 100%; height: 100%; }
        .nav-item.active .nav-icon { opacity: 1; color: var(--accent-cyan); }
        .nav-badge {
            margin-left: auto;
            background: rgba(130, 150, 170, 0.12);
            padding: 1px 6px;
            border-radius: 9999px;
            font-size: 0.6rem;
            color: var(--text-tertiary);
        }

        .sidebar-footer {
            padding: 0.75rem;
            border-top: 1px solid var(--glass-border);
        }

        .status-indicator {
            display: flex; align-items: center; gap: 0.4rem;
            font-size: 0.75rem; color: var(--text-tertiary);
        }

        .status-dot {
            width: 6px; height: 6px;
            background: var(--p2-color);
            border-radius: 9999px;
            box-shadow: 0 0 6px var(--p2-color);
        }

        /* Main content */
        .main-content {
            flex: 1; margin-left: 240px;
            padding: 1.5rem;
            max-width: calc(100% - 240px);
        }

        /* Search bar */
        .search-container {
            position: sticky;
            top: 40px;
            z-index: 50;
            margin-bottom: 1.5rem;
        }

        .search-box {
            width: 100%;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .search-box svg {
            width: 18px; height: 18px;
            color: var(--text-tertiary);
            flex-shrink: 0;
        }

        .search-input {
            flex: 1;
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 0.9rem;
            outline: none;
        }

        .search-input::placeholder {
            color: var(--text-tertiary);
        }

        .search-stats {
            font-size: 0.75rem;
            color: var(--text-tertiary);
            font-family: var(--font-mono);
        }

        /* Page */
        .page { display: none; animation: fadeIn 0.25s ease; }
        .page.active { display: block; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .page-header { margin-bottom: 1.5rem; }
        .page-title { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.2rem; color: var(--text-primary); letter-spacing: -0.01em; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; }

        /* Cards */
        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: 1.25rem;
            margin-bottom: 0.75rem;
        }

        /* Category groups */
        .category-group { margin-bottom: 0.75rem; }
        .category-header {
            display: flex; align-items: center; gap: 0.5rem;
            padding: 0.6rem 0.75rem;
            background: rgba(130, 150, 170, 0.04);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.15s;
            border: 1px solid transparent;
        }

        .category-header:hover {
            background: rgba(130, 150, 170, 0.08);
            border-color: var(--glass-border);
        }

        .category-header.collapsed .category-toggle {
            transform: rotate(-90deg);
        }

        .category-icon { width: 16px; height: 16px; color: var(--text-tertiary); }
        .category-icon svg { width: 100%; height: 100%; }
        .category-name { flex: 1; font-weight: 500; font-size: 0.85rem; color: var(--text-primary); }
        .category-count { 
            font-size: 0.65rem; 
            color: var(--text-tertiary);
            background: rgba(130, 150, 170, 0.1);
            padding: 1px 6px;
            border-radius: 9999px;
        }
        .category-toggle { 
            width: 14px; height: 14px; 
            color: var(--text-tertiary);
            transition: transform 0.2s;
        }
        .category-toggle svg { width: 100%; height: 100%; }

        .category-content {
            padding: 0.5rem 0 0.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .category-header.collapsed + .category-content {
            display: none;
        }

        /* Memory items */
        .memory-item-compact {
            background: rgba(130, 150, 170, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.6rem 0.75rem;
        }

        .memory-badges {
            display: flex;
            gap: 0.4rem;
            margin-bottom: 0.4rem;
            flex-wrap: wrap;
        }

        .priority-badge {
            display: inline-flex; align-items: center;
            padding: 1px 6px;
            border-radius: 9999px;
            font-size: 0.6rem; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.05em;
        }

        .badge-p0 { background: rgba(176, 112, 112, 0.12); color: var(--p0-color); }
        .badge-p1 { background: rgba(176, 160, 112, 0.12); color: var(--p1-color); }
        .badge-p2 { background: rgba(112, 160, 128, 0.12); color: var(--p2-color); }

        .tag-small {
            font-size: 0.6rem;
            color: var(--text-tertiary);
            background: rgba(130, 150, 170, 0.1);
            padding: 1px 5px;
            border-radius: 9999px;
        }

        .memory-text {
            color: var(--text-secondary);
            font-size: 0.85rem;
            line-height: 1.5;
        }

        .memory-meta {
            font-size: 0.7rem;
            color: var(--text-tertiary);
            margin-top: 0.4rem;
            font-family: var(--font-mono);
        }

        /* Skills */
        .skill-group { margin-bottom: 1.5rem; }
        .skill-group-header {
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--glass-border);
        }
        .skill-group-title { font-size: 0.95rem; font-weight: 600; }
        .skill-group-desc { font-size: 0.75rem; color: var(--text-tertiary); }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 0.75rem;
        }

        .skill-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.875rem;
            cursor: pointer;
            transition: all 0.15s;
        }

        .skill-card:hover {
            border-color: rgba(90, 154, 142, 0.2);
        }

        .skill-card.expanded {
            border-color: rgba(90, 154, 142, 0.25);
        }

        .skill-header {
            display: flex; align-items: center; gap: 0.6rem;
            margin-bottom: 0.4rem;
        }

        .skill-icon {
            width: 28px; height: 28px;
            background: rgba(90, 154, 142, 0.1);
            border-radius: var(--radius-sm);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }

        .skill-icon svg { width: 15px; height: 15px; color: var(--accent-cyan); }
        .skill-info { flex: 1; }
        .skill-name { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
        .skill-category { font-size: 0.65rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.03em; }
        .skill-expand { width: 14px; height: 14px; color: var(--text-tertiary); transition: transform 0.2s; }
        .skill-expand svg { width: 100%; height: 100%; }
        .skill-card.expanded .skill-expand { transform: rotate(180deg); }

        .skill-desc { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4; margin-bottom: 0.5rem; }

        .skill-tags {
            display: flex; gap: 0.35rem; flex-wrap: wrap;
        }

        .skill-tag {
            font-size: 0.65rem;
            padding: 1px 6px;
            border-radius: 9999px;
        }

        .skill-tag.tag-normal { color: var(--text-tertiary); background: rgba(130, 150, 170, 0.1); }
        .skill-tag.tag-active { color: var(--p2-color); background: rgba(112, 160, 128, 0.12); }
        .skill-tag.tag-pending { color: var(--p1-color); background: rgba(176, 160, 112, 0.12); }

        .skill-detail {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease;
        }

        .skill-card.expanded .skill-detail {
            max-height: 200px;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--glass-border);
        }

        .skill-detail-content { font-size: 0.8rem; }
        .detail-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; }
        .detail-label { color: var(--text-tertiary); flex-shrink: 0; }
        .detail-code { 
            background: rgba(130, 150, 170, 0.08);
            padding: 2px 6px;
            border-radius: var(--radius-sm);
            font-family: var(--font-mono);
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .detail-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
        .detail-btn {
            display: flex; align-items: center; gap: 0.35rem;
            background: rgba(90, 154, 142, 0.1);
            border: 1px solid rgba(90, 154, 142, 0.2);
            color: var(--accent-cyan);
            padding: 0.35rem 0.6rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        .detail-btn:hover { background: rgba(90, 154, 142, 0.15); }
        .detail-btn svg { width: 12px; height: 12px; }

        /* API section */
        .api-stats {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--glass-border);
        }

        .api-stat-item { text-align: center; }
        .api-stat-value { font-size: 1.5rem; font-weight: 600; }
        .api-stat-label { font-size: 0.7rem; color: var(--text-tertiary); }

        .api-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .api-item {
            display: flex; align-items: center; gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(130, 150, 170, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
        }

        .api-icon { width: 28px; height: 28px; background: rgba(90, 154, 142, 0.08); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .api-icon svg { width: 15px; height: 15px; color: var(--accent-cyan); }
        .api-status { width: 6px; height: 6px; border-radius: 9999px; flex-shrink: 0; }
        .api-status.active { background: var(--p2-color); box-shadow: 0 0 6px var(--p2-color); }
        .api-status.pending { background: var(--p1-color); box-shadow: 0 0 6px var(--p1-color); }
        .api-info { flex: 1; }
        .api-name { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
        .api-desc { font-size: 0.75rem; color: var(--text-secondary); margin-top: 1px; }
        .api-env { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem; }
        .api-env code { 
            background: rgba(130, 150, 170, 0.08);
            padding: 1px 5px;
            border-radius: var(--radius-sm);
            font-family: var(--font-mono);
            font-size: 0.7rem;
            color: var(--text-secondary);
        }
        .copy-btn {
            background: transparent;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            padding: 2px;
            display: flex;
            align-items: center;
        }
        .copy-btn:hover { color: var(--accent-cyan); }
        .copy-btn svg { width: 12px; height: 12px; }

        .api-badge {
            font-size: 0.65rem;
            padding: 2px 8px;
            border-radius: 9999px;
            font-weight: 500;
        }
        .api-badge.active { background: rgba(112, 160, 128, 0.12); color: var(--p2-color); }
        .api-badge.pending { background: rgba(176, 160, 112, 0.12); color: var(--p1-color); }

        /* Overview stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
        }

        .stat-card {
            text-align: center;
            padding: 1rem;
        }

        .stat-value { font-size: 2rem; font-weight: 600; color: var(--accent-cyan); }
        .stat-label { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; }

        /* Toast */
        .toast {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.75rem 1rem;
            color: var(--text-primary);
            font-size: 0.85rem;
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        /* Sync button */
        .sync-btn {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(90, 154, 142, 0.2);
            border: 1px solid rgba(90, 154, 142, 0.4);
            color: var(--accent-cyan);
            padding: 0.3rem 0.6rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.15s;
        }

        .sync-btn:hover:not(:disabled) {
            background: rgba(90, 154, 142, 0.3);
        }

        .sync-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .sync-btn.syncing {
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        /* Pending indicator on items */
        .memory-item-compact.pending,
        .skill-card.pending {
            border-left: 2px solid var(--accent-cyan);
        }

        .pending-badge {
            font-size: 0.6rem;
            color: var(--accent-cyan);
            background: rgba(90, 154, 142, 0.15);
            padding: 1px 5px;
            border-radius: 9999px;
            margin-left: 0.5rem;
        }

        /* Item actions (edit/delete buttons) */
        .item-actions {
            display: flex;
            gap: 0.25rem;
            margin-left: auto;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .memory-item-compact:hover .item-actions,
        .skill-card:hover .item-actions {
            opacity: 1;
        }

        .action-btn {
            width: 22px;
            height: 22px;
            background: transparent;
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-sm);
            color: var(--text-tertiary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            padding: 0;
        }

        .action-btn:hover {
            background: rgba(130, 150, 170, 0.1);
        }

        .action-btn svg {
            width: 12px;
            height: 12px;
        }

        .action-btn.edit-btn:hover {
            border-color: var(--accent-cyan);
            color: var(--accent-cyan);
        }

        .action-btn.delete-btn:hover {
            border-color: var(--p0-color);
            color: var(--p0-color);
        }

        /* Password Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 2000;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .modal-overlay.show {
            display: flex;
        }

        .modal {
            background: var(--bg-secondary);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            width: 90%;
            max-width: 360px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        .modal-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .modal-input {
            width: 100%;
            background: var(--bg-tertiary);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.6rem 0.75rem;
            color: var(--text-primary);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            outline: none;
            font-family: var(--font-mono);
        }

        .modal-input:focus {
            border-color: var(--accent-cyan);
        }

        .modal-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }

        .modal-btn {
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
            border: 1px solid transparent;
        }

        .modal-btn.cancel {
            background: transparent;
            color: var(--text-secondary);
            border-color: var(--glass-border);
        }

        .modal-btn.cancel:hover {
            background: rgba(130, 150, 170, 0.1);
        }

        .modal-btn.confirm {
            background: rgba(176, 112, 112, 0.15);
            color: var(--p0-color);
            border-color: rgba(176, 112, 112, 0.3);
        }

        .modal-btn.confirm:hover {
            background: rgba(176, 112, 112, 0.25);
        }

        .modal-error {
            color: var(--p0-color);
            font-size: 0.75rem;
            margin-top: -0.5rem;
            margin-bottom: 0.75rem;
            display: none;
        }

        .modal-error.show {
            display: block;
        }

        /* Edit modal textarea */
        .modal-textarea {
            width: 100%;
            min-height: 100px;
            background: var(--bg-tertiary);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.6rem 0.75rem;
            color: var(--text-primary);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            outline: none;
            resize: vertical;
            font-family: inherit;
        }

        .modal-textarea:focus {
            border-color: var(--accent-cyan);
        }

        /* Mobile menu */
        .mobile-menu-btn {
            display: none; position: fixed; top: 40px; left: 0.75rem;
            z-index: 101; background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: 0.5rem; cursor: pointer;
            color: var(--text-primary);
        }

        @media (max-width: 1024px) {
            .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
            .sidebar.open { transform: translateX(0); }
            .main-content { margin-left: 0; max-width: 100%; padding: 60px 1rem 1rem; }
            .mobile-menu-btn { display: block; }
            .skills-grid { grid-template-columns: 1fr; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-secondary); }
        ::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }

        /* Hidden class for search */
        .hidden { display: none !important; }
        .highlight { background: rgba(90, 154, 142, 0.15); border-radius: 2px; }

        /* Dashboard Styles */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .dashboard-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: 1.25rem;
        }

        .dashboard-card-header {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--glass-border);
        }

        .dashboard-card-icon {
            width: 32px;
            height: 32px;
            background: rgba(90, 154, 142, 0.1);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dashboard-card-icon svg {
            width: 16px;
            height: 16px;
            color: var(--accent-cyan);
        }

        .dashboard-card-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .dashboard-metric {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .dashboard-metric-value {
            font-size: 2rem;
            font-weight: 600;
            color: var(--accent-cyan);
        }

        .dashboard-metric-label {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .dashboard-metric-change {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: var(--radius-sm);
            margin-left: auto;
        }

        .dashboard-metric-change.positive {
            background: rgba(112, 160, 128, 0.15);
            color: var(--p2-color);
        }

        .dashboard-metric-change.negative {
            background: rgba(176, 112, 112, 0.15);
            color: var(--p0-color);
        }

        .dashboard-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .dashboard-list-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.6rem 0.75rem;
            background: rgba(130, 150, 170, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            font-size: 0.85rem;
        }

        .dashboard-list-item-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .dashboard-list-item-icon.online {
            background: var(--p2-color);
            box-shadow: 0 0 6px var(--p2-color);
        }

        .dashboard-list-item-icon.offline {
            background: var(--p0-color);
        }

        .dashboard-list-item-icon.pending {
            background: var(--p1-color);
        }

        .dashboard-list-item-content {
            flex: 1;
        }

        .dashboard-list-item-title {
            color: var(--text-primary);
            font-weight: 500;
        }

        .dashboard-list-item-meta {
            color: var(--text-tertiary);
            font-size: 0.75rem;
        }

        .dashboard-chart-bar {
            height: 6px;
            background: rgba(130, 150, 170, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .dashboard-chart-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
            border-radius: 3px;
            transition: width 0.3s ease;
        }

        .dashboard-activity {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .dashboard-activity-item {
            display: flex;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(130, 150, 170, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
        }

        .dashboard-activity-icon {
            width: 28px;
            height: 28px;
            background: rgba(90, 154, 142, 0.1);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .dashboard-activity-icon svg {
            width: 14px;
            height: 14px;
            color: var(--accent-cyan);
        }

        .dashboard-activity-content {
            flex: 1;
        }

        .dashboard-activity-title {
            font-size: 0.85rem;
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .dashboard-activity-time {
            font-size: 0.7rem;
            color: var(--text-tertiary);
            font-family: var(--font-mono);
        }

        .dashboard-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .dashboard-status-badge.online {
            background: rgba(112, 160, 128, 0.15);
            color: var(--p2-color);
        }

        .dashboard-status-badge.offline {
            background: rgba(176, 112, 112, 0.15);
            color: var(--p0-color);
        }

        .dashboard-status-badge.maintenance {
            background: rgba(176, 160, 112, 0.15);
            color: var(--p1-color);
        }

        .dashboard-status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
        }

        .dashboard-status-badge.online .dashboard-status-dot {
            background: var(--p2-color);
            box-shadow: 0 0 4px var(--p2-color);
        }

        .dashboard-status-badge.offline .dashboard-status-dot {
            background: var(--p0-color);
        }

        .dashboard-status-badge.maintenance .dashboard-status-dot {
            background: var(--p1-color);
        }
    `;
}

function generateNavItem(id, icon, label, badge, isActive = false) {
    const activeClass = isActive ? 'active' : '';
    const badgeHtml = badge ? `<span class="nav-badge">${badge}</span>` : '';
    return `
        <div class="nav-item ${activeClass}" onclick="showPage('${id}')" data-page="${id}">
            <span class="nav-icon">${ICONS[icon]}</span>
            <span>${label}</span>
            ${badgeHtml}
        </div>
    `;
}

function generatePages(data) {
    return `
        <!-- Dashboard -->
        <div class="page" id="page-dashboard">
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Live system monitoring &amp; activity stream</p>
            </div>
            
            <div class="dashboard-grid" style="grid-template-columns: repeat(4, 1fr);">
                <div class="dashboard-card" style="text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">Uptime</div>
                    <div style="font-size: 1.75rem; font-weight: 600; color: var(--accent-cyan);">7d 12h</div>
                    <div style="font-size: 0.7rem; color: var(--p2-color); margin-top: 0.25rem;">● Stable</div>
                </div>
                <div class="dashboard-card" style="text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">Tasks Today</div>
                    <div style="font-size: 1.75rem; font-weight: 600; color: var(--accent-cyan);">12</div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem;">8 completed</div>
                </div>
                <div class="dashboard-card" style="text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">Messages</div>
                    <div style="font-size: 1.75rem; font-weight: 600; color: var(--accent-cyan);">47</div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem;">24h period</div>
                </div>
                <div class="dashboard-card" style="text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">Success Rate</div>
                    <div style="font-size: 1.75rem; font-weight: 600; color: var(--accent-cyan);">96%</div>
                    <div style="font-size: 0.7rem; color: var(--p2-color); margin-top: 0.25rem;">↑ 2% vs yesterday</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                        <span class="dashboard-card-title">Active Tasks</span>
                        <span style="margin-left: auto; font-size: 0.7rem; color: var(--text-tertiary);">Auto-refresh</span>
                    </div>
                    <div class="dashboard-list">
                        <div class="dashboard-list-item">
                            <span class="dashboard-list-item-icon online"></span>
                            <div class="dashboard-list-item-content">
                                <div class="dashboard-list-item-title">Daily OpenClaw Cases</div>
                                <div class="dashboard-list-item-meta">Cron • Next: 09:00 CST</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color); background: rgba(112, 160, 128, 0.15); padding: 2px 6px; border-radius: 9999px;">Scheduled</span>
                        </div>
                        <div class="dashboard-list-item">
                            <span class="dashboard-list-item-icon online"></span>
                            <div class="dashboard-list-item-content">
                                <div class="dashboard-list-item-title">Profile Auto-sync</div>
                                <div class="dashboard-list-item-meta">Cron • Next: 04:00 CST</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color); background: rgba(112, 160, 128, 0.15); padding: 2px 6px; border-radius: 9999px;">Scheduled</span>
                        </div>
                        <div class="dashboard-list-item">
                            <span class="dashboard-list-item-icon online"></span>
                            <div class="dashboard-list-item-content">
                                <div class="dashboard-list-item-title">Memory Janitor</div>
                                <div class="dashboard-list-item-meta">Daemon • Last run: 04:00</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color); background: rgba(112, 160, 128, 0.15); padding: 2px 6px; border-radius: 9999px;">Active</span>
                        </div>
                        <div class="dashboard-list-item">
                            <span class="dashboard-list-item-icon pending"></span>
                            <div class="dashboard-list-item-content">
                                <div class="dashboard-list-item-title">Feishu Integration</div>
                                <div class="dashboard-list-item-meta">WebSocket • Connected</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p1-color); background: rgba(176, 160, 112, 0.15); padding: 2px 6px; border-radius: 9999px;">Standby</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                        <span class="dashboard-card-title">Performance</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span style="color: var(--text-secondary);">Response Time</span>
                            <span style="color: var(--accent-cyan);">245ms avg</span>
                        </div>
                        <div class="dashboard-chart-bar">
                            <div class="dashboard-chart-bar-fill" style="width: 35%"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span style="color: var(--text-secondary);">Token Usage</span>
                            <span style="color: var(--accent-cyan);">2.1M / 10M</span>
                        </div>
                        <div class="dashboard-chart-bar">
                            <div class="dashboard-chart-bar-fill" style="width: 21%"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span style="color: var(--text-secondary);">Memory Usage</span>
                            <span style="color: var(--accent-cyan);">127 MB</span>
                        </div>
                        <div class="dashboard-chart-bar">
                            <div class="dashboard-chart-bar-fill" style="width: 15%"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span style="color: var(--text-secondary);">API Quota</span>
                            <span style="color: var(--accent-cyan);">85%</span>
                        </div>
                        <div class="dashboard-chart-bar">
                            <div class="dashboard-chart-bar-fill" style="width: 85%"></div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card" style="grid-column: span 2;">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <span class="dashboard-card-title">Live Activity Stream</span>
                        <span style="margin-left: auto; font-size: 0.7rem; color: var(--text-tertiary);">Real-time</span>
                    </div>
                    <div class="dashboard-activity">
                        <div class="dashboard-activity-item">
                            <div class="dashboard-activity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                            <div class="dashboard-activity-content">
                                <div class="dashboard-activity-title">Daily OpenClaw cases task completed</div>
                                <div class="dashboard-activity-time">09:00 CST • 5 instances found</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color);">Success</span>
                        </div>
                        <div class="dashboard-activity-item">
                            <div class="dashboard-activity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
                            <div class="dashboard-activity-content">
                                <div class="dashboard-activity-title">Dashboard feature deployed</div>
                                <div class="dashboard-activity-time">09:57 CST • GitHub Pages</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color);">Deployed</span>
                        </div>
                        <div class="dashboard-activity-item">
                            <div class="dashboard-activity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                            <div class="dashboard-activity-content">
                                <div class="dashboard-activity-title">Feishu writer skill v3.0 completed</div>
                                <div class="dashboard-activity-time">04:05 CST • Line-by-line write fix</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--p2-color);">Completed</span>
                        </div>
                        <div class="dashboard-activity-item">
                            <div class="dashboard-activity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
                            <div class="dashboard-activity-content">
                                <div class="dashboard-activity-title">Memory auto-archived by janitor</div>
                                <div class="dashboard-activity-time">04:00 CST • 3 P2 items archived</div>
                            </div>
                            <span style="font-size: 0.65rem; color: var(--text-tertiary);">System</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card" style="grid-column: span 2;">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
                        <span class="dashboard-card-title">Skill Usage (7 Days)</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 1rem;">
                        <div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(130, 150, 170, 0.1);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(130, 150, 170, 0.1);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(130, 150, 170, 0.1);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(130, 150, 170, 0.1);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(130, 150, 170, 0.1);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: var(--accent-cyan);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.6);"></div><div style="aspect-ratio: 1; border-radius: 3px; background: rgba(90, 154, 142, 0.3);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
                        <div style="display: flex; gap: 1rem;">
                            <span style="color: var(--text-tertiary);">Less</span>
                            <div style="display: flex; gap: 2px;">
                                <div style="width: 10px; height: 10px; background: rgba(130, 150, 170, 0.1); border-radius: 2px;"></div>
                                <div style="width: 10px; height: 10px; background: rgba(90, 154, 142, 0.3); border-radius: 2px;"></div>
                                <div style="width: 10px; height: 10px; background: rgba(90, 154, 142, 0.6); border-radius: 2px;"></div>
                                <div style="width: 10px; height: 10px; background: var(--accent-cyan); border-radius: 2px;"></div>
                            </div>
                            <span style="color: var(--text-tertiary);">More</span>
                        </div>
                        <span style="color: var(--text-secondary);">147 invocations this week</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overview -->
        <div class="page active" id="page-overview">
            <div class="page-header">
                <h1 class="page-title">Overview</h1>
                <p class="page-subtitle">ClawBot Personal Profile Dashboard</p>
            </div>
            
            <div class="glass-card">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${data.memories.P0.length}</div>
                        <div class="stat-label">P0 Core Rules</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.memories.P1.length}</div>
                        <div class="stat-label">P1 Projects</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.memories.P2.length}</div>
                        <div class="stat-label">P2 Records</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${SKILLS_DATA.length}</div>
                        <div class="stat-label">Skills</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${parseAPIs().filter(a => a.status === 'active').length}/${parseAPIs().length}</div>
                        <div class="stat-label">APIs Ready</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- P0 Memory -->
        <div class="page" id="page-memory-p0">
            <div class="page-header">
                <h1 class="page-title">Core Identity (P0)</h1>
                <p class="page-subtitle">Permanent rules and identity definitions</p>
            </div>
            <div class="memory-container">
                ${generateMemoryByCategory(data.memories, 'P0')}
            </div>
        </div>

        <!-- P1 Memory -->
        <div class="page" id="page-memory-p1">
            <div class="page-header">
                <h1 class="page-title">Active Projects (P1)</h1>
                <p class="page-subtitle">90-day TTL current projects</p>
            </div>
            <div class="memory-container">
                ${generateMemoryByCategory(data.memories, 'P1')}
            </div>
        </div>

        <!-- P2 Memory -->
        <div class="page" id="page-memory-p2">
            <div class="page-header">
                <h1 class="page-title">Temp Records (P2)</h1>
                <p class="page-subtitle">30-day TTL debug records</p>
            </div>
            <div class="memory-container">
                ${generateMemoryByCategory(data.memories, 'P2')}
            </div>
        </div>

        <!-- Skills -->
        <div class="page" id="page-skills">
            <div class="page-header">
                <h1 class="page-title">Skills Matrix</h1>
                <p class="page-subtitle">${SKILLS_DATA.length} installed skills by frequency</p>
            </div>
            ${generateSkillCards()}
        </div>

        <!-- API -->
        <div class="page" id="page-api">
            <div class="page-header">
                <h1 class="page-title">API Configuration</h1>
                <p class="page-subtitle">External service API keys status</p>
            </div>
            <div class="glass-card">
                ${generateAPIList()}
            </div>
        </div>
    `;
}

function generateHTML(data) {
    const updatedAt = new Date().toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClawBot | Personal Profile</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>${generateCSS()}</style>
</head>
<body>
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>

    <div class="update-banner">
        <span>Last updated: ${updatedAt}</span>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span id="pendingChanges" style="color: var(--text-tertiary); font-size: 0.7rem; display: none;"></span>
            <button id="syncBtn" class="sync-btn" onclick="syncChanges()" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                同步
            </button>
        </div>
    </div>

    <button class="mobile-menu-btn" onclick="toggleSidebar()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>

    <div class="app-container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">${ICONS.robot}</div>
                    <div class="logo-text">ClawBot</div>
                </div>
            </div>

            <nav class="nav-menu">
                <div class="nav-section">
                    <div class="nav-section-title">Overview</div>
                    ${generateNavItem('dashboard', 'dashboard', 'Dashboard', null)}
                    ${generateNavItem('overview', 'home', 'Home', null, true)}
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Memory</div>
                    ${generateNavItem('memory-p0', 'brain', 'Core Identity', data.memories.P0.length)}
                    ${generateNavItem('memory-p1', 'layers', 'Active Projects', data.memories.P1.length)}
                    ${generateNavItem('memory-p2', 'clock', 'Temp Records', data.memories.P2.length)}
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Capabilities</div>
                    ${generateNavItem('skills', 'skills', 'Skills', SKILLS_DATA.length)}
                    ${generateNavItem('api', 'api', 'API Keys', parseAPIs().length)}
                </div>
            </nav>

            <div class="sidebar-footer">
                <div class="status-indicator">
                    <div class="status-dot"></div>
                    <span>System Normal</span>
                </div>
            </div>
        </aside>

        <main class="main-content">
            <!-- Search Bar -->
            <div class="search-container">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" class="search-input" id="searchInput" placeholder="Search memories, skills, APIs..." onkeyup="performSearch()">
                    <span class="search-stats" id="searchStats"></span>
                </div>
            </div>

            ${generatePages(data)}
        </main>
    </div>

    <div class="toast" id="toast"></div>

    <!-- Password Modal -->
    <div class="modal-overlay" id="passwordModal">
        <div class="modal">
            <div class="modal-title" id="modalTitle">验证密码</div>
            <div class="modal-desc" id="modalDesc">请输入密码以继续操作</div>
            <div class="modal-error" id="modalError">密码错误</div>
            <input type="password" class="modal-input" id="passwordInput" placeholder="输入密码...">
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="closeModal()">取消</button>
                <button class="modal-btn confirm" onclick="verifyPassword()">确认</button>
            </div>
        </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="editModal">
        <div class="modal">
            <div class="modal-title" id="editModalTitle">编辑内容</div>
            <textarea class="modal-textarea" id="editTextarea" placeholder="输入内容..."></textarea>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="closeEditModal()">取消</button>
                <button class="modal-btn confirm" onclick="saveEdit()">保存</button>
            </div>
        </div>
    </div>

    <script>
        // Local change cache for batch sync
        let pendingChanges = [];
        let pendingEditCallback = null;
        const DELETE_PASSWORD = '002324';
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

        // Update sync button state
        function updateSyncButton() {
            const btn = document.getElementById('syncBtn');
            const badge = document.getElementById('pendingChanges');
            
            if (pendingChanges.length > 0) {
                btn.disabled = false;
                badge.style.display = 'inline';
                badge.textContent = pendingChanges.length + ' 个更改待同步';
            } else {
                btn.disabled = true;
                badge.style.display = 'none';
            }
        }

        // Add change to local cache
        function addChange(change) {
            // Check if same item already has a pending change
            const existingIndex = pendingChanges.findIndex(c => 
                c.type === change.type && 
                ((c.type === 'memory' && c.lineIndex === change.lineIndex) ||
                 (c.type === 'skill' && c.name === change.name))
            );
            
            if (existingIndex >= 0) {
                // Merge changes - if new action is delete, override; else update content
                if (change.action === 'delete') {
                    pendingChanges[existingIndex] = change;
                } else {
                    pendingChanges[existingIndex].newContent = change.newContent || pendingChanges[existingIndex].newContent;
                    pendingChanges[existingIndex].newDesc = change.newDesc || pendingChanges[existingIndex].newDesc;
                }
            } else {
                pendingChanges.push(change);
            }
            
            updateSyncButton();
            
            // Mark item as pending
            let item;
            if (change.type === 'memory') {
                item = document.querySelector('[data-id="' + change.level + '-' + change.index + '"]');
            } else {
                item = document.querySelector('[data-skill="' + change.name + '"]');
            }
            
            if (item && !item.classList.contains('pending')) {
                item.classList.add('pending');
                const badgesDiv = item.querySelector('.memory-badges, .skill-header');
                if (badgesDiv) {
                    const pendingBadge = document.createElement('span');
                    pendingBadge.className = 'pending-badge';
                    pendingBadge.textContent = '待同步';
                    badgesDiv.appendChild(pendingBadge);
                }
            }
            
            showToast('已添加到同步队列');
        }

        // Sync all pending changes
        function syncChanges() {
            if (pendingChanges.length === 0) return;
            
            // Show password modal for sync
            document.getElementById('modalTitle').textContent = '同步更改';
            document.getElementById('modalDesc').textContent = '即将同步 ' + pendingChanges.length + ' 个更改到系统，请输入密码：';
            document.getElementById('passwordInput').value = '';
            document.getElementById('modalError').classList.remove('show');
            document.getElementById('passwordModal').classList.add('show');
            document.getElementById('passwordInput').focus();
            
            // Set verify callback
            window.verifyCallback = function() {
                const input = document.getElementById('passwordInput').value;
                if (input === DELETE_PASSWORD) {
                    closeModal();
                    performSync();
                } else {
                    document.getElementById('modalError').classList.add('show');
                    document.getElementById('passwordInput').value = '';
                }
            };
        }

        function performSync() {
            const btn = document.getElementById('syncBtn');
            btn.classList.add('syncing');
            btn.disabled = true;
            
            fetch(API_BASE + '/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    password: DELETE_PASSWORD, 
                    changes: pendingChanges 
                })
            })
            .then(r => r.json())
            .then(data => {
                btn.classList.remove('syncing');
                
                if (data.success) {
                    // Clear cache
                    pendingChanges = [];
                    updateSyncButton();
                    
                    // Remove pending markers
                    document.querySelectorAll('.pending').forEach(el => {
                        el.classList.remove('pending');
                    });
                    document.querySelectorAll('.pending-badge').forEach(el => el.remove());
                    
                    showToast(data.message || '同步成功！页面将在2分钟后更新');
                } else {
                    showToast('同步失败: ' + data.error);
                    btn.disabled = false;
                }
            })
            .catch(e => {
                btn.classList.remove('syncing');
                btn.disabled = false;
                showToast('同步失败，请检查API服务器是否运行');
                console.error(e);
            });
        }

        // Override verifyPassword to use callback
        function verifyPassword() {
            if (window.verifyCallback) {
                window.verifyCallback();
            }
        }

        // Modal functions
        function showPasswordModal(title, desc, callback) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDesc').textContent = desc;
            document.getElementById('passwordInput').value = '';
            document.getElementById('modalError').classList.remove('show');
            document.getElementById('passwordModal').classList.add('show');
            document.getElementById('passwordInput').focus();
            window.verifyCallback = callback;
        }

        function closeModal() {
            document.getElementById('passwordModal').classList.remove('show');
            window.verifyCallback = null;
        }

        // Edit modal functions
        function showEditModal(title, content, callback) {
            document.getElementById('editModalTitle').textContent = title;
            document.getElementById('editTextarea').value = content;
            document.getElementById('editModal').classList.add('show');
            pendingEditCallback = callback;
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.remove('show');
            pendingEditCallback = null;
        }

        function saveEdit() {
            const content = document.getElementById('editTextarea').value;
            closeEditModal();
            if (pendingEditCallback) pendingEditCallback(content);
        }

        // Delete functions - now add to cache instead of immediate API call
        function deleteItem(level, index, content, lineIndex) {
            // Add to pending changes
            addChange({
                type: 'memory',
                action: 'delete',
                level: level,
                index: index,
                lineIndex: lineIndex,
                originalContent: content
            });
            
            // Visual feedback
            const item = document.querySelector('[data-id="' + level + '-' + index + '"]');
            if (item) {
                item.style.opacity = '0.5';
            }
        }

        function deleteSkill(name) {
            // Add to pending changes
            addChange({
                type: 'skill',
                action: 'delete',
                name: name
            });
            
            // Visual feedback
            const skill = document.querySelector('[data-skill="' + name + '"]');
            if (skill) {
                skill.style.opacity = '0.5';
            }
        }

        // Edit functions - now add to cache instead of immediate API call
        function editMemory(level, index, content, lineIndex) {
            showEditModal(
                '编辑记忆项',
                content,
                function(newContent) {
                    // Update UI immediately
                    const item = document.querySelector('[data-id="' + level + '-' + index + '"]').querySelector('.memory-text');
                    if (item) {
                        item.textContent = newContent;
                    }
                    
                    // Add to pending changes
                    addChange({
                        type: 'memory',
                        action: 'edit',
                        level: level,
                        index: index,
                        lineIndex: lineIndex,
                        newContent: newContent,
                        originalContent: content
                    });
                }
            );
        }

        function editSkill(name, desc) {
            showEditModal(
                '编辑技能: ' + name,
                desc,
                function(newDesc) {
                    // Update UI immediately
                    const skill = document.querySelector('[data-skill="' + name + '"]').querySelector('.skill-desc');
                    if (skill) {
                        skill.textContent = newDesc;
                    }
                    
                    // Add to pending changes
                    addChange({
                        type: 'skill',
                        action: 'edit',
                        name: name,
                        newDesc: newDesc
                    });
                }
            );
        }

        // Close modals on overlay click
        document.getElementById('passwordModal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) closeEditModal();
        });

        // Enter key to submit password
        document.getElementById('passwordInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verifyPassword();
        });

        // Page navigation
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => {
                if (n.getAttribute('onclick')?.includes(pageId)) n.classList.add('active');
            });
            document.getElementById('sidebar').classList.remove('open');
            window.scrollTo(0, 0);
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
        }

        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const btn = document.querySelector('.mobile-menu-btn');
            if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Category toggle
        function toggleCategory(header) {
            header.classList.toggle('collapsed');
        }

        // Skill detail toggle
        function toggleSkillDetail(card) {
            card.classList.toggle('expanded');
        }

        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }

        // Search functionality
        function performSearch() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const stats = document.getElementById('searchStats');
            
            if (!query) {
                document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
                document.querySelectorAll('.highlight').forEach(el => {
                    el.outerHTML = el.innerHTML;
                });
                stats.textContent = '';
                return;
            }

            let matchCount = 0;
            
            // Search in memory items
            document.querySelectorAll('.memory-item-compact').forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.classList.remove('hidden');
                    matchCount++;
                } else {
                    item.classList.add('hidden');
                }
            });

            // Search in skill cards
            document.querySelectorAll('.skill-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(query)) {
                    card.classList.remove('hidden');
                    matchCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Search in API items
            document.querySelectorAll('.api-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.classList.remove('hidden');
                    matchCount++;
                } else {
                    item.classList.add('hidden');
                }
            });

            stats.textContent = matchCount + ' results';
        }
    </script>
</body>
</html>`;
}

function main() {
    console.log('ClawBot Profile Generator v3');
    console.log('============================');
    
    const memoryContent = readFile(CONFIG.workspace + '/MEMORY.md');
    const memories = parseMemory(memoryContent);
    
    console.log(`Memory: P0=${memories.P0.length}, P1=${memories.P1.length}, P2=${memories.P2.length}`);
    console.log(`Skills: ${SKILLS_DATA.length}`);
    console.log(`APIs: ${parseAPIs().length}`);
    
    const html = generateHTML({ memories });
    fs.writeFileSync(CONFIG.output, html);
    console.log(`\nGenerated: ${CONFIG.output}`);
    
    const today = new Date().toISOString().split('T')[0];
    const memoryFile = CONFIG.memoryDir + '/' + today + '.md';
    if (fs.existsSync(memoryFile)) {
        const logEntry = `\n[P2][${today}] Profile v3 updated\n- Memory: P0=${memories.P0.length}, P1=${memories.P1.length}, P2=${memories.P2.length}\n- Skills: ${SKILLS_DATA.length}, Search enabled, Category view\n`;
        fs.appendFileSync(memoryFile, logEntry);
    }
    
    console.log('Done!');
}

main();
