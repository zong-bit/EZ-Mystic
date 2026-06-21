# FateWise 支付链路端到端审计报告

**审计日期**: 2026-06-22  
**项目**: /home/zxw/.openclaw/workspace/ez-mystic (bornchart.app)  
**审计范围**: Lucky Tools → Gumroad 支付跳转 / Gumroad Webhook → Pro 解锁 / 定价页渲染状态

---

## 链路 1: Lucky Tools 结果页 → Gumroad 支付页跳转

### ✅ 合盘页 (compatibility)
- **文件**: `app/compatibility/page.tsx` 第 495 行
- **CTA**: `href="/pricing"` — 正确跳转到定价页
- **状态**: ✅ 正常

### ⚠️ 每日运势页 (daily)
- **文件**: `app/daily/page.tsx`
- **CTA**: 无任何 Gumroad/Paddle 购买链接或 CTA
- **状态**: ⚠️ 有风险 — 页面未引导用户升级 Pro

### ❌ 每日幸运页 (luck)
- **文件**: `app/luck/page.tsx`
- **CTA**: 无任何 Gumroad/Paddle 购买链接或 CTA
- **状态**: ❌ 有 bug — 页面使用 Mock 数据，无任何购买引导

### ❌ 支付页 (payment) — Paddle 按钮仍可见
- **文件**: `app/payment/page.tsx` 第 59 行、第 100 行
- **问题**: Pro 和 Premium 两个卡片均显示 "Pay with Paddle →" 按钮
- **链接**: `https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b` (Pro)
- **状态**: ❌ **阻塞性 bug** — Paddle 已废弃但按钮仍渲染

### ❌ 支付计划页 (payment/[plan]) — Paddle 选择器仍可见
- **文件**: `app/payment/[plan]/page.tsx` 第 109-142 行
- **问题**: 用户可在 Gumroad/Paddle 之间切换，Paddle 按钮可点击
- **默认选中**: Gumroad（L76 `useState<'gumroad' | 'paddle'>('gumroad')`）
- **状态**: ❌ **阻塞性 bug** — 用户可误选 Paddle

### ⚠️ Gumroad 链接不一致 — Premium 产品 ID 错误
- **定价页** (`app/pricing/page.tsx` L7): Premium 年付链接 `https://selinazw.gumroad.com/l/wejaix`
- **支付页** (`app/payment/page.tsx` L9): Premium 年付链接 `https://selinazw.gumroad.com/l/gebxj`
- **支付计划页** (`app/payment/[plan]/page.tsx` L9): Premium 年付链接 `https://selinazw.gumroad.com/l/gebxj`
- **中文定价页** (`app/zh/pricing/page.tsx` L6): Premium 年付链接 `https://selinazw.gumroad.com/l/wejaix` ✅
- **中文支付页** (`app/zh/payment/page.tsx` L9): Premium 年付链接 `https://selinazw.gumroad.com/l/gebxj` ❌
- **中文支付计划页** (`app/zh/payment/[plan]/page.tsx` L9): Premium 年付链接 `https://selinazw.gumroad.com/l/gebxj` ❌
- **Webhook 识别** (`app/api/gumroad-webhook/route.ts` L41): `wejaix → pro-yearly`, `gebxj → premium-lifetime`
- **状态**: ⚠️ 高风险 — 4/6 个支付页面使用错误的 Premium 链接 (`gebxj` 而非 `wejaix`)

---

## 链路 2: Gumroad Webhook → Supabase → Pro 解锁回写

### ✅ Webhook 签名验证
- **文件**: `app/api/gumroad-webhook/route.ts` 第 17-30 行
- **逻辑**: HMAC-SHA256 签名验证，Secret 未配置时拒绝所有请求
- **状态**: ✅ 正常（P0 已加固）

### ✅ 幂等性检查
- **文件**: `app/api/gumroad-webhook/route.ts` 第 36-40 行
- **逻辑**: 查询 `gumroad_sales` 表，重复 sale_id 跳过处理
- **状态**: ✅ 正常

### ✅ Token 创建流程
- **文件**: `app/api/gumroad-webhook/route.ts` 第 78-80 行
- **逻辑**: `createFatewiseToken(planId, email)` → 写入 `tokens` 表
- **状态**: ✅ 正常

### ⚠️ Plan 识别逻辑依赖 Gumroad permalink
- **文件**: `app/api/gumroad-webhook/route.ts` 第 32-44 行
- **逻辑**: `detectFatewisePlan()` 通过 `productName/permalink/variant` 字段匹配
- **映射**:
  - `gebxj` / `ultimate` → `premium-lifetime`
  - `wehaix` → `pro-yearly`
  - 默认 → `pro-monthly` (lcrujk)
