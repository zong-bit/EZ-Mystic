# FateWise 技术债务审计与优化评估

**[技术审计]** 审计日期：2026-06-22  
**[技术审计]** 项目：/home/zxw/.openclaw/workspace/ez-mystic (bornchart.app)  
**[技术审计]** 框架：Next.js 14.2.14（⚠️ 非文档声称的 15）  
**[技术审计]** 代码总量：~23,472 行（含中文镜像）

---

## 一、架构健康度

### 1.1 Next.js App Router 使用评估 ⭐⭐⭐☆☆

| 维度 | 评分 | 说明 |
|------|------|------|
| App Router 使用 | ⭐⭐⭐⭐ | 正确使用 `app/` 目录结构、`generateStaticParams`、`metadata` API |
| Server/Client 分离 | ⭐⭐⭐ | 大量页面混用 `'use client'`，应更多使用 Server Components |
| i18n 实现 | ⭐ | `/zh/` 是完整镜像而非真正国际化（无 `next-intl`） |
| 动态路由 | ⭐⭐⭐⭐ | `[slug]`、`[plan]` 参数处理合理，`generateStaticParams` 使用正确 |
| API Routes | ⭐⭐⭐ | 集中在 `app/api/`，但部分路由缺少 auth 保护（已修复） |

**[技术审计]** 关键发现：
- `next.config.js` 极度简化（仅 `reactStrictMode: true`），缺少关键配置
- **缺失**: `compiler: { removeConsole: process.env.NODE_ENV === 'production' }`
- **缺失**: `images: { formats: ['image/avif', 'image/webp'] }`
- **缺失**: `experimental: { serverActions: { bodySize: '1mb' } }`
- **缺失**: `headers` 配置（CSP、X-Frame-Options、HSTS）

### 1.2 组件复用与代码重复

**[技术审计]** 已知重复问题（来自历史审计）：

#### 1.2.1 TrigramLines 渲染逻辑重复 ×3
- **位置**: `app/bagua/page.tsx`, `app/components/BaguaDiagram.tsx`, `app/components/HexCard.tsx`
- **问题**: 相同的卦象渲染逻辑用 `div`/`SVG` 三种不同实现方式重复
- **影响**: 维护成本高，修改一个需同步改三个

#### 1.2.2 Blog Markdown 渲染器重复 ×2
- **位置**: `app/blog/page.tsx` (getPosts), `app/blog/[slug]/page.tsx` (getPost)
- **问题**: 相同的 frontmatter 解析逻辑（正则匹配 title/date/author/excerpt）在两个文件中重复
- **影响**: 格式变更需改两处

#### 1.2.3 Payment 页面 Gumroad 链接重复 ×6
- **位置**: `app/payment/page.tsx`, `app/payment/[plan]/page.tsx`, `app/zh/payment/page.tsx`, `app/zh/payment/[plan]/page.tsx`, `app/pricing/page.tsx`, `app/zh/pricing/page.tsx`
- **问题**: 每个文件硬编码 `GUMROAD_MONTHLY` / `GUMROAD_YEARLY`
- **影响**: 产品链接变更需改 6 处（已发现 C-6 错误不一致）

**[技术审计]** 建议：
1. 创建 `constants/gumroad-links.ts` 集中管理产品链接
2. 提取 `useBlogPosts()` hook 统一 frontmatter 解析
3. 创建 `components/TrigramLines.tsx` 单一实现，通过 prop 切换 SVG/div

### 1.3 状态管理评估 ⭐⭐☆☆☆

**[技术审计]** 当前架构：
- **Auth**: Supabase `AuthProvider` (Context API)
- **页面状态**: 大量 `useState` / `useEffect` 直接在页面组件中
- **无全局状态管理**: 没有 Zustand/Redux/Jotai

**[技术审计]** 问题：
- `app/compatibility/page.tsx` (~580 行) 包含所有状态逻辑（输入、计算、评分、UI），违背单一职责
- `app/components/StarBackground.tsx` (948 行) 包含完整的 Canvas 渲染引擎
- 无错误边界 (`app/error.tsx` / `global-error.tsx`)

---

## 二、性能审计

### 2.1 Core Web Vitals 瓶颈点

**[技术审计]** LCP (Largest Contentful Paint):
- **风险**: 首页 Hero 区域使用大字体 + StarBackground Canvas（948 行 JS）
- **Canvas DPR**: `Math.min(window.devicePixelRatio || 1, 2)` — ✅ 已限制为 2x（非最高可能值）
- **Safari 优化**: 已应用 React Portal + `translateZ(0)` + `will-change: transform` ✅
- **缺失**: Canvas 动画未做 `requestAnimationFrame` throttle，每帧都重绘

**[技术审计]** CLS (Cumulative Layout Shift):
- **风险**: `generateStaticParams()` 读取 `fs` 文件系统，build-time 延迟可能导致 CLS
- **风险**: Blog 页面 `fs.readFileSync` 在 SISR 模式下读取 ~98 个文件
- **缺失**: 所有 `<h1>`~`<h6>` 未设置 `font-display: swap`

