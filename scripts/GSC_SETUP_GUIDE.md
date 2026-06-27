# GSC (Google Search Console) 域名验证 + API 接入指南

## 当前状态

| 项目 | 状态 |
|------|------|
| bornchart.app 域名 | ✅ 已在 Vercel 注册 |
| Vercel DNS 管理 | ✅ CLI 可用 (API Token: vcp_6Pj...) |
| GSC 域名验证 | ❌ 未完成 |
| GSC API 凭证 | ❌ 未创建 |
| 数据采集脚本 | ✅ 已创建 (gsc-data-collector.py) |

## 为什么需要手动操作

服务器位于中国大陆，Google 服务 (search.google.com, accounts.google.com, console.cloud.google.com) 无法直接访问。以下操作需要你在有网络访问权限的环境下完成。

---

## 第一步：在 GSC 添加 bornchart.app 域名

### 操作方式

1. **在有网络的环境打开**: https://search.google.com/search-console
2. 使用 Google 账号登录:
   - 邮箱: `selina_zxw@qq.com`
   - 密码: `selina110223`
3. 点击 **"添加属性"** (Add property)
4. 选择 **"域名"** (Domain) 选项卡
5. 输入: `bornchart.app`
6. 点击 **"继续"**

### 获取 DNS TXT 记录值

GSC 会生成一个类似这样的 TXT 记录值：
```
google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**请复制这个完整值**（以 `google-site-verification=` 开头），然后继续下一步。

---

## 第二步：在 Vercel DNS 添加 TXT 记录

### 方式 A：通过 Vercel CLI（推荐）

在服务器上的 ez-mystic 目录执行：

```bash
cd /home/zxw/.openclaw/workspace/ez-mystic

# 添加 DNS TXT 记录（将 YOUR-TXT-VALUE 替换为 GSC 提供的值）
vercel dns add bornchart.app "google-site-verification  TXT  YOUR-TXT-VALUE"
```

### 方式 B：通过 Vercel API

```bash
cd /home/zxw/.openclaw/workspace/ez-mystic

# 添加 TXT 记录
curl -X POST \
  -H "Authorization: Bearer vcp_6PjLobIZL5djytxWfjQw5gCpoGBEGg5evF8k8jdHkPfKIz4qgL06EVVZ" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "google-site-verification",
    "type": "TXT",
    "value": "YOUR-TXT-VALUE",
    "priority": 0
  }' \
  "https://api.vercel.com/v2/domains/bornchart.app/records?teamId=team_EMMUSDP2RAhZcduXrtSC80AB"
```

### 方式 C：通过 Vercel Dashboard

1. 打开 https://vercel.com/dashboard
2. 进入 ez-mystic 项目
3. 进入 **Settings → Domains**
4. 找到 bornchart.app，点击 **DNS**
5. 添加 TXT 记录

---

## 第三步：等待 GSC 验证

添加 DNS TXT 记录后，GSC 需要一定时间验证（通常 5 分钟到 24 小时）。

### 验证状态检查

在 GSC 页面点击 **"验证"** 按钮，或等待自动验证。

验证成功后，你会看到 bornchart.app 出现在你的 GSC 属性列表中。

---

## 第四步：创建 GCP Service Account

### 操作方式

1. 打开: https://console.cloud.google.com
2. 使用同一个 Google 账号登录
3. 创建新项目（或复用现有项目）:
   - 项目名称: `fatewise-gsc` 或 `ez-mystic`
   - 注意: **项目 ID**（如 `fatewise-gsc-123456`）需要记录下来

4. 启用 GSC API:
   - 进入 **API 和服务 → 库**
   - 搜索 "Search Console API"
   - 点击 **启用**

5. 创建 Service Account:
   - 进入 **IAM 和管理 → 服务账号**
   - 点击 **"创建服务账号"**
   - 名称: `gsc-data-collector`
   - 描述: `用于 GSC 数据自动采集`
   - 点击 **"创建并继续"**

6. 授予权限:
   - 角色: **Search Console Viewer** (搜索控制台查看者)
   - 点击 **"继续"** → **"完成"**

7. 创建密钥:
   - 在服务账号列表中找到 `gsc-data-collector`
   - 点击 → **密钥** → **添加密钥** → **创建新密钥**
   - 选择 **JSON** 格式
   - 点击 **"创建"**
   - JSON 文件会自动下载到本地

8. 将 Service Account 添加到 GSC:
   - 回到 GSC: https://search.google.com/search-console
   - 进入 bornchart.app 的设置（齿轮图标）
   - 进入 **用户权限**
   - 点击 **"添加用户"**
   - 输入 Service Account 的邮箱（如 `gsc-data-collector@fatewise-gsc-123456.iam.gserviceaccount.com`）
   - 选择 **所有者** 权限
   - 点击 **"添加"**

---

## 第五步：部署凭证到服务器

将下载的服务账号 JSON 文件上传到服务器：

```bash
# 方法 1: scp 上传
scp gsc-service-account.json zxw@3080Ti-pc:/home/zxw/.openclaw/workspace/ez-mystic/scripts/

