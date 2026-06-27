# FateWise Bagua (I Ching) 主推改造方案

## 核心洞察

| 维度 | Bazi 命盘 | Bagua 起卦 |
|------|-----------|-----------|
| 使用频率 | 一生一次 | 随时可算（决策/出行/感情/事业） |
| 用户留存 | 低（读完就走） | **高**（反复使用场景多） |
| 搜索意图 | "bazi chart" (低频) | "divination", "iching", "fortune telling" (**高频**) |
| 付费转化 | 中（PDF报告） | **高**（每次解读需积分/付费） |
| SEO 长尾词 | 少 | **极多**（每个卦象都是独立页面） |

## 改造优先级

### P0 — 立即执行

**1. Hero 区域：双 CTA 策略**
```
主标题：Discover Your Destiny with Ancient Wisdom
副标题：Bazi Chart · Bagua Divination · AI Destiny Reading
CTA按钮：[免费起卦] [查看命盘]
```
- "免费起卦"作为首屏最大 CTA（金色高亮）
- 八字命盘作为第二 CTA

**2. 导航栏：Bagua 独立一级入口**
```
首页 | 八字命盘 | 🔮 八卦起卦 | AI咨询 | 每日运势 | 定价
```
- Bagua 从 dropdown 提升到一级导航
- 加 🔮 emoji 增加视觉辨识度

**3. 首页新增 "Quick Divination" 板块**
- 用户直接在首页输入问题 → 一键起卦
- 无需跳转 /bagua 页面
- 降低使用门槛，提升转化率

### P1 — 短期推进

**4. 卦象详情页 SEO 化**
- 64 卦各生成独立 SEO 页面（/bagua/hexagram/1, /bagua/hexagram/2...）
- 每个页面包含：卦象解读、应用场景、关键词覆盖
- 预计新增 64 个 SEO landing pages

**5. 场景化入口**
```
🔮 今天该做什么决定？ → 起一卦
💼 事业方向迷茫？ → 事业卦
❤️ 感情走势如何？ → 感情卦
🧭 出行方位吉凶？ → 方位卦
```
- 每个场景一个独立 landing page
- 覆盖长尾搜索词

### P2 — 中期规划

**6. 每日卦象**
- 首页展示"今日卦"
- 用户可点击查看详细解读
- 提升日活和回访率

**7. 分享功能**
- 生成卦象分享卡片（带 OG image）
- 社交媒体传播 → 自然引流

## SEO 关键词策略（Bagua 方向）

| 类别 | 关键词示例 | 搜索量估计 |
|------|-----------|-----------|
| 通用 | "iching divination online", "free i ching reading" | 高 |
| 场景 | "iching for career advice", "iching love reading" | 中 |
| 卦象 | "hexagram 1 meaning", "hexagram 64 meaning" | 中 |
| 对比 | "iching vs bazi", "iching vs tarot" | 低-中 |
| 教学 | "how to cast hexagram online", "iching basics" | 中 |

## 实施步骤

1. 改 Navbar — Bagua 提升为一级导航 ✅ (代码量小)
2. 改 Hero — 双 CTA 策略 ✅ (代码量中等)
3. 首页 Quick Divination 板块 ✅ (代码量中等)
4. 64 卦独立页面 ✅ (代码量中等，可批量生成)
5. 场景化 landing pages ✅ (代码量小，模板化)
6. 每日卦象 + 分享功能 ✅ (代码量中等)

## 预期效果

- **日活提升**：30-50%（反复使用场景）
- **SEO 流量**：64 个新 landing pages × 长尾词 = 显著增长
- **付费转化**：每次解读可设积分/付费墙，比命盘一次性付费更可持续
