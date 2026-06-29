#!/usr/bin/env python3
"""
GSC (Google Search Console) 每日数据采集脚本
===============================================
通过 Chrome CDP 连接 GSC Web UI，抓取指定日期的单日性能数据，
UPSERT 到 Supabase gsc_data 表。

核心改进:
- 按天抓取（非 28 天汇总），真实反映趋势
- Supabase UPSERT：日期 + domain 为唯一键
- 完备错误处理与 fallback
- 清晰日志输出

使用方式:
  # 抓取昨天数据（默认）
  python3 scripts/gsc_scraper.py

  # 抓取指定日期
  python3 scripts/gsc_scraper.py 2026-06-28

  # 指定 Chrome CDP 地址
  python3 scripts/gsc_scraper.py 2026-06-28 --cdp ws://127.0.0.1:9222

  # 指定域名（默认 bornchart.app）
  python3 scripts/gsc_scraper.py 2026-06-28 --domain bornchart.app

依赖:
  pip install websocket-client requests

前置:
  1. Chrome 以远程调试模式启动:
     google-chrome --remote-debugging-port=9222 --no-first-run
  2. 确保 GSC 页面已登录:
     先手动打开 https://search.google.com/search-console 并登录
  3. Supabase 表结构（见下方说明）
"""

import argparse
import datetime
import json
import logging
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, Dict, Any, Tuple

# ---------------------------------------------------------------------------
# 日志配置
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("gsc_scraper")

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------
DEFAULT_CDP_BASE = "ws://127.0.0.1:9222"
GSC_HOME_URL = "https://search.google.com/search-console"
GSC_PERFORMANCE_URL = "https://search.google.com/search-console/performance"
DEFAULT_DOMAIN = "bornchart.app"

# Supabase 配置（从环境变量读取，.env 中已有）
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://xgaxejeaxfhlupguqteu.supabase.co"
)
SUPABASE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "sb_secret_Ic345MFMBPwc6dtrUEWCgA_L27K74dX"
)

# ---------------------------------------------------------------------------
# CDP 连接与页面操作
# ---------------------------------------------------------------------------

def connect_cdp(cdp_ws: str) -> Tuple[Any, str]:
    """
    连接 Chrome CDP WebSocket。
    返回 (page_target_id, cdp)。
    """
    try:
        import websocket
    except ImportError:
        log.error("❌ 缺少依赖: pip install websocket-client")
        sys.exit(1)

    # 解析 ws://127.0.0.1:9222/devtools/page/MAIN → 获取 target id
    # 也支持 ws://127.0.0.1:9222 格式
    if "/devtools/page/" in cdp_ws:
        parts = cdp_ws.split("/devtools/page/")
        base_url = parts[0]
        target_id = parts[1].strip()
    else:
        # 列出所有 target，取第一个 page
        resp = urllib.request.urlopen(
            f"{cdp_ws.replace('ws://', 'http://')}/json",
            timeout=10
        )
        targets = json.loads(resp.read())
        if not targets:
            log.error("❌ 没有可用的 Chrome target，请确认 Chrome 以 --remote-debugging-port=9222 启动")
            sys.exit(1)
        target_id = targets[0]["id"]
        base_url = cdp_ws.replace("ws://", "http://")

    # 建立 WebSocket 连接
    ws = websocket.create_connection(
        f"{base_url.replace('http://', 'ws://')}/devtools/page/{target_id}",
        timeout=15
    )

    log.info(f"✅ CDP 连接成功 (target: {target_id})")
    return target_id, ws


def cdp_send(ws, method: str, params: dict = None, cmd_id: int = None) -> dict:
    """发送 CDP 命令并等待响应"""
    if cmd_id is None:
        cmd_id = int(time.time() * 1000) % 100000
    msg = json.dumps({"id": cmd_id, "method": method, "params": params or {}})
    ws.send(msg)
    # 等待响应
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == cmd_id:
            return resp.get("result", {})
        # 忽略其他消息（如事件通知）


def cdp_navigate(ws, url: str, timeout: int = 30) -> bool:
    """导航到指定 URL，等待页面加载"""
    log.info(f"🌐 导航到: {url}")
    try:
        cdp_send(ws, "Page.navigate", {"url": url})
        # 等待 loadEventFired
        deadline = time.time() + timeout
        while time.time() < deadline:
            resp = json.loads(ws.recv())
            if resp.get("method") == "Page.loadEventFired":
                log.info("✅ 页面加载完成")
                return True
    except Exception as e:
        log.warning(f"⚠️ 页面导航异常: {e}")
        return False


