# FateWise 八卦占卜方向战略规划

> 定位：以「高频互动功能」驱动 SEO 长尾流量 + 用户留存，导流至命书付费转化

---

## 一、页面改进方案

### 1.1 功能入口位置设计

采用「三层漏斗」结构，八卦占卜作为流量钩子贯穿全链路：

```
首页 Hero → 独立八卦页 (/bagua) → 命书页 (/bazi)
    ↓              ↓                   ↓
CTA: "每日一卦"   CTA: "详细解读你的命盘"  CTA: "购买完整命书报告"
```

- **首页**：在 Hero 区域下方增加「每日卦象」模块——一个醒目但克制的入口，展示当日随机卦象（或用户输入时间/数字起卦），配 CTA「今天想问什么？」跳转独立页
- **命书页 (/bazi)**：在八字排盘结果下方，增加「延伸占卜」模块——「你的命盘中隐藏着什么卦象？试试每日八卦起卦」
- **独立页 (/bagua)**：主入口，完整的八卦占卜功能页

### 1.2 用户交互流程设计

**起卦方式（三种，由简到深）：**

| 方式 | 交互 | 适用场景 |
|------|------|----------|
| **每日一卦**（默认） | 打开即显示今日专属卦象，一键解读 | 日常浏览、内容分享 |
| **问题起卦** | 输入文字问题 → 选择硬币/数字/时间方式 → 生成卦象 | 有明确困惑的用户 |
| **深度占卜** | 结合八字命盘（需登录）→ 用出生时间起卦 → 生成卦象 + 命盘联动解读 | 付费转化核心路径 |

**结果呈现（宋式极简风）：**

```
┌──────────────────────────────┐
│        ䷀ 乾为天              │  ← 卦象符号（Unicode Big5）
│     QIAN · Heaven            │  ← 卦名 + 英文
├──────────────────────────────┤
│                              │
│   「天行健，君子以自强不息」    │  ← 卦辞（居中排版）
│                              │
├──────────────────────────────┤
│  【卦象解读】                 │
│  ▸ 整体运势：...              │
│  ▸ 事业：...                  │
│  ▸ 感情：...                  │
│  ▸ 建议：...                  │
├──────────────────────────────┤
│                              │
│  ┌─「你的八字命盘与此卦象呼应」─┐ │
│  │  [查看我的完整命书] (CTA)   │ │ ← 登录用户可见
│  └──────────────────────────┘ │
└──────────────────────────────┘
```

设计原则：宋式留白、宣纸纹理背景、松烟墨色文字，卦象符号用大号书法字体。

### 1.3 与命书产品的衔接关系

**八卦 → 命书的导流路径：**

1. **未登录用户**：每日一卦页面底部放置「想要更详细的个人化解读？输入你的出生时间，获取专属八字命盘」→ 跳转到 /bazi
2. **已登录用户**：在卦象解读中嵌入「命盘联动」模块——根据用户八字分析当前大运与当日卦象的呼应关系 → 引导「解锁完整命书报告」
3. **付费墙设计**：每日一卦免费；深度占卜（结合命盘）需要 Pro 订阅；单次深度解读可单独购买

---

## 二、SEO 方案

### 2.1 关键词缺口分析（按意图分层）

#### 🔴 Tier 1：高搜索量 + 中高竞争（长期目标）

| 关键词 | 月搜索量估计 | 竞争度 | 对应页面 |
|--------|-------------|--------|----------|
| i ching online | 12,000-18,000 | 中 | /bagua (主落地页) |
| i ching hexagram meanings | 8,000-12,000 | 中高 | 64卦解读内容集群 |
| chinese divination methods | 5,000-8,000 | 中 | /bagua + 比较类博客 |
| what does the i ching say | 6,000-10,000 | 中 | /bagua (问答页) |
| yijing online reading | 3,000-5,000 | 低中 | /bagua |

#### 🟡 Tier 2：中等搜索量 + 低竞争（短期优先）

| 关键词 | 月搜索量估计 | 竞争度 | 对应页面 |
|--------|-------------|--------|----------|
| i ching daily reading | 2,000-4,000 | 低 | /bagua (首页模块) |
| free i ching divination online | 3,000-5,000 | 低中 | /bagua (免费入口) |
| i ching hexagram guide for beginners | 1,500-3,000 | 低 | /blog/i-ching-beginners-guide |
| what is yijing i ching | 2,000-4,000 | 低 | /blog/what-is-i-ching-yijing |
| 64 hexagrams meaning list | 1,000-2,000 | 低 | /blog/64-hexagrams-complete-guide (支柱页) |
| how to cast i ching coins | 1,000-2,000 | 低 | /blog/how-to-read-i-ching |

#### 🟢 Tier 3：长尾词 + 极低竞争（快速占领）

