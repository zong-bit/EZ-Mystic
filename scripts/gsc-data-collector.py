#!/usr/bin/env python3
"""
GSC (Google Search Console) API Data Collector
===============================================
从 GSC API v2 拉取 bornchart.app 搜索流量数据。

支持功能:
- 查询最近 N 天的点击、展示、CTR、平均排名
- 按维度筛选（网页、国家、设备、搜索外观、查询）
- 输出 JSON / CSV
- 支持 API 限流重试
- 可接入每日报告系统

使用方式:
  # 设置凭证
  export GSC_CREDENTIALS="/path/to/service-account.json"
  
  # 查询最近 28 天数据（默认维度）
  python3 gsc-data-collector.py
  
  # 指定日期范围和维度
  python3 gsc-data-collector.py --days 14 --dimension page,country,device
  
  # 输出 CSV
  python3 gsc-data-collector.py --format csv --output gsc_report.csv
  
  # 查询特定关键词
  python3 gsc-data-collector.py --dimension query --keywords "八字,命理,运势"
"""

import argparse
import csv
import datetime
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Google API 依赖
# ---------------------------------------------------------------------------
# 安装: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    print("❌ 缺少依赖: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
API_NAME = "searchanalytics"
API_VERSION = "v3"
DEFAULT_DAYS = 28
MAX_RETRIES = 3
RETRY_DELAY = 5  # 秒


# ---------------------------------------------------------------------------
# 核心函数
# ---------------------------------------------------------------------------

def get_gsc_service(credentials_path: str):
    """构建 GSC API 服务客户端"""
    creds = service_account.Credentials.from_service_account_file(
        credentials_path, scopes=SCOPES
    )
    service = build("searchconsole", "v1", credentials=creds)
    return service