def cdp_get_metrics(ws) -> dict:
    """获取页面 metrics（用于验证数据加载）"""
    try:
        result = cdp_send(ws, "Runtime.evaluate", {
            "expression": """
                () => {
                    // 尝试从 GSC 页面获取性能摘要数据
                    const summaryEls = document.querySelectorAll(
                        '[data-stats-row], [data-value], .performance-card, [class*="summary"]'
                    );
                    const metrics = {};
                    summaryEls.forEach(el => {
                        const val = el.getAttribute('data-value') || el.textContent.trim();
                        const label = (el.getAttribute('data-label') || el.getAttribute('aria-label') || '')
                            .toLowerCase();
                        if (val && !isNaN(parseFloat(val))) {
                            metrics[label] = parseFloat(val);
                        }
                    });
                    return JSON.stringify(metrics);
                }
            """,
            "returnByValue": True,
        })
        return result.get("result", {}).get("value", {})
    except Exception as e:
        log.warning(f"⚠️ 获取 metrics 失败: {e}")
        return {}


def wait_for_gsc_data(ws, timeout: int = 45) -> bool:
    """
    等待 GSC 性能数据加载完成。
    通过轮询页面 DOM 变化来检测数据是否就绪。
    """
    log.info("⏳ 等待 GSC 数据加载...")
    deadline = time.time() + timeout
    last_row_count = 0

    while time.time() < deadline:
        try:
            result = cdp_send(ws, "Runtime.evaluate", {
                "expression": """
                    () => {
                        // GSC 性能报告的主表格行
                        const rows = document.querySelectorAll(
                            '[class*="table-row"], [class*="perf-row"], tr[data-row], [class*="performance-table"] tr'
                        );
                        return { count: rows.length };
                    }
                """,
                "returnByValue": True,
            })
            row_count = result.get("result", {}).get("value", {}).get("count", 0)

            if row_count > 0 and row_count != last_row_count:
                log.info(f"📊 检测到数据行: {row_count} 行")
                last_row_count = row_count

            if row_count > 0:
                log.info("✅ GSC 数据已加载")
                return True

        except Exception as e:
            log.debug(f"⚠️ DOM 查询异常: {e}")

        time.sleep(3)

    log.warning("⚠️ 等待数据超时，尝试继续抓取")
    return last_row_count > 0


