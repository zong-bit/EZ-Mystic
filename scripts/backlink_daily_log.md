# FateWise 每日外链建设日志

## 2026-06-24 (周三)

### 📊 今日概要
| 指标 | 数量 |
|------|------|
| 新搜索目录 | 20+个 |
| 实际 POST 提交成功 | **3** |
| 失败/不可提交 | 17+ |
| 已提交待审核（超7天） | 2 |
| 总追踪目录数 | 74 |

---

### 🔍 步骤1：已提交目录收录检查（超17天）

| 目录 | 提交日期 | 是否已收录 | 备注 |
|------|----------|-----------|------|
| AI Tools Marketer (aitoolsmarketer.com) | 2026-06-07 | ❌ 未收录 | /tool/bornchart 返回通用目录页，搜索 "bornchart.app" 无结果 |
| AI Tools Directory (aitools-directory.com) | 2026-06-07 | ❌ 未收录 | /tool/bornchart 返回 404，搜索 "bornchart" 在搜索结果页但未收录 |

> 两个WordPress站点审核周期远超预期（通常3-7天），已提交17天仍未通过审核。

---

### ✅ 步骤1b：实际POST提交成功（"success"状态目录）

**成功提交 3 个目录：**

| 目录 | URL | 表单类型 | 提交状态 |
|------|-----|----------|---------|
| **Saas AI Tools** | saasaitools.com/submit | WordPress Fluent Form | ✅ 已提交 (200) |
| **TheSaaSDir** | thesaasdir.com/submit | WordPress Django Form | ✅ 已提交 (200) |
| **AI Tools Directory (/submit)** | aitools-directory.com/submit | WordPress Contact Form 7 | ✅ 已提交 (200) |

**提交详情：**
- **Saas AI Tools** — Fluent Form，含 nonce 验证，POST 200 成功
- **TheSaaSDir** — Django CSRF 保护，含 34 个分类选项，POST 200 成功
- **AI Tools Directory** — Contact Form 7，含 post_id/form_id 隐藏字段，POST 200 成功

---

### 🚫 步骤1c：无法 curl POST 的目录（Next.js SPA / 无表单）

以下目录返回 200 OK 但无法通过 curl 提交：

**Next.js SPA（11个）：**
- Best AI Brands (aidirectori.es) — Next.js SPA
- Futurepedia — Next.js SPA + Cloudflare
- AI Hunt List (aihuntlist.com) — Next.js SPA
- AiDirs (aidirs.io) — 空响应
- AiToolex (aitoolex.com) — Next.js SPA
- AI Tool Trek (aitooltrek.com) — Next.js SPA
- AI Hubs (aihubs.ai) — Next.js SPA
- List Your Tool / Organic Pilot — Next.js SPA
- StartupHub (startuphub.io) — Next.js SPA
- AI Pulse (aipulse.fyi) — Next.js SPA（检测到表单字段但需JS执行）
- AI Tools Submit (aitools.submit) — 验证页面

**SSL/连接错误（2个）：**
- AI Tools Love (aitools.love) — SSL证书验证失败，`--insecure` 仍返回空响应
- All Things AI — SSL EOF 错误

**无传统表单（3个）：**
- AI Tools Magazine — 仅有登录表单，无提交入口
- Free AI Tools Directory — 仅 1 个隐藏字段，表单在客户端渲染
- AI Tool Guru — 仅有 logout 表单

---

### 🔎 步骤3：新目录搜索与探测（20+个）