| 关键词 | 月搜索量估计 | 竞争度 | 对应页面 |
|--------|-------------|--------|----------|
| i ching reading for career advice | 800-1,500 | 极低 | /blog/i-ching-career-hexagrams |
| i ching love reading online free | 600-1,200 | 极低 | /blog/i-ching-love-divination |
| hexagram meaning today daily | 500-1,000 | 极低 | /bagua (每日一卦) |
| i ching vs tarot comparison | 800-1,500 | 极低 | /blog/i-ching-vs-tarot |
| i ching vs bazi which is better | 300-800 | 极低 | /blog/i-ching-vs-bazi |
| what hexagram am i day master comparison | 200-500 | 极低 | /blog/i-ching-day-master-personality (差异化内容) |
| i ching divination for decision making | 500-1,000 | 极低 | /blog/i-ching-decision-guide |
| yijing hexagram 1 meaning heaven | 400-800 | 极低 | /blog/hexagram-1-qian-heaven (64篇系列) |

### 2.2 内容策略

#### A. 支柱页（Pillar Page）—— /blog/i-ching-complete-guide

一篇 4,000+ 词的终极指南，覆盖：
- What is the I Ching (Yijing) — 历史渊源与哲学体系
- How I Ching divination works — 起卦方法与原理
- The 64 hexagrams overview — 完整卦象列表与分类（每卦一简释）
- I Ching vs Bazi — 两种东方占卜体系的异同（自然承接命书导流）
- How to use daily I Ching readings — 实用指南 + CTA 到 /bagua

**内部链接策略：**
- ← 指向：/bagua（功能入口）、/bazi（命书对比）
- → 指向：64卦详解系列文章、i ching vs tarot、how to cast coins 等长尾内容

#### B. 64卦详解系列 —— /blog/hexagram-N-name-meaning（64篇）

每篇文章 800-1,200 词，结构统一：
```
H1: Hexagram N [卦名] — Meaning, Symbolism & Interpretation
  H2: The Hexagram at a Glance（符号、卦名中英、五行属性）
  H2: Ancient Text / 卦辞原文与翻译
  H2: Line-by-Line Meaning（六爻解读）
  H2: What This Hexagram Means for You（现代应用场景）
    - Career & Work
    - Love & Relationships  
    - Health & Wellness
  H2: Related Hexagrams（变卦、错卦、综卦关系）
  H2: Try Your Own Reading → [CTA to /bagua]
```

#### C. 比较类内容 —— 差异化优势

| 文章 | 目标关键词 | 差异化角度 |
|------|-----------|-----------|
| I Ching vs Tarot | i ching vs tarot comparison | 东方哲学 vs 西方神秘学，强调 I Ching 的理性决策框架 |
| I Ching vs Bazi / Four Pillars | i ching vs bazi comparison | 同一平台内闭环，自然导流命书 |
| I Ching vs Western Astrology | chinese divination vs western astrology | 与现有文章《Bazi vs Western Astrology》形成矩阵 |
| I Ching vs Tarot vs Bazi | three divination systems compared | 三合一比较页，覆盖更广关键词 |

#### D. 「每日一卦」页面本身即 SEO 资产

- /bagua → 每日更新内容（Google 喜欢新鲜内容）
- 页面标题动态变化：「I Ching Daily Reading for [Date] — Hexagram X」
- 每月自动归档为独立页面：/blog/daily-i-ching/[YYYY/MM/hexagram-slug]
- 长期积累形成「I Ching Daily Reading Archive」索引页

### 2.3 内部链接 SEO 闭环设计

```
                    ┌──────────────┐
                    │  /bagua      │ ← 每日更新，新鲜内容信号强
                    │  (核心枢纽)   │
                    └──────┬───────┘
               ↙            ↓            ↘
        /blog/64-hexagrams  /bazi      /pricing
         详细系列          (命书页)     (转化页)
               ↓            ↑            ↑
        /blog/i-ching-    从卦象模块   免费用户
         complete-guide   导流命书      → Pro/购买
               ↓            ↑
        /blog/i-ching-    从命书页     命书用户
         vs-bazi          推荐每日一卦  → 深度占卜
```

**关键链接规则：**
1. 每篇 64卦文章底部必须有「→ 试试今日自己的每日一卦」链接到 /bagua
2. /bagua 页面底部必须有「← 想了解你的八字命盘如何与卦象呼应？→」链接到 /bazi
3. /bazi 页面结果区必须有「延伸占卜：八卦每日一卦」入口
4. 支柱页 `/blog/i-ching-complete-guide` 作为枢纽，链接所有子话题文章

---

## 三、推广方案

### 3.1 「每日一卦」功能推广策略

#### Phase 1：内容驱动（第 1-2 个月）

| 渠道 | 动作 | 预期效果 |
|------|------|----------|
| **Show HN / Hacker News** | 「Daily I Ching — 你的东方每日哲学顾问」 | 技术社区曝光，获取首批种子用户 |
| **Reddit r/ChinesePhilosophy** | 分享卦象解读 + 「我用 Python 做了个每日一卦网站」 | 深度用户转化，获得高质量反馈 |
| **Reddit r/IChing** | 每日卦象解读帖（非广告，纯内容分享）+ bio 链接 | 垂直社区建立权威身份 |
| **Twitter/X** | 每日卦象卡片（宋式极简设计）+ #IChing #Yijing 标签 | 视觉传播，文化爱好者圈层扩散 |

