# FateWise · 天命之书 - ez-mystic MVP

**东方神秘学 AI 产品** | fatewise.app

精准八字排盘 + AI 深度解读 + 完整命书 PDF 报告

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd ez-mystic
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=sk-xxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

> **无 API Key 也可运行**：会自动使用模拟解读数据用于开发测试。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
ez-mystic/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（全局样式 + metadata）
│   ├── page.tsx                  # 首页（Landing Page）
│   ├── globals.css               # 全局样式（星空背景 + 毛玻璃 + 金色主题）
│   │
│   ├── bazi/                     # 八字排盘页
│   │   └── page.tsx              # 排盘输入表单 + 结果展示
│   │
│   ├── fatebook/                 # 命书报告页
│   │   └── page.tsx              # 命书渲染 + PDF 下载
│   │
│   ├── payment/                  # 支付页
│   │   └── page.tsx              # Paddle/Dodo 支付集成
│   │
│   └── api/                      # API Routes
│       ├── bazi/route.ts         # 八字计算 + AI 解读
│       ├── interpret/route.ts    # 完整命书生成
│       └── pdf/route.ts          # PDF 生成（jsPDF）
│
├── src/
│   └── bazi/                     # 八字引擎（纯 TS）
│       ├── index.ts              # 导出入口
│       ├── types.ts              # 类型定义
│       ├── ganzhi.ts             # 天干地支常量 + 十神表 + 纳音表
│       ├── engine.ts             # 核心排盘引擎（真太阳时 + lunar-javascript）
│       └── ai-prompt.ts          # AI 提示词构建
│
├── public/                       # 静态资源
├── .env.example                  # 环境变量模板
├── package.json
├── tsconfig.json
├── tailwind.config.js            #  Tailwind 配置（金色主题 + 五行色）
├── postcss.config.js
└── README.md
```

---

## 🎨 UI 设计

遵循 ez-mystic UI 设计指南（`/concepts/ui-design-guide.md`）：

- **深色星空主题**：`#0A0A0F` 底色 + 星点背景
- **金色点缀**：`#D4A853` 金色 CTA 按钮 + 辉光效果
- **毛玻璃效果**：`backdrop-filter: blur(20px)` 玻璃卡片
- **五行色彩**：木绿/火红/土棕/金白/水蓝
- **字体**：Noto Serif SC（标题）+ Inter（正文）

---

## 🔧 八字引擎

### 核心技术

| 组件 | 技术 | 说明 |
|------|------|------|
| 历法转换 | `lunar-javascript` | MIT 协议，1900-2100 年 |
| 真太阳时 | 自建 | 经度校正 + Meeus EOT 算法 |
| 节气计算 | lunar 内置 | 精确到秒 |
| 十神/藏干 | 自建查表 | 完整十神映射 + 地支藏干 |
| 大运 | 自建计算 | 顺排/逆排 + 起运岁数 |

### 算法流程

```
用户输入 → 真太阳时校正 → lunar 历法转换 → 四柱推算
    → 十神/藏干/纳音 → 大运计算 → 结果输出
```

### 关键设计决策

1. **真太阳时**：默认启用，经度校正 + 均时差(EOT)
2. **子正换日**：00:00 换日，支持配置切换
3. **节气分界**：以"节"为月令分界（非"气"）
4. **年柱立春**：以立春为新旧年分界

---

## 🤖 AI 解读

### 集成 DeepSeek

```typescript
// app/api/bazi/route.ts
const response = await fetch(DEEPSEEK_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  }),
});
```

### 提示词设计

- **系统提示**：设定 AI 为专业命理师角色
- **结构化输入**：将八字数据以 Markdown 表格形式嵌入
- **输出格式**：7 大章节（命盘总览/性格/事业/财运/感情/流年/开运）
- **免责声明**：所有输出包含"仅供参考"标注

### 降级方案

无 API Key 时自动使用模拟数据，确保开发测试可用。