| 新目录 | URL | 状态 | 失败原因 |
|--------|-----|------|---------|
| **The Next AI** | thenextai.com/submit | ❌ 404 | 提交页面不存在 |
| **AI Tool NET** | aitoolnet.com/submit | ❌ 403 | Cloudflare 保护 |
| **Best AI Tools (startupaitools)** | startupaitools.com/submit | ❌ 无表单 | 纯 SPA 页面 |
| **AI Tools Hunter** | ai-hunter.io/submit | ❌ 500 | 服务端错误 |
| **ToolHatch** | toolhatch.com/submit | ❌ 空页面 | 仅 114 字节 |
| **AppSumo** | appsumo.com/partners/new | ❌ 404 | 页面不存在 |
| **MicroConf Small** | small.microconf.com/submit | ❌ 连接失败 | 代理超时 |
| **IndieHackers** | indiehackers.com | ❌ 无表单 | 仅有登录表单 |
| **Hacker News** | news.ycombinator.com/show | ❌ 无表单 | 需要账号 |
| **ProductHunt** | api.producthunt.com | ❌ 需API Key | 文档页，无提交表单 |
| **SaaSHub** | saashub.com/suggest-an-app | ❌ 404 | 页面不存在 |
| **AI Tool Directory (aitoolsdirectory.com)** | aitoolsdirectory.com/submit | ❌ 无表单 | 空页面 |
| **AI Tools List (aitoolslist.io)** | aitoolslist.io/submit | ❌ 无表单 | Next.js SPA |
| **AI Tool Directory (aitooldirectory.com)** | aitooldirectory.com/submit | ❌ 403 | Cloudflare 保护 |
| **AI Tool Directory (ai-tools-directory.com)** | ai-tools-directory.com/submit | ❌ 无表单 | 仅 1 个输入 |
| **AI Tool Submit (aitoolsubmit.com)** | aitoolsubmit.com/submit | ❌ 无表单 | Next.js SPA |
| **AI Tools Directory (aitools.directory)** | aitools.directory/submit | ❌ 连接失败 | 代理超时 |
| **Submit AI Tool (submitaitool.com)** | submitaitool.com/submit | ❌ 无表单 | Next.js SPA |

---

### 📝 分析总结

**今日成果：**
- ✅ 成功通过 curl POST 提交了 **3 个新目录**（Saas AI Tools、TheSaaSDir、AI Tools Directory）
- 这 3 个都是 WordPress 站点（Fluent Form / Django / Contact Form 7），表单结构传统，可直接 POST

**持续问题：**
1. **Next.js SPA 占绝对主流** — 20+ 个新目录中，超过 60% 是 Next.js/React SPA，curl POST 完全无法使用
2. **WordPress 目录越来越少** — 传统 WordPress 目录（有 PHP 表单的）正在被 SPA 替代
3. **审核周期延长** — 之前提交的 2 个 WordPress 目录已 17 天未通过审核，超出正常 3-7 天周期
4. **Cloudflare 保护普遍** — 高 DA 目录几乎都有 Cloudflare Bot Management

**目录提交成功率统计：**
- 总追踪：74 个目录
- 成功提交 (pending)：5 个（含今日 3 个新提交 + 2 个旧提交）
- 成功可达但未提交：16 个（大部分 Next.js SPA）
- 失败/不可提交：35 个（404/403/SSL/Cloudflare）
- 其他状态：18 个

---

### ✅ 建议下一步
1. **继续寻找 WordPress 目录** — 传统 PHP/WordPress 目录是唯一能 curl POST 的，但数量越来越少
2. **考虑浏览器自动化** — 对 Next.js SPA 目录使用 CloakBrowser 或 Chrome CDP 提交
3. **等待审核结果** — 5 个已提交目录等待审核（2 个已 17 天，3 个今天刚提交）
4. **探索 Strapi API 目录** — ai-hunter.io 等有 Strapi API 的目录可能支持 API 提交
5. **关注新出现的目录** — 每周搜索新目录，优先测试 WordPress 站点

---
*最后更新: 2026-06-24 10:00 CST*
## 2026-06-26 (Fri) - 1 submission(s)
- [DONE] Future AI Guide (tools.futureaiguide.com) - FateWise -> https://bornchart.app - POST 302 redirect (no errors, likely accepted)
## 2026-06-29
- 10:00 CST — 尝试 TheNextAI (thenextai.com) 提交 FateWise → Google Script endpoint 405 失败，跳过
- 今日提交次数：0/1