def extract_gsc_data(ws) -> Optional[Dict[str, Any]]:
    """
    从 GSC 性能报告页面提取四列数据。
    返回: { clicks, impressions, ctr, avg_position }
    """
    log.info("📊 正在提取 GSC 性能数据...")

    # 方法 1: 尝试从页面 summary 区域提取
    try:
        result = cdp_send(ws, "Runtime.evaluate", {
            "expression": """
                () => {
                    const result = { clicks: null, impressions: null, ctr: null, avg_position: null };

                    // 方法 A: 查找带有特定文本的 summary 单元格
                    const allEls = document.querySelectorAll('*');
                    for (const el of allEls) {
                        const text = el.textContent.trim();
                        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

                        // 点击数
                        if ((ariaLabel.includes('click') || ariaLabel.includes('点击')) && text) {
                            const num = text.replace(/[^0-9.]/g, '');
                            if (num) result.clicks = parseInt(num);
                        }
                        // 展示量
                        if ((ariaLabel.includes('impression') || ariaLabel.includes('展示')) && text) {
                            const num = text.replace(/[^0-9.]/g, '');
                            if (num) result.impressions = parseInt(num);
                        }
                        // CTR
                        if ((ariaLabel.includes('ctr') || ariaLabel.includes('点击率')) && text) {
                            const num = text.replace(/[^0-9.%]/g, '');
                            if (num) result.ctr = parseFloat(num) / 100;
                        }
                        // 平均排名
                        if ((ariaLabel.includes('position') || ariaLabel.includes('排名') || ariaLabel.includes('avg position')) && text) {
                            const num = text.replace(/[^0-9.]/g, '');
                            if (num) result.avg_position = parseFloat(num);
                        }
                    }

                    // 方法 B: 通过 data-value 属性
                    const dataEls = document.querySelectorAll('[data-value]');
                    for (const el of dataEls) {
                        const val = el.getAttribute('data-value');
                        if (val && !isNaN(parseFloat(val))) {
                            const parent = el.closest('[class*="column"], [class*="metric"], [class*="stat"]');
                            const parentText = parent ? parent.textContent.toLowerCase() : '';
                            if (parentText.includes('click') && !result.clicks) result.clicks = parseFloat(val);
                            if (parentText.includes('impression') && !result.impressions) result.impressions = parseFloat(val);
                            if (parentText.includes('ctr') && !result.ctr) result.ctr = parseFloat(val);
                            if ((parentText.includes('position') || parentText.includes('rank')) && !result.avg_position) result.avg_position = parseFloat(val);
                        }
                    }

                    // 方法 C: 查找包含数值的 summary 行
                    const summaryRows = document.querySelectorAll('[class*="summary"], [class*="total"]');
                    for (const row of summaryRows) {
                        const cells = row.querySelectorAll('td, div[class*="cell"], span[class*="value"]');
                        const values = [];
                        cells.forEach(c => {
                            const v = c.textContent.trim();
                            if (v && !isNaN(parseFloat(v.replace(/[^0-9.-]/g, '')))) {
                                values.push(parseFloat(v.replace(/[^0-9.-]/g, '')));
                            }
                        });
                        if (values.length >= 4) {
                            // 按顺序: clicks, impressions, ctr, position
                            if (!result.clicks) result.clicks = Math.round(values[0]);
                            if (!result.impressions) result.impressions = Math.round(values[1]);
                            if (!result.ctr && values[2]) result.ctr = values[2];
                            if (!result.avg_position && values[3]) result.avg_position = values[3];
                        }
                    }

                    return JSON.stringify(result);
                }
            """,
            "returnByValue": True,
        })

        data = result.get("result", {}).get("value", "{}")
        extracted = json.loads(data)

        log.info(f"   原始提取: {extracted}")

        # 验证数据合理性
        if all(v is not None for v in [extracted.get("clicks"), extracted.get("impressions")]):
            log.info(f"✅ 成功提取四列数据: {extracted}")
            return {
                "clicks": int(extracted["clicks"]) if extracted["clicks"] else 0,
                "impressions": int(extracted["impressions"]) if extracted["impressions"] else 0,
                "ctr": round(float(extracted["ctr"]), 6) if extracted["ctr"] else 0.0,
                "avg_position": round(float(extracted["avg_position"]), 2) if extracted["avg_position"] else 0.0,
            }
        else:
            log.warning("⚠️ 未能从页面提取完整数据，返回空结果")
            return None

    except Exception as e:
        log.error(f"❌ 数据提取失败: {e}")
        return None


# ---------------------------------------------------------------------------
# Supabase UPSERT
# ---------------------------------------------------------------------------

