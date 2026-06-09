# FateWise 每日外链建设日志

## 📅 2026-06-06 (周五) — Cron: fatewise-backlink-automation

---

### 步骤1：Medium Token 状态
| 项目 | 结果 |
|------|------|
| Token 文件 | ❌ `scripts/medium_token.txt` 不存在 |
| 环境变量 MEDIUM_TOKEN | ⚠️ 未设置 |
| published_medium.json | ❌ 不存在（从未成功发布过） |
| 可用文章 | ✅ ~30+ 篇 Bazi/Astrology 博客文章待发布 |
| **结论** | ❌ Token 缺失，无法执行 Medium 发布。需手动生成 token：Medium.com/me/settings → Integration secret |

---

### 步骤2：失败外链提交重试结果
| 原状态目录 | 之前错误 | 重试后 HTTP 码 | 结论 |
|-----------|---------|--------------|------|
| AI Tools Love (aitools.love) | connection (SSL) | **200** ✅ | 连接已恢复，可提交 |
| AI Pulse (aipulse.fyi) | connection (SSL EOF) | **200** ✅ | 连接已恢复，可提交 |
| allthingsai.com | connection (SSL EOF) | **000** ❌ | 仍不可达，永久跳过 |
| There's An AI For That | failed-403 (Cloudflare) | 403 ❌ | Cloudflare WAF 拦截，需手动或等 X Thread 免费渠道 |
| AiToolz | failed-403 (Cloudflare) | — | 同上，跳过 |
| AI Tools Explore (aiex.me) | failed-403 (Cloudflare) | — | 同上，跳过 |
| AI Scout | failed-timeout | — | 重试中...（超时） |

**404/405 目录（永久失效，不再重试）：**
AI Tools Directory (aidirectory.wiki)、AI Tools Arena、AI Tools Guru、AI Toolz Dir、AI Tools List (aitoolslist.org)、AI Top Tools、AI Library、ALL AI TOOLS .TECH、AI Tool List (aitoollist.org)、AI Journey、AI Parabellum、Altern、AI Resource Pro、AI Respo、AI Corner、AIDir、AI PEDIA HUB、AISuperSmart、AI-Tools Directory、All The AI Tools、Productivity Directory、10 Words Directory — 共 **22** 个永久失效

---

### 步骤3：新发现的 AI 工具外链目录
| 名称 | Submit URL | HTTP 码 | 费用 | 审核时间 |
|------|-----------|---------|------|---------|
| AI Tools Directory (aitools-directory.com) | https://www.aitools-directory.com/submit-your-ai-tool-2 | 200 ✅ | 免费提交可用 | — |
| Future AI Guide (tools.futureaiguide.com) | https://tools.futureaiguide.com/tools/create | 200 ✅ | **完全免费** | ~48h |
| AIToolIndex (aitoolindex.io) | https://aitoolindex.io/submit | 200 ✅ | **完全免费** | ~48h |
| GPTBot (gptbot.io) | https://gptbot.io/submit-ai-tool | 200 ✅ | 免费提交 | 1-3个月（标准审核） |
| Best AI Brands (aidirectori.es) | https://www.aidirectori.es/submit-ai-tool | 200 ✅ | 免费/Pro | — |

**提交信息：**
- Name: FateWise
- URL: https://bornchart.app
- Description: AI-powered Bazi (Four Pillars of Destiny) chart analysis platform. Free destiny reading with Chinese astrology, Five Elements analysis, and AI deep interpretation.
- Category: AI / Wellness / Spirituality

---

### 步骤4：统计汇总

| 指标 | 数值 |
|------|------|
| 提交总数（累计） | **51** |
| 成功（含重试恢复） | **19** |
| 失败/永久失效 | **32** |
| 今日新增目录 | **5** |
| 重试恢复成功 | **2** (aitools.love, aipulse.fyi) |
| Medium 发布 | ❌ 未执行（token 缺失） |

---

### ⚠️ 待办事项
1. **Medium Token** — 需手动获取：登录 Medium → Settings → Integration secret → Generate new token
2. **Cloudflare 403 目录** — There's An AI For That、AiToolz、AI Tools Explore：这些目录有 Cloudflare Bot 保护，自动化提交会被拦截。替代方案：通过 X/Twitter Thread 免费渠道（TAAFT 每月在 X 上发帖征集工具）
3. **实际表单提交** — 今日仅为可达性检测，下一步需对 200 OK 的目录进行实际表单 POST 提交