- **问题**: 如果 Gumroad 产品名称变更或 permalink 不在 payload 中，plan 识别可能失败
- **状态**: ⚠️ 有风险 — permalink 匹配脆弱，建议增加 email + price 双重验证

### ✅ Refund 处理
- **文件**: `app/api/gumroad-webhook/route.ts` 第 53-74 行
- **逻辑**: 标记 `gumroad_sales.refunded = true`，撤销推荐奖励
- **状态**: ✅ 正常

### ⚠️ Supabase 客户端类型转换
- **文件**: `app/api/gumroad-webhook/route.ts` 第 84-91 行
- **问题**: `insertResult.error` 后未 return，继续执行
- **文件**: `app/api/gumroad-claim/route.ts` 第 23-26 行
- **问题**: `as unknown as GumroadSale` — 强制类型转换绕过类型检查
- **状态**: ⚠️ 有风险 — 数据库写入失败时 webhook 仍返回 200

### ✅ Token 验证流程 (verify)
- **文件**: `app/api/gumroad-verify/route.ts`
- **逻辑**: token → 查 `tokens` 表 / order_id → 查 `gumroad_sales` 表 → 查 `tokens` 表
- **状态**: ✅ 正常

### ✅ Token Claim 流程 (claim)
- **文件**: `app/api/gumroad-claim/route.ts`
- **逻辑**: 查找 sale → 验证 token → 链接到用户 → 创建/更新 subscription
- **状态**: ✅ 正常

### ⚠️ Payment Success 页轮询逻辑
- **文件**: `app/payment/success/page.tsx` 第 27-43 行
- **问题**: `setTimeout(checkToken, 3000)` 轮询，最多不限制重试次数
- **状态**: ⚠️ 有风险 — 无最大重试次数，可能导致无限轮询

### ✅ Auth Context
- **文件**: `app/auth/auth-context.tsx`
- **问题**: 仅管理 Supabase Auth，**不读取 Pro/Premium 订阅状态**
- **影响**: 用户是否 Pro 的逻辑分散在各页面自行查询 `gumroad_sales` 或 `tokens` 表
- **状态**: ⚠️ 有风险 — 无统一的 Pro 状态管理

---

## 链路 3: 定价页渲染状态 vs 产品策略

### ❌ Premium ($29.99) 层级完全缺失
- **文件**: `app/pricing/page.tsx`
- **当前渲染**: Free ($0) / Pro Monthly ($9.99) / Pro Yearly ($79.99)
- **策略要求**: Free ($0) / Pro ($9.99) / Premium ($29.99)
- **问题**: 
  - 第 3 张卡片是 "Pro Yearly" ($79.99) 而非 "Premium" ($29.99)
  - 支付页 (`app/payment/page.tsx`) 中 Premium 卡片描述 "One-time payment" $29.99
  - 但 Gumroad 链接指向 `gebxj` (lifetime)，而非 $29.99 产品
- **状态**: ❌ **阻塞性 bug** — 定价层级与策略严重不符

### ⚠️ Chinese Pricing 页面功能列表为英文
- **文件**: `app/zh/pricing/page.tsx` 第 112-120 行
- **问题**: Pro Yearly 卡片的 5 个功能列表全部为英文，未翻译
- **状态**: ⚠️ 有风险 — 中文用户看到英文功能列表

### ❌ Paddle 残留遍布所有支付相关页面
- **文件**: `app/payment/page.tsx` — Paddle 按钮 ×2 (L59, L100) + "Powered by Gumroad & Paddle" ×2 (L122, L160)
- **文件**: `app/payment/[plan]/page.tsx` — Paddle 选择器 (L109-142) + "Powered by Gumroad & Paddle" ×2 (L155, L216)
- **文件**: `app/zh/pricing/page.tsx` — Paddle URL 常量 (L8-9) + "Powered by Gumroad & Paddle" (L223)
- **文件**: `app/zh/payment/page.tsx` — Paddle 按钮 ×2 (L59, L100) + "由 Gumroad 和 Paddle 提供支持" ×2 (L122, L160)
- **文件**: `app/zh/payment/[plan]/page.tsx` — Paddle 选择器 (L109-142) + "由 Gumroad 和 Paddle 提供技术支持" ×2 (L155, L216)
- **文件**: `app/pricing/page.tsx` — Paddle URL 常量 (L9) + "Powered by Gumroad & Paddle" (L214)
- **文件**: `app/page.tsx` — "Secure payment via Gumroad & Paddle" (L439)
- **状态**: ❌ **阻塞性 bug** — Paddle 已废弃但 UI 中大量残留

### ⚠️ Chinese Pricing 年付标签错误
- **文件**: `app/zh/pricing/page.tsx` 第 104 行
- **问题**: "Pro" 标签（年付卡片），与英文定价页一致，但策略中年付应属于 Pro 层级
- **状态**: ⚠️ 低风险 — 取决于最终产品策略