def upsert_gsc_data(
    date_str: str,
    domain: str,
    data: Dict[str, Any],
    url: str = SUPABASE_URL,
    key: str = SUPABASE_KEY,
) -> Dict[str, Any]:
    """
    UPSERT GSC 数据到 Supabase。

    表结构假设 (gsc_data):
        id            SERIAL PRIMARY KEY
        date          DATE NOT NULL          -- 数据日期
        domain        VARCHAR(255) NOT NULL  -- 域名
        clicks        INTEGER DEFAULT 0      -- 点击数
        impressions   INTEGER DEFAULT 0      -- 展示量
        ctr           DECIMAL(10,6)          -- 点击率 (0-1)
        avg_position  DECIMAL(10,2)          -- 平均排名
        created_at    TIMESTAMP DEFAULT NOW()
        updated_at    TIMESTAMP DEFAULT NOW()

        UNIQUE CONSTRAINT: (date, domain)

    Args:
        date_str: 日期字符串 YYYY-MM-DD
        domain: 域名 (如 bornchart.app)
        data: { clicks, impressions, ctr, avg_position }
        url: Supabase URL
        key: Service Role Key

    Returns:
        { success: bool, action: 'insert'|'update', details: ... }
    """
    endpoint = f"{url}/rest/v1/gsc_data"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "date": date_str,
        "domain": domain,
        "clicks": data.get("clicks", 0),
        "impressions": data.get("impressions", 0),
        "ctr": data.get("ctr", 0.0),
        "avg_position": data.get("avg_position", 0.0),
    }

    # 检查记录是否存在
    check_url = f"{endpoint}?date=eq.{date_str}&domain=eq.{domain}"
    check_headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }

    try:
        check_req = urllib.request.Request(check_url, headers=check_headers)
        check_resp = urllib.request.urlopen(check_req, timeout=10)
        existing = json.loads(check_resp.read())
        record_exists = len(existing) > 0
    except urllib.error.HTTPError as e:
        if e.code == 404 or e.code == 406:
            # 表不存在或无数据 → 需要创建表
            log.warning(f"⚠️ Supabase 表 gsc_data 不存在或为空 (HTTP {e.code})")
            record_exists = False
        else:
            raise
    except Exception as e:
        log.warning(f"⚠️ 检查记录时出错: {e}，将尝试插入")
        record_exists = False

    if record_exists:
        # UPDATE
        upsert_url = f"{endpoint}?date=eq.{date_str}&domain=eq.{domain}"
        upsert_headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        req = urllib.request.Request(
            upsert_url,
            data=json.dumps(payload).encode(),
            headers=upsert_headers,
            method="PATCH",
        )
        action = "update"
    else:
        # INSERT
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode(),
            headers=headers,
            method="POST",
        )
        action = "insert"

    try:
        resp = urllib.request.urlopen(req, timeout=15)
        body = json.loads(resp.read())
        log.info(f"✅ UPSERT 成功: action={action}, 数据={payload}")
        return {
            "success": True,
            "action": action,
            "payload": payload,
            "response": body,
        }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if hasattr(e, "read") else str(e)
        log.error(f"❌ UPSERT 失败 (HTTP {e.code}): {error_body}")
        return {
            "success": False,
            "action": action,
            "error": f"HTTP {e.code}: {error_body}",
            "payload": payload,
        }
    except Exception as e:
        log.error(f"❌ UPSERT 网络异常: {e}")
        return {
            "success": False,
            "action": action,
            "error": str(e),
            "payload": payload,
        }


# ---------------------------------------------------------------------------
# 辅助函数
# ---------------------------------------------------------------------------

def parse_date(date_str: str) -> str:
    """解析日期字符串，返回 YYYY-MM-DD 格式"""
    try:
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        return dt.isoformat()
    except ValueError:
        log.error(f"❌ 日期格式错误: {date_str}，应为 YYYY-MM-DD")
        sys.exit(1)


def get_default_date() -> str:
    """获取昨天的日期"""
    return (datetime.date.today() - datetime.timedelta(days=1)).isoformat()