def query_gsc(
    service,
    site_url: str,
    start_date: str,
    end_date: str,
    dimensions: list[str],
    row_limit: int = 25000,
    start_row: int = 0,
    search_type: str = "web",
    dimension_filter_groups: Optional[list] = None,
    keywords: Optional[list[str]] = None,
) -> list[dict]:
    """
    调用 GSC API 查询性能数据。
    
    Args:
        service: GSC API 服务客户端
        site_url: 站点 URL（如 https://bornchart.app）
        start_date: 开始日期 YYYY-MM-DD
        end_date: 结束日期 YYYY-MM-DD
        dimensions: 维度列表 ['query', 'page', 'country', 'device', 'searchAppearance']
        row_limit: 最大返回行数（默认 25000）
        start_row: 分页起始行
        search_type: 搜索类型 'web' | 'image' | 'video' | 'news'
        dimension_filter_groups: 维度过滤条件
        keywords: 关键词过滤列表
    
    Returns:
        查询结果列表
    """
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        "startRow": start_row,
        "searchType": search_type,
    }
    
    if keywords:
        # 使用维度过滤器过滤关键词
        body["dimensionFilterGroups"] = [
            {
                "filters": [
                    {
                        "dimension": "query",
                        "expression": kw,
                    }
                    for kw in keywords
                ]
            }
        ]
    
    all_rows = []
    current_start_row = start_row
    
    for attempt in range(MAX_RETRIES):
        try:
            report = service.searchanalytics().query(
                siteUrl=site_url,
                body=body
            ).execute()
            
            rows = report.get("rows", [])
            all_rows.extend(rows)
            
            # 如果返回结果少于 row_limit，说明没有更多数据
            if len(rows) < row_limit:
                break
            
            current_start_row += row_limit
            body["startRow"] = current_start_row
            
        except Exception as e:
            error_msg = str(e)
            if "rateLimitExceeded" in error_msg or "429" in error_msg:
                wait_time = RETRY_DELAY * (2 ** attempt)
                print(f"  ⏳ API 限流，等待 {wait_time} 秒后重试 ({attempt + 1}/{MAX_RETRIES})...")
                time.sleep(wait_time)
                continue
            elif "accessDenied" in error_msg or "permission" in error_msg.lower():
                print(f"  ❌ 权限不足: {error_msg}")
                print("  请确认 Service Account 已添加到 GSC 并拥有 '查看和管理' 权限")
                raise
            else:
                print(f"  ⚠️ 请求失败 ({attempt + 1}/{MAX_RETRIES}): {error_msg}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                else:
                    raise
    
    return all_rows


def format_date(days_ago: int = 0) -> str:
    """返回 YYYY-MM-DD 格式的日期"""
    return (datetime.date.today() - datetime.timedelta(days=days_ago)).isoformat()


def calculate_metrics(rows: list[dict]) -> dict:
    """从查询结果计算汇总指标"""
    total_clicks = 0
    total_impressions = 0
    total_ctr = 0.0
    total_position = 0.0
    valid_rows = 0
    
    for row in rows:
        clicks = row.get("clicks", 0) or 0
        impressions = row.get("impressions", 0) or 0
        ctr = row.get("ctr", 0) or 0
        position = row.get("position", 0) or 0
        
        total_clicks += clicks
        total_impressions += impressions
        total_ctr += ctr
        total_position += position
        valid_rows += 1
    
    avg_ctr = total_ctr / valid_rows if valid_rows > 0 else 0
    avg_position = total_position / valid_rows if valid_rows > 0 else 0
    overall_ctr = total_clicks / total_impressions if total_impressions > 0 else 0
    
    return {
        "total_clicks": total_clicks,
        "total_impressions": total_impressions,
        "overall_ctr": round(overall_ctr, 6),
        "avg_ctr": round(avg_ctr, 6),
        "avg_position": round(avg_position, 2),
        "data_points": valid_rows,
    }


def output_json(rows: list[dict], metrics: dict, output_path: str):
    """将结果保存为 JSON"""
    data = {
        "generated_at": datetime.datetime.now().isoformat(),
        "metrics": metrics,
        "rows": rows,
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 已保存: {output_path}")


def output_csv(rows: list[dict], output_path: str):
    """将结果保存为 CSV"""
    if not rows:
        print("⚠️ 没有数据可导出")
        return
    
    fieldnames = ["clicks", "impressions", "ctr", "position"]
    if "keys" in rows[0]:
        fieldnames = ["keys"] + fieldnames
    
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"✅ CSV 已保存: {output_path}")


def print_summary(metrics: dict, start_date: str, end_date: str):
    """打印数据摘要"""
    print("\n" + "=" * 60)
    print(f"  GSC 数据摘要 ({start_date} → {end_date})")
    print("=" * 60)
    print(f"  总展示量 (Impressions):  {metrics['total_impressions']:,}")
    print(f"  总点击量 (Clicks):       {metrics['total_clicks']:,}")
    print(f"  整体 CTR:                {metrics['overall_ctr']:.2%}")
    print(f"  平均排名 (Position):     {metrics['avg_position']:.2f}")
    print(f"  数据行数:                {metrics['data_points']:,}")
    print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# 日报集成函数
# ---------------------------------------------------------------------------

def generate_daily_report(rows: list[dict], metrics: dict, start_date: str, end_date: str) -> dict:
    """
    生成日报格式的数据，可直接接入现有报告系统。
    
    返回格式:
    {
        "date": "2026-06-24",
        "impressions": 1234,
        "clicks": 56,
        "ctr": 0.045,
        "avg_position": 28.5,
        "top_pages": [...],
        "top_keywords": [...],
        "top_countries": [...],
        "device_breakdown": {...}
    }
    """
    report = {
        "date": datetime.date.today().isoformat(),
        "period": f"{start_date} → {end_date}",
        "impressions": metrics["total_impressions"],
        "clicks": metrics["total_clicks"],
        "ctr": metrics["overall_ctr"],
        "avg_position": metrics["avg_position"],
    }
    
    # 按展示量排序的前 10 个页面
    page_stats = {}
    for row in rows:
        keys = row.get("keys", [])
        if keys:
            page = keys[0]
            page_stats[page] = {
                "clicks": page_stats.get(page, {}).get("clicks", 0) + (row.get("clicks", 0) or 0),
                "impressions": page_stats.get(page, {}).get("impressions", 0) + (row.get("impressions", 0) or 0),
            }
    
    top_pages = sorted(
        [{"page": k, **v} for k, v in page_stats.items()],
        key=lambda x: x["impressions"],
        reverse=True
    )[:10]
    report["top_pages"] = top_pages
    
    # 按展示量排序的前 10 个关键词
    query_stats = {}
    for row in rows:
        keys = row.get("keys", [])
        if keys and len(keys) > 1:
            query = keys[1]
            query_stats[query] = {
                "clicks": query_stats.get(query, {}).get("clicks", 0) + (row.get("clicks", 0) or 0),
                "impressions": query_stats.get(query, {}).get("impressions", 0) + (row.get("impressions", 0) or 0),
                "ctr": query_stats.get(query, {}).get("ctr", 0) + (row.get("ctr", 0) or 0),
            }
    
    top_keywords = sorted(
        [{"keyword": k, **v} for k, v in query_stats.items()],
        key=lambda x: x["impressions"],
        reverse=True
    )[:10]
    report["top_keywords"] = top_keywords
    
    return report


# ---------------------------------------------------------------------------
# 主函数
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="GSC API Data Collector")
    parser.add_argument("--days", type=int, default=DEFAULT_DAYS, help=f"查询天数 (默认: {DEFAULT_DAYS})")
    parser.add_argument("--dimension", nargs="+", default=["page"],
                        help="维度: page, query, country, device, searchAppearance (默认: page)")
    parser.add_argument("--start-date", type=str, help="开始日期 YYYY-MM-DD")
    parser.add_argument("--end-date", type=str, help="结束日期 YYYY-MM-DD")
    parser.add_argument("--format", choices=["json", "csv"], default="json", help="输出格式 (默认: json)")
    parser.add_argument("--output", type=str, help="输出文件路径")
    parser.add_argument("--site-url", type=str, default="https://bornchart.app", help="站点 URL")
    parser.add_argument("--credentials", type=str, help="Service Account JSON 凭证路径")
    parser.add_argument("--keywords", type=str, help="关键词过滤 (逗号分隔)")
    parser.add_argument("--report", action="store_true", help="生成日报格式输出")
    
    args = parser.parse_args()
    
    # 凭证路径
    credentials_path = args.credentials or os.environ.get(
        "GSC_CREDENTIALS",
        os.path.join(Path(__file__).parent.parent, "gsc-service-account.json")
    )
    
    if not os.path.exists(credentials_path):
        print(f"❌ 凭证文件不存在: {credentials_path}")
        print("请从 GCP Console 下载 Service Account JSON 并放置在此路径")
        print("\n设置方式:")
        print(f"  export GSC_CREDENTIALS=/path/to/service-account.json")
        print(f"  或创建软链接: ln -s /path/to/key {credentials_path}")
        sys.exit(1)
    
    # 日期范围
    end_date = args.end_date or format_date(0)
    start_date = args.start_date or format_date(args.days)
    
    # 关键词过滤
    keywords = [k.strip() for k in args.keywords.split(",")] if args.keywords else None
    
    print(f"🔍 GSC 数据收集器")
    print(f"   站点: {args.site_url}")
    print(f"   日期: {start_date} → {end_date}")
    print(f"   维度: {args.dimension}")
    print(f"   凭证: {credentials_path}")
    print()
    
    # 连接 API
    try:
        service = get_gsc_service(credentials_path)
    except Exception as e:
        print(f"❌ 凭证加载失败: {e}")
        sys.exit(1)
    
    # 查询数据
    print(f"📡 正在查询 GSC API...")
    rows = query_gsc(
        service=service,
        site_url=args.site_url,
        start_date=start_date,
        end_date=end_date,
        dimensions=args.dimension,
        keywords=keywords,
    )
    
    if not rows:
        print("⚠️ 未返回数据（可能是新验证的站点，数据需要 48-72 小时才会积累）")
        print("   建议: 等待 1-2 天后再次运行")
        sys.exit(0)
    
    # 计算指标
    metrics = calculate_metrics(rows)
    print_summary(metrics, start_date, end_date)
    
    # 输出结果
    if args.report:
        report = generate_daily_report(rows, metrics, start_date, end_date)
        print("📊 日报数据:")
        print(json.dumps(report, ensure_ascii=False, indent=2))
    
    if args.format == "json":
        output_path = args.output or f"gsc-data-{start_date}.json"
        output_json(rows, metrics, output_path)
    elif args.format == "csv":
        output_path = args.output or f"gsc-data-{start_date}.csv"
        output_csv(rows, output_path)


if __name__ == "__main__":
    main()