---

## 问题汇总

### 🔴 Critical (阻塞)

| # | 问题 | 文件 | 行号 | 影响 |
|---|------|------|------|------|
| C-1 | Premium 定价层级缺失 | `app/pricing/page.tsx` | 全页 | $29.99 Premium 未渲染，用户无法购买 |
| C-2 | Paddle 按钮仍可见 (英文支付页) | `app/payment/page.tsx` | L59, L100 | 用户可点击已废弃的支付渠道 |
| C-3 | Paddle 选择器仍可见 (英文计划页) | `app/payment/[plan]/page.tsx` | L109-142 | 用户可切换至已废弃的支付渠道 |
| C-4 | Paddle 按钮仍可见 (中文支付页) | `app/zh/payment/page.tsx` | L59, L100 | 中文用户可点击已废弃的支付渠道 |
| C-5 | Paddle 选择器仍可见 (中文计划页) | `app/zh/payment/[plan]/page.tsx` | L109-142 | 中文用户可切换至已废弃的支付渠道 |
| C-6 | Premium Gumroad 链接错误 (4/6 页面) | `app/payment/page.tsx` L9, `[plan]/page.tsx` L9, `zh/payment/page.tsx` L9, `zh/payment/[plan]/page.tsx` L9 | — | 用户点击 Premium 购买按钮跳转到错误的产品 (`gebxj` 而非 `wehaix`) |

### 🟡 High (重要)

| # | 问题 | 文件 | 行号 | 影响 |
|---|------|------|------|------|
| H-1 | 中文定价页功能列表为英文 | `app/zh/pricing/page.tsx` | L112-120 | 中文用户看到英文功能列表 |
| H-2 | Lucky Tools 页面无 CTA | `app/daily/page.tsx`, `app/luck/page.tsx` | — | 无法引导用户升级 |
| H-3 | Webhook plan 识别仅依赖 permalink | `app/api/gumroad-webhook/route.ts` | L32-44 | permalink 变更导致 plan 识别失败 |
| H-4 | Payment success 页无限轮询 | `app/payment/success/page.tsx` | L27-43 | 无最大重试次数 |
| H-5 | Auth context 不管理 Pro 状态 | `app/auth/auth-context.tsx` | — | 无统一的 Pro 状态管理 |
| H-6 | Paddle URL 常量残留 (定价页 + 首页) | `app/pricing/page.tsx` L9, `app/page.tsx` L439 | — | 未执行的死代码但误导 |

### 🟢 Medium (优化)

| # | 问题 | 文件 | 行号 | 影响 |
|---|------|------|------|------|
| M-1 | Supabase 类型强制转换 | `app/api/gumroad-claim/route.ts` L26 | `as unknown as GumroadSale` | 类型安全缺失 |
| M-2 | Webhook insert 失败未 return | `app/api/gumroad-webhook/route.ts` L84-91 | — | 静默失败 |
| M-3 | Lucky Tools (luck) 使用 Mock 数据 | `app/luck/page.tsx` | — | 无真实数据支撑 |

---

## 修复优先级

### Phase 1 (立即 — 阻塞转化)
1. **C-2/C-3/C-4/C-5**: 移除所有 Paddle 按钮和选择器（8 处）
2. **C-6**: 统一 Premium Gumroad 链接为 `wehaix`（修正 4 处错误链接）
3. **C-1**: 定价页增加 Premium ($29.99) 卡片

### Phase 2 (24h 内)
4. **H-1**: 翻译中文定价页功能列表
5. **H-3**: Webhook plan 识别增加 email + price 双重验证
6. **H-4**: Payment success 页限制最大轮询次数 (10 × 3s = 30s)

### Phase 3 (本周)
7. **H-2**: 每日运势/幸运页添加 CTA
8. **H-5**: Auth context 增加 Pro status 管理
9. **M-1/M-2**: 类型安全和错误处理

---

## 整体风险评估

**支付链路通畅度: 40/100** ⚠️

- ✅ Webhook 签名验证和幂等性正确
- ✅ Token 创建/验证/Claim 流程完整
- ❌ **Paddle UI 残留导致用户可能选择已废弃的支付渠道**
- ❌ **Premium ($29.99) 层级未渲染，定价层级与策略不符**
- ❌ **4/6 个支付页面 Premium 链接指向错误的 Gumroad 产品**
- ⚠️ 中文定价页功能列表未翻译

**阻塞结论**: C-1, C-2, C-3, C-4, C-5, C-6 必须在上线前修复，否则：
1. 用户可能点击 Paddle 按钮 → 404/错误支付页面
2. Premium ($29.99) 用户无法找到购买入口
3. Premium 用户点击付费按钮 → 跳转到错误的 Gumroad 产品