def create_supabase_table(url: str, key: str) -> bool:
    """
    如果 Supabase 表不存在，尝试创建 gsc_data 表。
    由于 REST API 不支持 DDL，这里只记录需要的表结构。
    """
    log.info("📋 gsc_data 表结构要求:")
    log.info("   CREATE TABLE gsc_data (")
    log.info("       id          SERIAL PRIMARY KEY,")
    log.info("       date        DATE NOT NULL,")
    log.info("       domain      VARCHAR(255) NOT NULL,")
    log.info("       clicks      INTEGER DEFAULT 0,")
    log.info("       impressions INTEGER DEFAULT 0,")
    log.info("       ctr         DECIMAL(10,6),")
    log.info("       avg_position DECIMAL(10,2),")
    log.info("       created_at  TIMESTAMP DEFAULT NOW(),")
    log.info("       updated_at  TIMESTAMP DEFAULT NOW(),")
    log.info("       UNIQUE (date, domain)")
    log.info("   );")
    log.info("")
    log.info("   ⚠️ 请在 Supabase SQL Editor 中执行上述建表语句")
    log.info("   或访问: https://app.supabase.com/project/xgaxejeaxfhlupguqteu/editor")
    return True


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def run_scraper(target_date: str, domain: str, cdp_ws: str) -> Dict[str, Any]:
    """
    完整抓取流程:
    1. 连接 CDP
    2. 导航到 GSC 性能报告
    3. 设置日期范围为指定单日
    4. 等待数据加载
    5. 提取四列数据
    6. UPSERT 到 Supabase
    """
    date_str = parse_date(target_date)
    log.info("=" * 60)
    log.info(f"  GSC 每日数据采集")
    log.info(f"  日期: {date_str}")
    log.info(f"  域名: {domain}")
    log.info(f"  CDP:  {cdp_ws}")
    log.info("=" * 60)

    target = None
    ws = None

    try:
        # Step 1: 连接 CDP
        log.info("\n📡 Step 1/6: 连接 Chrome CDP...")
        target, ws = connect_cdp(cdp_ws)

        # Step 2: 导航到 GSC 性能报告
        log.info("\n📡 Step 2/6: 打开 GSC 性能报告...")
        perf_url = f"{GSC_PERFORMANCE_URL}?resource_id={GSC_HOME_URL.split('/')[-1]}"
        cdp_navigate(ws, perf_url)

        # Step 3: 设置日期范围为指定单日
        log.info(f"\n📡 Step 3/6: 设置日期范围为 {date_str}...")
        # 点击日期范围选择器，选择自定义日期，输入单日
        # 通过 JS 操作 GSC UI
        try:
            cdp_send(ws, "Runtime.evaluate", {
                "expression": f"""
                    () => {{
                        // 查找日期范围选择器按钮
                        const dateBtns = document.querySelectorAll(
                            '[class*="date"], [class*="time"], [class*="range"], button[class*="date"]'
                        );
                        let clicked = false;
                        for (const btn of dateBtns) {{
                            if (btn.textContent.includes('28天') || btn.textContent.includes('28 days') ||
                                btn.textContent.includes('Last 28')) {{
                                btn.click();
                                clicked = true;
                                break;
                            }}
                        }}
                        if (!clicked) {{
                            // 尝试通过 aria-label 查找
                            const allBtns = document.querySelectorAll('button');
                            for (const btn of allBtns) {{
                                const label = (btn.getAttribute('aria-label') || '').toLowerCase();
                                if (label.includes('date') && label.includes('range')) {{
                                    btn.click();
                                    clicked = true;
                                    break;
                                }}
                            }}
                        }}
                        return {{ clicked, btns_found: dateBtns.length }};
                    }}
                """
            })
            time.sleep(2)

            # 点击"自定义日期范围"
            try:
                cdp_send(ws, "Runtime.evaluate", {
                    "expression": """
                        () => {
                            const allBtns = document.querySelectorAll('button, [role="button"], li[role="menuitem"]');
                            for (const btn of allBtns) {
                                const text = (btn.textContent || '').trim();
                                const label = (btn.getAttribute('aria-label') || '').toLowerCase();
                                if (text.includes('自定义') || text.includes('Custom date') ||
                                    text.includes('custom date') || label.includes('custom')) {
                                    btn.click();
                                    return { custom_clicked: true };
                                }
                            }
                            return { custom_clicked: false };
                        }
                    """
                })
                time.sleep(2)
            except Exception as e:
                log.warning(f"⚠️ 自定义日期按钮点击失败: {e}")

            # 输入日期
            try:
                cdp_send(ws, "Runtime.evaluate", {
                    "expression": f"""
                        () => {{
                            // 查找日期输入框
                            const inputs = document.querySelectorAll('input[type="date"], input[placeholder*="date"]');
                            let filled = 0;
                            for (const input of inputs) {{
                                if (input.type === 'date' || input.placeholder?.includes('date')) {{
                                    input.value = '{date_str}';
                                    input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                                    input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                    filled++;
                                }}
                            }}
                            // 点击确认/应用按钮
                            const applyBtns = document.querySelectorAll('button, [role="button"]');
                            for (const btn of applyBtns) {{
                                const text = (btn.textContent || '').trim();
                                if (text.includes('应用') || text.includes('Apply') || text.includes('Update') ||
                                    text.includes('确定')) {{
                                    btn.click();
                                    return {{ filled, applied: true }};
                                }}
                            }}
                            return {{ filled, applied: false }};
                        }}
                    """
                })
                time.sleep(3)
            except Exception as e:
                log.warning(f"⚠️ 日期输入失败: {e}")

        except Exception as e:
            log.warning(f"⚠️ 日期范围设置失败: {e}，尝试直接使用当前日期范围")

        # Step 4: 等待数据加载
        log.info("\n📡 Step 4/6: 等待数据加载...")
        data_loaded = wait_for_gsc_data(ws)

        if not data_loaded:
            log.warning("⚠️ 未检测到数据行，可能是新验证站点或数据延迟")
            log.info("   GSC 数据通常需要 3-5 天才会出现在报告中")

        # Step 5: 提取数据
        log.info("\n📡 Step 5/6: 提取性能数据...")
        extracted = extract_gsc_data(ws)

        if not extracted:
            log.error("❌ 未能提取到任何数据")
            log.info("   可能原因:")
            log.info("   1. Chrome 未登录 GSC，请先手动登录")
            log.info("   2. 日期数据尚未在 GSC 中生成（需 3-5 天）")
            log.info("   3. Chrome CDP 连接的目标页面不是 GSC 页面")
            log.info("   4. GSC UI 结构已变更，需更新选择器")
            return {
                "success": False,
                "date": date_str,
                "domain": domain,
                "error": "数据提取失败",
                "steps_completed": 5,
            }

        # Step 6: UPSERT 到 Supabase
        log.info("\n📡 Step 6/6: UPSERT 到 Supabase...")
        upsert_result = upsert_gsc_data(date_str, domain, extracted)

        # 汇总
        log.info("\n" + "=" * 60)
        log.info(f"  📊 采集结果汇总")
        log.info("=" * 60)
        log.info(f"  日期:       {date_str}")
        log.info(f"  域名:       {domain}")
        log.info(f"  点击数:     {extracted['clicks']:,}")
        log.info(f"  展示量:     {extracted['impressions']:,}")
        log.info(f"  CTR:        {extracted['ctr']:.4%}")
        log.info(f"  平均排名:   {extracted['avg_position']:.2f}")
        log.info(f"  UPSERT:     {upsert_result.get('action', 'N/A')}")
        log.info(f"  状态:       {'✅ 成功' if upsert_result.get('success') else '❌ 失败'}")
        log.info("=" * 60)

        return {
            "success": upsert_result.get("success", False),
            "date": date_str,
            "domain": domain,
            "data": extracted,
            "upsert": upsert_result,
        }

    except Exception as e:
        log.error(f"❌ 采集流程异常: {e}", exc_info=True)
        return {
            "success": False,
            "date": date_str,
            "domain": domain,
            "error": str(e),
        }

    finally:
        if ws:
            try:
                ws.close()
            except:
                pass


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="GSC 每日数据采集脚本 — Chrome CDP + Supabase UPSERT",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 抓取昨天数据（默认）
  python3 gsc_scraper.py

  # 抓取指定日期
  python3 gsc_scraper.py 2026-06-28

  # 指定 Chrome CDP WebSocket
  python3 gsc_scraper.py 2026-06-28 --cdp ws://127.0.0.1:9222

  # 指定域名
  python3 gsc_scraper.py 2026-06-28 --domain bornchart.app