---

## 📕 命书 PDF

### 技术选型

- **jsPDF**：纯前端 PDF 生成，无需后端依赖
- **流程**：八字数据 → AI 解读 → jsPDF 渲染 → Blob → Base64 → 下载

### PDF 内容

1. 封面（金色标题 + 命主信息）
2. 四柱八字表格
3. 五行统计
4. AI 解读全文
5. 免责声明

---

## 💳 支付集成

### MVP 阶段

```
支付按钮 → Paddle Checkout / Dodo Payments → 成功回调 → 命书 PDF
```

### 集成步骤

1. 注册 Paddle（https://www.paddle.com/）
2. 创建产品定价（$29.99）
3. 获取 Vendor ID + Public Key
4. 配置 `.env.local`
5. 更新 `app/payment/page.tsx` 中的支付逻辑

---

## 🌐 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd /home/zxw/.openclaw/workspace/ez-mystic
vercel
```

**环境变量设置**（Vercel Dashboard）：

| 变量 | 值 |
|------|-----|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |
| `DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` |

### Netlify

```bash
npm i -g netlify-cli
cd ez-mystic
netlify deploy --prod
```

**环境变量设置**（Netlify Dashboard → Site Settings → Environment Variables）

---

## 🧪 测试

### 手动测试用例

| 测试场景 | 输入 | 预期结果 |
|----------|------|----------|
| 常规排盘 | 1990-01-01 12:00 北京 | 四柱正确 |
| 子时排盘 | 1990-01-01 00:30 北京 | 时柱正确 |
| 真太阳时 | 1990-07-01 06:50 乌鲁木齐 | 时辰可能变化 |
| 节气临界 | 2024-02-04 立春前后 | 年柱切换正确 |

### AI 解读测试

1. 输入已知八字（如毛泽东：1893-12-26）
2. 对比权威来源的八字排盘结果
3. 验证 AI 解读的合理性和深度

---

## 📋 MVP 功能清单

### ✅ 已完成

- [x] 八字排盘引擎（真太阳时 + lunar-javascript）
- [x] 八字输入表单（日期/时间/地点/经纬度）
- [x] AI 解读 API（DeepSeek 集成）
- [x] 排盘结果展示（四柱/五行/大运）
- [x] 命书报告页（滚动查看）
- [x] PDF 生成（jsPDF）
- [x] Landing Page（金色主题 + 星空背景）
- [x] 支付页面（Paddle/Dodo 集成框架）
- [x] UI 设计（毛玻璃 + 金色 + 五行色）

### 🔲 待完善

- [ ] 支付功能实际集成
- [ ] 域名 fatewise.app 注册
- [ ] Vercel/Netlify 部署
- [ ] SEO 优化
- [ ] 移动端响应式优化
- [ ] 动画效果完善
- [ ] 更多八字边界情况测试

---

## 🔑 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 否 | DeepSeek API Key（无则用模拟数据） |
| `DEEPSEEK_API_URL` | 否 | DeepSeek API 地址 |
| `PADDLE_VENDOR_ID` | 否 | Paddle 商户 ID |
| `PADDLE_PUBLIC_KEY` | 否 | Paddle 公钥 |
| `DODO_PAYMENTS_API_KEY` | 否 | Dodo Payments API Key |

---

## 📝 免责声明

本网站所有内容仅供娱乐和教育用途，不构成人生决策建议。命理分析结果由 AI 生成，不代表专业命理师的意见。

---

## 🏗 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 14 (App Router) | Web 框架 |
| Tailwind CSS v3 | 样式 |
| lunar-javascript | 历法/八字 |
| DeepSeek API | AI 解读 |
| jsPDF | PDF 生成 |
| React Hook Form | 表单处理 |
| Vercel | 部署 |

---

> **项目**: ez-mystic | **品牌**: FateWise | **域名**: fatewise.app
> **版本**: MVP v0.1.0 | **日期**: 2026-05-14