**[技术审计]** INP (Interaction to Next Paint):
- **风险**: `compatibility/page.tsx` 中 `calculateCompatibility()` 同步计算，阻塞主线程
- **风险**: 页面中大量 inline style（`style={{ top: '20%', left: '30%' }}`）
- **缺失**: 无 Web Workers 用于重型计算

### 2.2 Canvas 渲染性能

**[技术审计]** StarBackground.tsx (948 行):
```typescript
// ✅ DPR 已限制为 2x (第 650 行)
const dpr = Math.min(window.devicePixelRatio || 1, 2);

// ⚠️ 无动画节流 — 每帧都重绘所有星星
animRef.current = requestAnimationFrame(draw);

// ⚠️ 星星数量无上限 — 大屏可能渲染数千颗
starsRef.current = createStars(window.innerWidth, window.innerHeight);

// ✅ 颜色使用 HSL 而非 RGB — 减少字符串解析开销
// ✅ 区域分类 (yang/yin/bg) — 合理的渲染优化
```

**[技术审计]** Safari 已知问题已修复：
- ✅ Canvas React Portal to `document.body`
- ✅ `translateZ(0)` + `will-change: transform` 强制 GPU 合成
- ✅ `bg-bg-primary` fallback 防止滚动时背景消失

### 2.3 首屏加载与 Bundle Size

**[技术审计]** node_modules: **672MB** — 偏大
- **建议**: `next build` 后运行 `analyze` 插件查看实际 bundle

**[技术审计]** 已知依赖：
- `lunar-javascript` — CJS，无法 tree-shake（已在 engine.ts 使用 `require()`）
- `@supabase/supabase-js` — 较大 (~100KB gzipped)
- `lucide-react` — ✅ 按需导入（Tree-shakable）
- `react-hook-form` — 未使用（待确认）

---

## 三、安全审计

### 3.1 Supabase 配置安全

**[技术审计]** ✅ 已修复（P0）:
- `usage-tracker.ts` 添加运行时检查防止客户端导入
- `.env.*` 已加入 `.gitignore`
- Service Role Key 隔离

**[技术审计]** ⚠️ 仍需注意:
- `app/api/stats/route.ts` 已改为返回友好提示 ✅
- `app/api/compatibility/route.ts` 已添加 IP 限流 (10 req/min) ✅
- **缺失**: Supabase RLS 策略是否配置？（代码中未看到 RLS 相关逻辑）
- **缺失**: API rate limiting 使用内存方案，Vercel Serverless 多实例不一致

### 3.2 Gumroad Webhook 安全

**[技术审计]** ✅ 已加固（P0）:
- HMAC-SHA256 签名验证
- Secret 未配置时拒绝所有请求
- 幂等性检查（`gumroad_sales` 表查重）

**[技术审计]** ⚠️ 风险:
- `detectFatewisePlan()` 仅依赖 permalink 匹配，脆弱
- Webhook insert 失败后未 return，继续执行（`app/api/gumroad-webhook/route.ts` L84-91）

### 3.3 XSS 风险

**[技术审计]** `dangerouslySetInnerHTML` ×2:
- `app/layout.tsx` L124, L144 — Schema.org JSON-LD（✅ 安全，使用 `JSON.stringify`）
- **无其他 XSS 风险点**

---

## 四、可扩展性评估

### 4.1 从 4 用户到 10K 用户的瓶颈

| 瓶颈点 | 当前状态 | 10K 用户影响 | 修复建议 |
|--------|----------|-------------|---------|
| Supabase 查询无索引 | ❓ 未知 | 高 | 对 `gumroad_sales.email`, `tokens.token`, `tokens.user_id` 加索引 |
| API 限流（内存方案） | ⚠️ 不一致 | 高 | 迁移到 Upstash Redis |
| Blog fs.readFileSync | ❌ SISR | 中 | 迁移至 SSG 或 MDX |
| 无 CDN 缓存策略 | ❌ 无配置 | 中 | 添加 `next.config.js` headers |
| 无 API 响应缓存 | ❌ 无 | 高 | 添加 `revalidate` 或 Edge Cache |

### 4.2 Supabase 查询优化

**[技术审计]** 高频查询点：
1. `gumroad_sales` — 每次 webhook + claim + verify 查询
2. `tokens` — 每次验证 + 激活查询
3. `api_usage` — 每次 API 调用追踪
4. `referral_rewards` — 支付奖励查询

**[技术审计]** 缺失索引（需确认 Supabase 表结构）:
- `gumroad_sales.email` — 用于快速查找用户订单
- `tokens.token` — 主键索引 ✅（假设）
- `tokens.user_id` — 用于查询用户所有 token
- `api_usage.created_at` — 用于时间范围查询

---

## 五、技术债务清单

### 🔴 Critical (阻塞生产)

