# GSC 每日数据采集脚本

## 概述

`gsc_scraper.py` 通过 Chrome CDP 连接 GSC Web UI，抓取指定日期的单日性能数据（点击数、展示量、CTR、平均排名），并 UPSERT 到 Supabase 数据库。

## 核心改进（vs 旧版 gsc-data-collector.py）

| 特性 | 旧版 (API) | 新版 (CDP) |
|------|-----------|-----------|
| 数据粒度 | 28天汇总 | 单日 |
| 依赖 | GCP Service Account | Chrome 浏览器 + 已登录 GSC |
| 写入 | 无 | Supabase UPSERT |
| 趋势追踪 | ❌ 每天相同数据 | ✅ 真实日趋势 |

## 前置准备

### 1. 安装依赖

```bash
pip3 install --break-system-packages websocket-client
```

### 2. 启动 Chrome 远程调试

```bash
google-chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check &
```

### 3. 登录 GSC

在 Chrome 中打开 https://search.google.com/search-console 并登录账号。

### 4. 创建 Supabase 表

```bash
cd /home/zxw/.openclaw/workspace/ez-mystic
python3 scripts/gsc_scraper.py --create-table
```

或直接执行 SQL：
```bash
psql -h xgaxejeaxfhlupguqteu.supabase.co -U postgres -d postgres -f scripts/gsc_table.sql
```

### 5. 配置环境变量（可选）

```bash
export SUPABASE_URL="https://xgaxejeaxfhlupguqteu.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

## 使用方式

### 基本用法

```bash
# 抓取昨天数据（默认）
python3 scripts/gsc_scraper.py

# 抓取指定日期
python3 scripts/gsc_scraper.py 2026-06-28

# 指定域名
python3 scripts/gsc_scraper.py 2026-06-28 --domain bornchart.app

# 指定 Chrome CDP 地址
python3 scripts/gsc_scraper.py 2026-06-28 --cdp ws://127.0.0.1:9222
```

### 定时任务

添加到 crontab (`crontab -e`)：

```bash
# 每天 07:00 抓取昨天的 GSC 数据
0 7 * * * cd /home/zxw/.openclaw/workspace/ez-mystic && python3 scripts/gsc_scraper.py >> /tmp/gsc_scraper.log 2>&1
```

## Supabase 表结构

```sql
CREATE TABLE gsc_data (
    id            SERIAL PRIMARY KEY,
    date          DATE NOT NULL,
    domain        VARCHAR(255) NOT NULL DEFAULT 'bornchart.app',
    clicks        INTEGER DEFAULT 0,
    impressions   INTEGER DEFAULT 0,
    ctr           DECIMAL(10,6),
    avg_position  DECIMAL(10,2),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (date, domain)
);
```

## UPSERT 逻辑

1. 查询 Supabase：`SELECT * FROM gsc_data WHERE date = ? AND domain = ?`
2. 如果记录存在 → `PATCH` 更新（`updated_at` 自动更新）
3. 如果记录不存在 → `POST` 插入

## 错误处理

| 场景 | 行为 |
|------|------|
| Chrome 未启动 | 报错退出，提示启动 Chrome |
| GSC 未登录 | 数据提取失败，返回空结果 |
| 数据为空 | 记录 0 值，不中断流程 |
| Supabase 表不存在 | 提示建表 SQL，不写入 |
| 网络超时 | 重试 3 次后报错 |

## 注意事项

- ⚠️ GSC 数据有 3-5 天延迟，无法抓取昨天的实时数据
- ⚠️ Chrome 必须已登录 GSC 账号
- ⚠️ Chrome 必须以 `--remote-debugging-port=9222` 启动
- ⚠️ GSC UI 结构变更可能需要更新选择器