#### Phase 2：社区渗透（第 3-4 个月）

| 渠道 | 动作 | 预期效果 |
|------|------|----------|
| **Discord** | 加入 I Ching / Chinese Philosophy 相关服务器，分享每日解读 | 建立社区存在感 |
| **TikTok** | 「每日一卦」短视频系列——15秒展示今日卦象 + 一句话解读（配合古风 BGM） | 面向年轻受众的病毒式传播 |
| **Medium / Substack** | 发布 I Ching 深度解读长文，嵌入网站链接 | SEO 外链建设 + 邮件订阅积累 |

#### Phase 3：KOL / 合作（第 5-6 个月）

| 渠道 | 动作 | 预期效果 |
|------|------|----------|
| **YouTube** | 联系 Chinese Philosophy / I Ching 频道，提供免费 API/嵌入代码 | 获取高质量反向链接 + 曝光 |
| **Newsletter** | 与 mysticism / spirituality newsletter 合作（如 The Spiritual Hacker） | 精准流量导入 |
| **Product Hunt** | 「Daily I Ching」作为 FateWise 的子功能 launch | 产品社区曝光 + PR 报道机会 |

### 3.2 社交媒体内容日历（每日自动）

```
每日自动发布流程：
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ 08:00 CST       │     │ 14:00 CST    │     │ 20:00 CST   │
│ Twitter/X       │────→│ Reddit r/    │────→│ 小红书/抖音   │
│ 卦象卡片 +       │     │ IChing       │     │ 「今日运势」  │
│ 英文解读         │     │ 中文长解读    │     │ 短视频       │
└─────────────────┘     └──────────────┘     └─────────────┘
```

**内容模板：**
- **Twitter/X**：卦象 Unicode 符号 + 英文一句话解读 + 网站链接
- **Reddit**：完整卦象解读（500+词）+ 哲学思考 + 「我做了个网站可以每日起卦」
- **TikTok/小红书**：15秒古风视频——墨迹展开露出卦象 + 配音解读

### 3.3 SEO 推广与外链建设

| 策略 | 具体动作 | 预期 DR/DA |
|------|----------|-----------|
| **HARO / Connectively** | 以「I Ching expert」身份回答记者问题，链接到 /blog/i-ching-complete-guide | 高 (60+) |
| **资源页收录** | 向「best chinese divination tools」「i ching resources」类页面提交链接请求 | 中 (40-60) |
| **学术引用** | 在 I Ching / Yijing 学术论文的「online tools」部分争取收录 | 高 (70+) |
| **工具目录提交** | Product Hunt、AlternativeTo、Slant 等平台 | 中 (30-50) |

### 3.4 推广优先级矩阵

| 优先级 | 行动 | 时间投入 | 预期 ROI |
|--------|------|----------|----------|
| **P0** | 64卦系列文章 + /bagua 上线 | 高（内容生产） | ★★★★★ SEO 长尾流量 |
| **P0** | Twitter/X 每日卦象卡片 | 低（自动化） | ★★★★☆ 品牌曝光 |
| **P1** | Reddit r/IChing + r/ChinesePhilosophy 参与 | 中 | ★★★★☆ 种子用户 |
| **P1** | 「每日一卦」Show HN / Reddit r/SaaS 首发 | 低 | ★★★★☆ 社区曝光 |
| **P2** | TikTok/小红书短视频系列 | 中 | ★★★☆☆ 年轻受众 |
| **P2** | Newsletter / KOL 合作外联 | 中 | ★★★☆☆ 精准流量 |
| **P3** | Product Hunt launch | 低（一次性） | ★★★☆☆ 产品曝光 |

---

## 四、预期效果与里程碑

### 短期（1-3个月）
- /bagua 页面上线，Google 收录「i ching daily reading」相关长尾词
- 64卦系列文章中，前10篇进入 Google 索引（预计 2-4 周）
- Reddit + Twitter 获得首批 100+ 日活用户

### 中期（3-6个月）
- 「i ching online」「daily i ching reading」相关关键词进入前 20
- 64卦系列全部上线，形成内容矩阵（预计自然流量 5,000-10,000/月）
- 命书页 → 八卦页 → 命书的导流循环建立，转化率提升

### 长期（6-12个月）
- 「i ching hexagram meanings」「yijing online」进入前 10（需外链配合）
- 八卦功能用户月活达到命书用户的 3-5倍（高频带低频）
- 自然搜索月流量目标：10,000+ sessions（八卦相关占比 ≥40%）

---

## 五、风险提示与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| Google 对「每日一卦」自动生成内容判定为低质量 | SEO 降权 | 每篇每日解读手动/半手动润色，加入独特哲学解读角度 |
| I Ching 内容被判定为「娱乐/迷信」而非知识性内容 | 搜索意图不匹配 | 强化哲学、文化、决策科学角度的内容定位 |
| 与现有命书博客风格不统一 | 品牌认知混乱 | UI/内容模板严格遵循宋式极简规范，编辑政策一致 |
| 64篇长文生产成本过高 | 项目延期 | 优先发布高搜索量卦象（乾、坤、屯、蒙等前20卦），其余逐步补全 |