# 方法 2: 直接粘贴内容
# 将 JSON 文件内容粘贴到以下文件
nano /home/zxw/.openclaw/workspace/ez-mystic/scripts/gsc-service-account.json
```

或者设置环境变量：
```bash
export GSC_CREDENTIALS=/home/zxw/.openclaw/workspace/ez-mystic/scripts/gsc-service-account.json
```

---

## 第六步：安装依赖并测试

```bash
cd /home/zxw/.openclaw/workspace/ez-mystic
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib

# 测试运行
python3 scripts/gsc-data-collector.py --days 28
```

### 预期输出

```
🔍 GSC 数据收集器
   站点: https://bornchart.app
   日期: 2026-05-27 → 2026-06-24
   维度: ['page']
   凭证: /path/to/gsc-service-account.json

📡 正在查询 GSC API...

============================================================
  GSC 数据摘要 (2026-05-27 → 2026-06-24)
============================================================
  总展示量 (Impressions):  1,234
  总点击量 (Clicks):       56
  整体 CTR:                4.54%
  平均排名 (Position):     28.50
  数据行数:                156
============================================================

✅ JSON 已保存: gsc-data-2026-05-27.json
```

---

## 使用方式

### 基础查询

```bash
# 最近 28 天，按页面维度
python3 scripts/gsc-data-collector.py

# 最近 7 天
python3 scripts/gsc-data-collector.py --days 7

# CSV 格式
python3 scripts/gsc-data-collector.py --format csv --output report.csv
```

### 多维度查询

```bash
# 按页面 + 国家 + 设备
python3 scripts/gsc-data-collector.py --dimension page country device

# 按关键词
python3 scripts/gsc-data-collector.py --dimension query

# 按搜索外观
python3 scripts/gsc-data-collector.py --dimension searchAppearance
```

### 关键词过滤

```bash
# 只查询特定关键词
python3 scripts/gsc-data-collector.py --dimension query --keywords "八字,命理,运势,星座"
```

### 生成日报

```bash
python3 scripts/gsc-data-collector.py --report
```

---

## 接入每日报告系统

### 方案 A：Cron 定时任务

```bash
# 添加到 crontab
crontab -e

# 每天上午 9 点运行
0 9 * * * cd /home/zxw/.openclaw/workspace/ez-mystic && python3 scripts/gsc-data-collector.py --report >> logs/gsc-daily.log 2>&1
```

### 方案 B：OpenClaw Cron 任务

```bash
# 创建 OpenClaw cron 任务（需用户确认）
# 每天 9:00 自动采集 GSC 数据并生成报告
```

### 方案 C：Vercel Post-Deploy Hook

在 Vercel 项目的 post-deploy hook 中集成 GSC 数据采集，每次部署后自动更新。

---

## 常见问题

### Q: GSC 验证一直失败？
A: 确保 TXT 记录完全正确（包括 `google-site-verification=` 前缀）。等待 DNS 传播（通常 5-30 分钟）。可以在 [DNS Checker](https://dnschecker.org) 上验证 TXT 记录是否生效。

### Q: API 返回 "accessDenied"？
A: 确认 Service Account 已添加到 GSC 属性中，并且权限设置为 "所有者"。

### Q: 没有数据返回？
A: 新验证的站点需要 48-72 小时才会积累数据。如果域名已经验证很久但没有数据，检查:
- 站点 URL 是否完全匹配（https://bornchart.app vs bornchart.app）
- sitemap.xml 是否已提交到 GSC

### Q: API 限流怎么办？
A: 脚本已内置重试机制。GSC API 每日限额 10,000 次查询，正常使用不会触顶。

---

## 下一步

完成以上步骤后，我可以:
1. ✅ 配置 OpenClaw Cron 定时任务自动采集
2. ✅ 将采集数据接入 FateWise 日报系统
3. ✅ 创建数据可视化报告
4. ✅ 设置异常告警（流量骤降等）