| # | 债务项 | 影响 | 修复建议 | 预估工时 |
|---|--------|------|---------|---------|
| T-1 | Premium 定价层级缺失 | 无法销售 $29.99 产品 | 定价页加 Premium 卡片 | 1h |
| T-2 | Paddle UI 残留 (8处) | 用户可能选择废弃渠道 | 全局搜索替换 Paddle 引用 | 1h |
| T-3 | Premium Gumroad 链接不一致 (4/6页面) | 支付到错误产品 | 统一为 `wehaix` | 30min |

### 🟡 High (重要)

| # | 债务项 | 影响 | 修复建议 | 预估工时 |
|---|--------|------|---------|---------|
| T-4 | 纳音计算 bug (engine.ts L157) | 所有八字结果纳音错误 | 使用 60 甲子对计算 | 2h |
| T-5 | 时辰双重计算冲突 | 时柱可能错误 | 统一使用 lunar-javascript API | 2h |
| T-6 | Blog fs.readFileSync 阻塞 | 高并发时请求延迟 | 迁移至 SSG / MDX | 4h |
| T-7 | 中文定价页功能列表英文 | 用户体验差 | 翻译 5 个功能项 | 30min |
| T-8 | Webhook plan 识别脆弱 | permalink 变更导致失败 | email + price 双重验证 | 1h |
| T-9 | Payment success 无限轮询 | 可能无限请求 | 限制最大重试次数 (10) | 30min |
| T-10 | /zh/ 镜像而非真正 i18n | 维护成本双倍 | 迁移至 next-intl | 8h |

### 🟢 Medium (优化)

| # | 债务项 | 影响 | 修复建议 | 预估工时 |
|---|--------|------|---------|---------|
| T-11 | TrigramLines 重复 ×3 | 维护成本高 | 提取为共享组件 | 2h |
| T-12 | Gumroad 链接重复 ×6 | 维护成本高 | 集中到 `constants/` | 1h |
| T-13 | 大量 `'use client'` 页面 | 首屏加载慢 | 更多 Server Components | 4h |
| T-14 | No CSP / security headers | 安全风险 | next.config.js headers | 30min |
| T-15 | 无错误边界 (error.tsx) | 崩溃时白屏 | 添加 global-error.tsx | 1h |
| T-16 | StarBackground 无 RAF throttle | 性能浪费 | 添加 requestIdleCallback | 1h |
| T-17 | Supabase 无 RLS 策略可见 | 数据安全未知 | 审计 Supabase 控制台 | 2h |
| T-18 | `next.config.js` 配置极简 | 缺少优化配置 | 添加 compiler/images/headers | 1h |

### 📊 Low (Nice to Have)

| # | 债务项 | 影响 | 修复建议 |
|---|--------|------|---------|
| T-19 | `react-hook-form` 未使用 | 依赖膨胀 | 移除或实际使用 |
| T-20 | 无 Sentry/错误监控 | 问题发现延迟 | 集成 Sentry Free tier |
| T-21 | Hardcoded 色值 #D4AF37 | 主题切换困难 | 使用 CSS 变量 |
| T-22 | 无 E2E 测试 | 回归风险 | Playwright |

---

## 六、Tech Lead 判断与修复优先级

### Phase 1 (立即 — 阻塞转化)
1. **T-2**: 移除所有 Paddle UI（8 处）— 1h
2. **T-3**: 统一 Premium Gumroad 链接 — 30min
3. **T-1**: 定价页加 Premium 卡片 — 1h

### Phase 2 (48h 内 — 核心功能正确性)
4. **T-4**: 纳音计算修复 — 2h
5. **T-5**: 时辰计算统一 — 2h
6. **T-7**: 中文定价页翻译 — 30min

### Phase 3 (本周 — 性能与可维护性)
7. **T-6**: Blog SSG 迁移 — 4h
8. **T-8**: Webhook plan 识别加固 — 1h
9. **T-12**: Gumroad 链接集中化 — 1h

### Phase 4 (本月 — 架构改进)
10. **T-10**: i18n 迁移 (next-intl) — 8h
11. **T-18**: next.config.js 完善 — 1h
12. **T-15**: 错误边界 + Sentry — 2h

---

## 七、总结

**[技术审计]** 代码健康度评分: **58/100**

- ✅ **安全**: P0 已修复，安全评分 82/100
- ⚠️ **功能正确性**: 纳音 bug + 时辰冲突，评分 45/100
- ⚠️ **性能**: Canvas 已优化，但 Blog SISR 和无缓存是瓶颈
- ⚠️ **可维护性**: 代码重复（TrigramLines ×3, Gumroad links ×6, Blog parser ×2）
- ❌ **可扩展性**: 内存限流、无索引、无 CDN 缓存，10K 用户需重构

**[技术审计]** 核心建议：先修功能正确性（纳音/时辰），再做性能优化，最后重构架构。不要跳过正确性直接做优化。
