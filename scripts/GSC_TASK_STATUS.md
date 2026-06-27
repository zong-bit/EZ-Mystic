# FateWise GSC 验证与 API 接入 - 任务状态

## 完成项 ✅

### 1. 环境准备
- ✅ Chrome CDP 环境确认 (127.0.0.1:9222, Chrome 149)
- ✅ Vercel CLI 认证 (zong-bit)
- ✅ Vercel API Token 获取
- ✅ bornchart.app DNS 记录查询 (6 条现有记录)
- ✅ Python 依赖安装 (google-api-python-client, google-auth 等)

### 2. 脚本开发
- ✅ `scripts/gsc-data-collector.py` - 完整的数据采集脚本
  - 支持多维度查询 (page, query, country, device, searchAppearance)
  - 支持日期范围自定义
  - 支持 JSON/CSV 输出
  - 内置 API 限流重试机制
  - 日报格式输出支持
  - 关键词过滤功能

- ✅ `scripts/GSC_SETUP_GUIDE.md` - 完整的手动操作指南

### 3. Vercel DNS 管理
- ✅ 确认 bornchart.app 已在 Vercel 注册
- ✅ 确认 Vercel API 可管理 DNS 记录（通过 team scope）
- ✅ 现有 DNS 记录清单已获取

## 待用户操作项 ⚠️

### Step 1: GSC 域名验证（必须手动）
**原因**: 服务器在中国大陆，无法访问 Google 服务

**你需要做的**:
1. 在有网络的环境打开 https://search.google.com/search-console
2. 用 `selina_zxw@qq.com` 登录
3. 添加域名属性 `bornchart.app`
4. 复制 GSC 生成的 DNS TXT 记录值
5. 将 TXT 值发给我，我来添加到 Vercel DNS

### Step 2: GCP Service Account 创建（必须手动）
**原因**: 需要在 Google Cloud Console 创建服务账号

**你需要做的**:
1. 打开 https://console.cloud.google.com
2. 创建项目 → 启用 Search Console API
3. 创建 Service Account → 授予 Search Console Viewer 角色
4. 创建 JSON 密钥并下载
5. 将 Service Account 邮箱添加到 GSC 用户权限（所有者）
6. 将 JSON 密钥文件上传到服务器

### Step 3: 验证测试
**完成后我自动执行**:
1. 测试 API 连接
2. 拉取数据验证
3. 配置定时任务

## 技术细节

### 现有 DNS 记录 (bornchart.app)
| ID | 类型 | 名称 | 值 |
|----|------|------|-----|
| rec_e4df39dd | ALIAS | (root) | e46b84adaa693ca2.vercel-dns-017.com |
| rec_13f8ac8d | ALIAS | * | cname.vercel-dns-017.com |
| rec_f8856984 | CNAME | _domainconnect | _domainconnect.vercel-dns.com |
| rec_fdc21ca8 | CAA | (root) | 0 issue "sectigo.com" |
| rec_40c1215e | CAA | (root) | 0 issue "letsencrypt.org" |
| rec_af8f0f96 | CAA | (root) | 0 issue "pki.goog" |

### Vercel 项目信息
- 项目 ID: prj_YOp1pbG6Qrj1YG6OAL2zGz6nNjqQ
- 团队 ID: team_EMMUSDP2RAhZcduXrtSC80AB
- 域名: bornchart.app (第三方注册商)

### 脚本使用示例
```bash
cd /home/zxw/.openclaw/workspace/ez-mystic

# 基础查询
.venv/bin/python3 scripts/gsc-data-collector.py

# 指定维度
.venv/bin/python3 scripts/gsc-data-collector.py --dimension page country device

# CSV 输出
.venv/bin/python3 scripts/gsc-data-collector.py --format csv --output report.csv

# 日报格式
.venv/bin/python3 scripts/gsc-data-collector.py --report
```

### 下一步
等待用户提供:
1. GSC TXT 验证记录值
2. GCP Service Account JSON 密钥

收到后即可在 5 分钟内完成全部配置并测试运行。
