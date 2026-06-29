#!/usr/bin/env python3
"""
Bing Webmaster Tools Index Scraper
===================================
监控 Bing 搜索引擎对 bornchart.app 的索引情况。

采集方式:
  1. Bing Webmaster Tools API（优先，需配置 BING_WEBMASTER_API_KEY）
  2. Chrome CDP 抓取 Bing Webmaster Tools Web UI（备选）

写入 Supabase bing_index_data 表，UPSERT 逻辑。

使用:
  python3 bing_index_scraper.py                          # 今天，bornchart.app
  python3 bing_index_scraper.py 2026-06-28               # 指定日期
  python3 bing_index_scraper.py bornchart.app            # 指定域名
  python3 bing_index_scraper.py --create-table           # 输出建表 SQL

前置:
  1. pip install websocket-client
  2. google-chrome --remote-debugging-port=9222 --no-first-run
  3. 登录 https://www.bing.com/webmasters 并添加站点
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
# 日志
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("bing_scraper")

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://xgaxejeaxfhlupguqteu.supabase.co"
)
SUPABASE_KEY = ***
    "SUPABASE_SERVICE_ROLE_KEY",
    "sb_secret_Ic345MFMBPwc6dtrUEWCgA_L27K74dX"
)
BING_SITE_URL = "https://www.bing.com/webmasters/sites"
DEFAULT_CDP_WS = "ws://127.0.0.1:9222"
BING_API_KEY = ***"BING_WEBMASTER_API_KEY", "")


# ---------------------------------------------------------------------------
# Supabase UPSERT
# ---------------------------------------------------------------------------

def upsert_bing_data(
    date_str: str,
    domain: str,
    data: Dict[str, Any],
    url: str = SUPABASE_URL,
    key: str = SUPABASE_KEY,
) -> Dict[str, Any]:
    """UPSERT 到 Supabase bing_index_data 表。唯一键 (date, domain)。"""
    payload = {
        "date": date_str,
        "domain": domain,
        "pages_submitted": data.get("pages_submitted", 0),
        "pages_indexed": data.get("pages_indexed", 0),
        "last_checked_at": datetime.datetime.now().isoformat(),
    }
    endpoint = f"{url}/rest/v1/bing_index_data"
    base_headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    # 检查记录是否存在
    check_url = f"{endpoint}?date=eq.{date_str}&domain=eq.{domain}"
    record_exists = False
    try:
        check_req = urllib.request.Request(
            check_url,
            headers={"apikey": key, "Authorization": f"Bearer {key}", "Accept": "application/json"}
        )
        check_resp = urllib.request.urlopen(check_req, timeout=10)
        existing = json.loads(check_resp.read())
        record_exists = len(existing) > 0
    except urllib.error.HTTPError as e:
        if e.code in (404, 406, 401):
            record_exists = False
        else:
            log.warning(f"⚠️ 检查记录失败 (HTTP {e.code})，将尝试插入")
    except Exception as e:
        log.warning(f"⚠️ 检查记录异常: {e}，将尝试插入")

    method = "PATCH" if record_exists else "POST"
    params = f"?date=eq.{date_str}&domain=eq.{domain}" if record_exists else ""
    action = "update" if record_exists else "insert"

    req = urllib.request.Request(
        endpoint + params,
        data=json.dumps(payload).encode(),
        headers={**base_headers, "Prefer": "return=representation"},
        method=method,
    )

    try:
        resp = urllib.request.urlopen(req, timeout=15)
        body = json.loads(resp.read())
        log.info(f"✅ UPSERT {action} 成功: {payload}")
        return {"success": True, "action": action, "payload": payload, "response": body}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if hasattr(e, "read") else str(e)
        log.error(f"❌ UPSERT {action} 失败 (HTTP {e.code}): {error_body}")
        return {"success": False, "action": action, "error": f"HTTP {e.code}: {error_body}", "payload": payload}
    except Exception as e:
        log.error(f"❌ UPSERT 网络异常: {e}")
        return {"success": False, "action": action, "error": str(e), "payload": payload}


# ---------------------------------------------------------------------------
# 方法一: Bing Webmaster Tools API
# ---------------------------------------------------------------------------

def fetch_via_api(domain: str) -> Optional[Dict[str, Any]]:
    """通过 Bing Webmaster Tools API 获取索引数据。"""
    if not BING_API_KEY:
        ***"⏭️ 未配置 BING_WEBMASTER_API_KEY，跳过 API 方式")
        return None
    try:
        log.info("📡 尝试通过 Bing API 获取索引数据...")
        log.warning("⚠️ Bing API 需要 OAuth 2.0 认证，当前为框架代码")
        log.info("   获取 API key: https://www.bing.com/webmasters → Settings → API")
        return None
    except Exception as e:
        log.error(f"❌ Bing API 调用失败: {e}")
        return None


# ---------------------------------------------------------------------------
# 方法二: Chrome CDP 抓取 Bing Webmaster Tools
# ---------------------------------------------------------------------------

def connect_cdp(cdp_ws: str) -> Tuple[str, Any]:
    """连接 Chrome CDP，返回 (target_id, ws)。"""
    try:
        import websocket
    except ImportError:
        log.error("❌ 缺少依赖: pip install websocket-client")
        sys.exit(1)

    if "/devtools/page/" in cdp_ws:
        parts = cdp_ws.split("/devtools/page/")
        base_url = parts[0]
        target_id = parts[1].strip()
    else:
        base_url = cdp_ws.replace("ws://", "http://")
        try:
            resp = urllib.request.urlopen(f"{base_url}/json", timeout=10)
            targets = json.loads(resp.read())
            if not targets:
                log.error("❌ 没有可用的 Chrome target")
                sys.exit(1)
            target_id = targets[0]["id"]
        except Exception as e:
            log.error(f"❌ 无法连接 Chrome: {e}")
            sys.exit(1)
        base_url = cdp_ws.replace("ws://", "http://")

    ws = websocket.create_connection(
        f"{base_url.replace('http://', 'ws://')}/devtools/page/{target_id}",
        timeout=15
    )
    log.info(f"✅ CDP 连接成功 (target: {target_id})")
    return target_id, ws


def cdp_send(ws, method: str, params: dict = None, cmd_id: int = None) -> dict:
    """发送 CDP 命令并等待响应。"""
    if cmd_id is None:
        cmd_id = int(time.time() * 1000) % 100000
    msg = json.dumps({"id": cmd_id, "method": method, "params": params or {}})
    ws.send(msg)
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == cmd_id:
            return resp.get("result", {})


def cdp_navigate(ws, url: str, timeout: int = 30) -> bool:
    """导航到 URL 并等待加载完成。"""
    log.info(f"🌐 导航到: {url}")
    try:
        cdp_send(ws, "Page.navigate", {"url": url})
        deadline = time.time() + timeout
        while time.time() < deadline:
            resp = json.loads(ws.recv())
            if resp.get("method") == "Page.loadEventFired":
                log.info("✅ 页面加载完成")
                return True
    except Exception as e:
        log.warning(f"⚠️ 导航异常: {e}")
        return False


def extract_bing_index_data(ws, domain: str) -> Optional[Dict[str, Any]]:
    """从 Bing Webmaster Tools 页面提取索引数据。"""
    log.info("📊 正在提取 Bing 索引数据...")
    try:
        result = cdp_send(ws, "Runtime.evaluate", {
            "expression": f"""
                () => {{
                    const result = {{ pages_submitted: null, pages_indexed: null, notes: '' }};

                    // 方法 A: 查找索引统计卡片
                    const cards = document.querySelectorAll('[class*="card"], [class*="widget"], [class*="panel"], [class*="stat-card"]');
                    for (const card of cards) {{
                        const text = card.textContent.trim();
                        const label = (card.getAttribute('aria-label') || '').toLowerCase();
                        if ((text.includes('indexed') || label.includes('indexed')) && !result.pages_indexed) {{
                            const nums = text.match(/\\d[\\d,]*/g);
                            if (nums) result.pages_indexed = parseInt(nums[0].replace(/,/g, ''));
                        }}
                        if ((text.includes('submitted') || label.includes('submitted')) && !result.pages_submitted) {{
                            const nums = text.match(/\\d[\\d,]*/g);
                            if (nums) result.pages_submitted = parseInt(nums[0].replace(/,/g, ''));
                        }}
                    }}

                    // 方法 B: 查找包含数字的统计行，取最大的两个
                    const statRows = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="count"]');
                    const numbers = [];
                    for (const row of statRows) {{
                        const nums = row.textContent.match(/\\d[\\d,]*/g);
                        if (nums) {{
                            nums.forEach(n => {{
                                const val = parseInt(n.replace(/,/g, ''));
                                if (val > 0 && val < 1000000) numbers.push(val);
                            }});
                        }}
                    }}

                    numbers.sort((a, b) => b - a);
                    if (numbers.length >= 2) {{
                        if (!result.pages_submitted) result.pages_submitted = numbers[0];
                        if (!result.pages_indexed) result.pages_indexed = numbers[1];
                    }} else if (numbers.length === 1 && !result.pages_indexed) {{
                        result.pages_indexed = numbers[0];
                    }}

                    // data-value / data-count 属性
                    const dataEls = document.querySelectorAll('[data-value], [data-count]');
                    for (const el of dataEls) {{
                        const val = parseInt(el.getAttribute('data-value') || el.getAttribute('data-count') || '0');
                        if (val > 0) numbers.push(val);
                    }}

                    if (result.pages_indexed === null) {{
                        result.notes = '未能提取索引数据，请确认已登录且选择了正确站点';
                    }} else {{
                        result.notes = '数据提取成功';
                    }}

                    return JSON.stringify(result);
                }}
            """,
            "returnByValue": True,
        })

        data = result.get("result", {}).get("value", "{}")
        extracted = json.loads(data)
        log.info(f"   提取结果: submitted={extracted.get('pages_submitted')}, indexed={extracted.get('pages_indexed')}")

        if extracted.get("pages_submitted") is not None or extracted.get("pages_indexed") is not None:
            return {
                "pages_submitted": int(extracted["pages_submitted"]) if extracted.get("pages_submitted") else 0,
                "pages_indexed": int(extracted["pages_indexed"]) if extracted.get("pages_indexed") else 0,
                "notes": extracted.get("notes", ""),
                "data_source": "cdp",
            }
        log.warning("⚠️ 未能从 Bing 页面提取到索引数据")
        return None
    except Exception as e:
        log.error(f"❌ 数据提取失败: {e}")
        return None


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def run_scraper(target_date: str, domain: str, cdp_ws: str) -> Dict[str, Any]:
    """完整采集流程。"""
    date_str = target_date if re.match(r"\d{4}-\d{2}-\d{2}", target_date) else datetime.date.today().isoformat()

    log.info("=" * 60)
    log.info(f"  Bing 索引数据采集")
    log.info(f"  日期: {date_str}")
    log.info(f"  域名: {domain}")
    log.info(f"  CDP:  {cdp_ws}")
    log.info("=" * 60)

    ws = None
    try:
        # Step 1: API 方式（优先）
        log.info("\n📡 Step 1/4: 尝试 Bing Webmaster Tools API...")
        api_result = fetch_via_api(domain)
        if api_result:
            log.info("✅ API 方式成功")
            upsert_result = upsert_bing_data(date_str, domain, api_result)
            return {"success": upsert_result.get("success", False), "date": date_str,
                    "domain": domain, "data": api_result, "upsert": upsert_result}

        # Step 2: CDP 连接
        log.info("\n📡 Step 2/4: 连接 Chrome CDP...")
        target, ws = connect_cdp(cdp_ws)

        # Step 3: 导航到 Bing Webmaster Tools
        log.info(f"\n📡 Step 3/4: 打开 Bing Webmaster Tools...")
        cdp_navigate(ws, f"{BING_SITE_URL}?siteUrl=https://{domain}")
        time.sleep(3)

        # Step 4: 提取数据
        log.info("\n📡 Step 4/4: 提取索引数据...")
        extracted = extract_bing_index_data(ws, domain)

        if not extracted:
            log.error("❌ 未能提取到任何数据")
            log.info("   1. Chrome 未登录 Bing Webmaster Tools")
            log.info("   2. 站点未添加或未验证")
            log.info("   3. Chrome CDP 目标页面不是 Bing Webmaster Tools")
            failed_data = {"pages_submitted": 0, "pages_indexed": 0, "notes": "数据提取失败", "data_source": "cdp"}
            upsert_result = upsert_bing_data(date_str, domain, failed_data)
            return {"success": upsert_result.get("success", False), "date": date_str, "domain": domain,
                    "data": {"pages_submitted": 0, "pages_indexed": 0, "error": "提取失败"}, "upsert": upsert_result}

        # Step 5: UPSERT
        log.info("\n💾 UPSERT 到 Supabase...")
        upsert_result = upsert_bing_data(date_str, domain, extracted)

        # 汇总
        log.info("\n" + "=" * 60)
        log.info(f"  📊 Bing 索引结果汇总")
        log.info("=" * 60)
        log.info(f"  日期:         {date_str}")
        log.info(f"  域名:         {domain}")
        log.info(f"  已提交页面:   {extracted['pages_submitted']:,}")
        log.info(f"  已索引页面:   {extracted['pages_indexed']:,}")
        log.info(f"  UPSERT:       {upsert_result.get('action', 'N/A')}")
        log.info(f"  状态:         {'✅ 成功' if upsert_result.get('success') else '❌ 失败'}")
        if extracted.get("notes"):
            log.info(f"  备注:         {extracted['notes']}")
        log.info("=" * 60)

        return {"success": upsert_result.get("success", False), "date": date_str, "domain": domain,
                "data": extracted, "upsert": upsert_result}

    except Exception as e:
        log.error(f"❌ 采集流程异常: {e}", exc_info=True)
        return {"success": False, "date": date_str, "domain": domain, "error": str(e)}
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
        description="Bing Webmaster Tools Index Scraper — Chrome CDP + Supabase UPSERT",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 bing_index_scraper.py                          # 今天，bornchart.app
  python3 bing_index_scraper.py 2026-06-28               # 指定日期
  python3 bing_index_scraper.py bornchart.app            # 指定域名
  python3 bing_index_scraper.py --create-table           # 输出建表 SQL

前置:
  1. 启动 Chrome: google-chrome --remote-debugging-port=9222 --no-first-run
  2. 登录 Bing: https://www.bing.com/webmasters
  3. 添加站点: https://www.bing.com/webmasters/sites
  4. 安装依赖: pip install websocket-client
  5. 创建表: python3 bing_index_scraper.py --create-table
        """,
    )
    parser.add_argument("date_or_domain", nargs="?", default=None,
                        help="日期 YYYY-MM-DD 或域名（默认: 域名=bornchart.app, 日期=今天）")
    parser.add_argument("--domain", default="bornchart.app", help="域名（默认: bornchart.app）")
    parser.add_argument("--cdp", default=None, help="Chrome CDP WebSocket URL（默认: ws://127.0.0.1:9222）")
    parser.add_argument("--create-table", action="store_true", help="输出建表 SQL 并退出")
    args = parser.parse_args()

    # --create-table 模式
    if args.create_table:
        sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bing_index_data.sql")
        if os.path.exists(sql_path):
            with open(sql_path) as f:
                print(f.read())
        return

    # 解析参数
    if args.date_or_domain:
        if re.match(r"\d{4}-\d{2}-\d{2}", args.date_or_domain):
            target_date = args.date_or_domain
            domain = args.domain
        else:
            target_date = datetime.date.today().isoformat()
            domain = args.date_or_domain
    else:
        target_date = datetime.date.today().isoformat()
        domain = args.domain

    result = run_scraper(target_date, domain, args.cdp or DEFAULT_CDP_WS)
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