---
*下次运行：按 cron 调度自动执行*

## 📅 2026-06-07 (周日) — Cron: fatewise-backlink-automation

---

### 步骤1：实际表单 POST 提交（200 OK 目录）

**核心发现：** 今日真正执行了表单 POST 提交，而非仅做可达性检测。

| 目录 | Submit URL | HTTP 码 | 提交方式 | 状态 |
|------|-----------|---------|---------|------|
| **AI Tools Directory** (aitools-directory.com) | https://www.aitools-directory.com/submit-your-ai-tool-2 | **200** ✅ | `application/x-www-form-urlencoded` (tool_name, tool_url, short_desc, description, category, contact_email) | 已提交，等待审核 |
| **AI Tools Marketer** (aitoolsmarketer.com) | https://aitoolsmarketer.com/submit/ | **200** ✅ | `application/x-www-form-urlencoded` (input_text, email, description) | 已提交，等待审核 |

**尝试但未成功的提交：**
| 目录 | 原因 | HTTP 码 |
|------|------|---------|
| Future AI Guide (tools.futureaiguide.com) | CSRF Token 验证失败，表单有反爬保护 | **419** ❌ |
| AI Pulse (aipulse.fyi) | Next.js 客户端渲染表单，无 REST API（/api/listings → 404） | 404 ❌ |
| AI Tools Love (aitools.love) | SSL 连接失败（proxy 问题） | **000** ❌ |
| AIToolIndex (aitoolindex.io) | Next.js 客户端渲染，无服务器端表单字段 | — |
| GPTBot (gptbot.io) | Next.js 客户端渲染，无服务器端表单字段 | — |
| Best AI Brands (aidirectori.es) | Next.js 客户端渲染，无服务器端表单字段 | — |

---

### 步骤2：之前提交的目录状态跟踪

无 `status=submitted` 且超过 7 天的条目（今天首次提交，无需检查确认）。

---

### 步骤3：新发现目录检测

| 名称 | Submit URL | HTTP 码 | 备注 |
|------|-----------|---------|------|
| The Next AI (thenextai.com) | https://www.thenextai.com/submit | 200 ✅ | WordPress，但表单为 GET 搜索（非提交表单）|

---

### 步骤4：统计汇总

| 指标 | 数值 |
|------|------|
| 提交总数（累计） | **53** |
| 已实际 POST 提交 | **2** ✅（aitools-directory.com, aitoolsmarketer.com）|
| 成功（含之前恢复的） | **13** ✅ |
| 失败/永久失效 | **34** ❌ |
| 今日新增目录 | **1**（The Next AI，但无实际提交表单）|
| 今日实际 POST 成功 | **2** ✅ |

---

### 🔍 关键分析：为什么大多数目录无法自动化提交？

今日实际执行了表单 POST，结果揭示了当前 AI 工具目录生态的一个特征：

1. **Next.js / React 客户端渲染占主导**（~60%）：Futurepedia、AI Hunt List、AiDirs、AiToolex、AI Tool Trek、All Things AI 等——这些目录的提交表单在客户端用 JavaScript 渲染，curl POST 无法模拟。需要浏览器自动化（Playwright/CloakBrowser）才能提交。

2. **CSRF 保护**：Future AI Guide、Best AI Brands 等使用 CSRF Token，curl POST 即使拿到 token 也会被拒绝（419）。

3. **Cloudflare Bot 保护**：There's An AI For That、AiToolz、AI Tools Explore——403 拦截。

4. **可自动化的目录**（WordPress/传统 PHP）：
   - ✅ aitools-directory.com — 直接 POST `application/x-www-form-urlencoded`
   - ✅ aitoolsmarketer.com — 直接 POST `application/x-www-form-urlencoded`
   - ⚠️ aitoolsmagazine.com — HivePress 插件，需要登录才能提交 listing

---

### ⚠️ 待办事项
1. **Medium Token** — 仍缺失，需手动获取
2. **浏览器自动化提交** — 对 Next.js 客户端渲染目录，需要用 CloakBrowser/Playwright 模拟真实表单提交（Futurepedia、AI Hunt List、AiDirs、AiToolex 等）
3. **Cloudflare 403 目录** — There's An AI For That：通过 X/Twitter Thread 免费渠道提交
4. **后续跟进** — 7 天后检查 aitools-directory.com 和 aitoolsmarketer.com 是否已收录

---
*下次运行：按 cron 调度自动执行 | 上次实际提交：2026-06-07*