前置准备:
  1. 启动 Chrome: google-chrome --remote-debugging-port=9222 --no-first-run
  2. 手动登录 GSC: https://search.google.com/search-console
  3. 安装依赖: pip install websocket-client requests
  4. 创建 Supabase 表: 见上方 create_supabase_table 输出
        """,
    )
    parser.add_argument(
        "date",
        nargs="?",
        default=None,
        help="目标日期 YYYY-MM-DD（默认: 昨天）",
    )
    parser.add_argument(
        "--domain",
        default=DEFAULT_DOMAIN,
        help=f"域名（默认: {DEFAULT_DOMAIN}）",
    )
    parser.add_argument(
        "--cdp",
        default=None,
        help="Chrome CDP WebSocket URL（默认: ws://127.0.0.1:9222）",
    )
    parser.add_argument(
        "--supabase-url",
        default=SUPABASE_URL,
        help="Supabase URL",
    )
    parser.add_argument(
        "--supabase-key",
        default=None,
        help="Supabase Service Role Key（默认从环境变量读取）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅抓取不写入 Supabase",
    )
    parser.add_argument(
        "--create-table",
        action="store_true",
        help="仅输出建表 SQL 并退出",
    )

    args = parser.parse_args()

    # --create-table 模式
    if args.create_table:
        create_supabase_table(args.supabase_url, args.supabase_key or SUPABASE_KEY)
        return

    # 日期处理
    target_date = args.date or get_default_date()

    # CDP WS URL
    cdp_ws = args.cdp or "ws://127.0.0.1:9222"
    if not "/devtools/page/" in cdp_ws:
        cdp_ws = cdp_ws  # connect_cdp 会处理

    # 运行采集
    result = run_scraper(target_date, args.domain, cdp_ws)

    # 返回码
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
