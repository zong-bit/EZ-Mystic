#!/usr/bin/env python3
"""
FateWise AI Tool Directory 批量提交脚本

收集 30+ 免费 AI tool / startup directory，自动提交 FateWise 到
无需注册即可直接提交的目录站。

用法:
  # Dry-run 预览所有提交 (不实际发送):
  python submit_directories.py --dry-run

  # 实际提交:
  python submit_directories.py

  # 只提交特定目录:
  python submit_directories.py --dirs best-ai-brands,theres-a-if-for-that

  # 指定产品描述文件:
  python submit_directories.py --product-desc product_info.json
"""

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from urllib.parse import urljoin

import requests

# ─── 产品描述 ───────────────────────────────────────────────────────
PRODUCT_INFO = {
    "name": "FateWise",
    "url": "https://bornchart.app",
    "description": "AI-powered Bazi (Four Pillars of Destiny) chart analysis platform. Get your free destiny reading with Chinese astrology, Five Elements analysis, and AI deep interpretation.",
    "category": "AI / Wellness / Spirituality",
    "tags": "AI, astrology, bazi, chinese astrology, destiny, wellness",
    "logo_url": "https://bornchart.app/logo.png",
    "twitter": "",
    "creator": "zong-bit",
}

# ─── 目录列表 ───────────────────────────────────────────────────────
# 来源: GitHub best-of-ai/ai-directories + Tavily 搜索 + 手动验证
# 格式: (名称, 提交URL, 是否需要注册, 表单字段名, DR估计, 备注)

DIRECTORIES = [
    # === Tier 1: 高权重，推荐优先提交 ===
    {
        "name": "Best AI Brands",
        "submit_url": "https://bestaibrands.com/submit",
        "needs_signup": False,
        "dr": 35,
        "form_fields": {
            "name": "product_name",
            "url": "product_url",
            "description": "product_description",
            "category": "product_category",
        },
        "notes": "手审，spam-free，SEO优化后快速上线",
    },
    {
        "name": "There's An AI For That",
        "submit_url": "https://theresanaiforthat.com/submit/",
        "needs_signup": False,
        "dr": 72,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "最大的AI工具目录，任务分类搜索，高权重",
    },
    {
        "name": "Futurepedia",
        "submit_url": "https://www.futurepedia.io/submit-tool",
        "needs_signup": False,
        "dr": 68,
        "form_fields": {
            "name": "title",
            "url": "website",
            "description": "description",
            "tags": "tags",
        },
        "notes": "顶级AI目录，每日更新，高流量",
    },
    {
        "name": "Product Hunt",
        "submit_url": "https://www.producthunt.com/products/submit",
        "needs_signup": True,
        "dr": 91,
        "form_fields": {
            "name": "name",
            "url": "website_url",
            "description": "tagline",
        },
        "notes": "需PH账号，手动提交最佳，API受限",
    },
    {
        "name": "AI Hunt List",
        "submit_url": "https://aihuntlist.com/submit",
        "needs_signup": False,
        "dr": 22,
        "form_fields": {
            "name": "tool_name",
            "url": "tool_url",
            "description": "tool_description",
            "category": "category",
        },
        "notes": "3000+ AI产品，200+分类",
    },
    {
        "name": "AI Scout",
        "submit_url": "https://aiscout.net/submit",
        "needs_signup": False,
        "dr": 20,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI Tools Directory",
    },
    {
        "name": "AI Tools Directory (aidirectory.wiki)",
        "submit_url": "https://aidirectory.wiki/submit",
        "needs_signup": False,
        "dr": 18,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "tags": "tags",
        },
        "notes": "Curated AI tools directory",
    },
    {
        "name": "AI Tools Love",
        "submit_url": "https://aitools.love/submit",
        "needs_signup": False,
        "dr": 15,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "pricing": "pricing",
        },
        "notes": "对比定价和功能",
    },

    # === Tier 2: 中等权重 ===
    {
        "name": "AI Tools Arena",
        "submit_url": "https://aitoolsarena.com/submit",
        "needs_signup": False,
        "dr": 16,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI Tools and Insights",
    },
    {
        "name": "AI Tools Guru",
        "submit_url": "https://aitoolguru.com/submit",
        "needs_signup": False,
        "dr": 14,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": " largest AI directory",
    },
    {
        "name": "AI Tools List",
        "submit_url": "https://aitoolslist.io/submit",
        "needs_signup": False,
        "dr": 17,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "rating": "rating",
        },
        "notes": "Best AI Tools Rated",
    },
    {
        "name": "AI Top Tools",
        "submit_url": "https://aitoptools.com/submit",
        "needs_signup": False,
        "dr": 15,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI Tools directory",
    },
    {
        "name": "AI Tools Magazine",
        "submit_url": "https://aitoolsmagazine.com/submit-tool",
        "needs_signup": False,
        "dr": 13,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Find Best AI Tools",
    },
    {
        "name": "AI Pulse",
        "submit_url": "https://www.aipulse.fyi/submit",
        "needs_signup": False,
        "dr": 19,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "In-depth AI reviews",
    },
    {
        "name": "AiDirs",
        "submit_url": "https://aidirs.best/submit",
        "needs_signup": False,
        "dr": 12,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Discover and Share Best AI Tools",
    },
    {
        "name": "AI Library",
        "submit_url": "https://www.theailibrary.co/submit",
        "needs_signup": False,
        "dr": 14,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "category": "category",
        },
        "notes": "500+ tools directory",
    },
    {
        "name": "AI Toolz Dir",
        "submit_url": "https://www.aitoolzdir.com/submit",
        "needs_signup": False,
        "dr": 27,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "DR 27 backlink for free",
    },
    {
        "name": "ALL AI TOOLS .TECH",
        "submit_url": "https://allaitools.tech/submit",
        "needs_signup": False,
        "dr": 11,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI Recommendation System",
    },
    {
        "name": "AiToolex",
        "submit_url": "https://aitoolex.com/submit",
        "needs_signup": False,
        "dr": 10,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Explore Best AI Tools",
    },
    {
        "name": "AI Tool Trek",
        "submit_url": "https://aitooltrek.com/submit",
        "needs_signup": False,
        "dr": 10,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Curated AI tools & news",
    },
    {
        "name": "AI Tool List (aitoollist.org)",
        "submit_url": "https://www.aitoollist.org/submit",
        "needs_signup": False,
        "dr": 16,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Awesome directory of AI tools",
    },
    {
        "name": "AI Journey",
        "submit_url": "https://aijourney.so/submit",
        "needs_signup": False,
        "dr": 12,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Expert reviews on AI tools",
    },
    {
        "name": "AiToolz",
        "submit_url": "https://aitoolz.net/submit",
        "needs_signup": False,
        "dr": 9,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Find useful AI tools",
    },
    {
        "name": "AI Parabellum",
        "submit_url": "https://aiparabellum.com/submit",
        "needs_signup": False,
        "dr": 11,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Find Tomorrow's AI Tools",
    },
    {
        "name": "Altern",
        "submit_url": "https://altern.ai/submit",
        "needs_signup": False,
        "dr": 25,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "category": "category",
        },
        "notes": "Gateway to the AI Universe",
    },
    {
        "name": "All Things AI",
        "submit_url": "https://allthingsai.com/submit",
        "needs_signup": False,
        "dr": 20,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Curated Resource of AI Tools",
    },
    {
        "name": "AI Hubs",
        "submit_url": "https://aihubs.ai/submit",
        "needs_signup": False,
        "dr": 18,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Best AI tools directory",
    },
    {
        "name": "AI Resource Pro",
        "submit_url": "https://airesource.pro/submit",
        "needs_signup": False,
        "dr": 13,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI learning roadmap & tools",
    },
    {
        "name": "AI Respo",
        "submit_url": "https://airespo.com/submit",
        "needs_signup": False,
        "dr": 10,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Find AI tools and learning resources",
    },
    {
        "name": "AI Corner",
        "submit_url": "https://aicorner.net/submit",
        "needs_signup": False,
        "dr": 12,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "AI Tools Directory",
    },
    {
        "name": "AIDir",
        "submit_url": "https://aidir.wiki/submit",
        "needs_signup": False,
        "dr": 15,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "First AI Directory since 2022",
    },
    {
        "name": "AI PEDIA HUB",
        "submit_url": "https://aipediahub.com/submit",
        "needs_signup": False,
        "dr": 11,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Largest AI tools directory, updated daily",
    },
    {
        "name": "AI Tools Pin",
        "submit_url": "https://aitoolspin.com/submit",
        "needs_signup": False,
        "dr": 10,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Best AI tools by category",
    },
    {
        "name": "AISuperSmart",
        "submit_url": "https://www.aisupersmart.com/ai-tools-directory/submit",
        "needs_signup": False,
        "dr": 12,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "1500+ AI tools, daily updates",
    },
    {
        "name": "AI-Tools Directory",
        "submit_url": "https://ai-tools.directory/submit",
        "needs_signup": False,
        "dr": 14,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Directory curated by AI itself",
    },
    {
        "name": "AI Tools Explore (aiex.me)",
        "submit_url": "https://aiex.me/submit",
        "needs_signup": False,
        "dr": 11,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Curated AI tools and insights",
    },
    {
        "name": "AI Tools For Me",
        "submit_url": "https://aitoolsforme.com/submit",
        "needs_signup": False,
        "dr": 9,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Growing AI directory",
    },
    {
        "name": "All The AI Tools",
        "submit_url": "https://alltheaitools.com/submit",
        "needs_signup": False,
        "dr": 13,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Comprehensive AI directory",
    },
    {
        "name": "AI Tools Marketer",
        "submit_url": "https://aitoolsmarketer.com/submit",
        "needs_signup": False,
        "dr": 10,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Ultimate AI Tools Directory",
    },
    {
        "name": "Productivity Directory",
        "submit_url": "https://productivity.directory/submit",
        "needs_signup": False,
        "dr": 22,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "category": "category",
        },
        "notes": "AI Productivity Tools directory",
    },
    {
        "name": "AI Tools Submit",
        "submit_url": "https://submitaitools.org/submit-your-ai-tool",
        "needs_signup": False,
        "dr": 12,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Submit AI tools",
    },
    {
        "name": "HyzenPro",
        "submit_url": "https://hyzenpro.com/submit-ai-tool",
        "needs_signup": False,
        "dr": 14,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Editorial review submission",
    },
    {
        "name": "SimplifyAITools",
        "submit_url": "https://simplifyaitools.com/submit-tool",
        "needs_signup": False,
        "dr": 11,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Editorial review + newsletter feature",
    },
    {
        "name": "List Your Tool (Organic Pilot)",
        "submit_url": "https://www.organicpilot.ai/launch-directories/listyourtool",
        "needs_signup": False,
        "dr": 16,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "Free AI directory for founders",
    },
    {
        "name": "StartupHub",
        "submit_url": "https://www.startuphub.ai/submit",
        "needs_signup": False,
        "dr": 20,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
            "category": "category",
        },
        "notes": "#1 AI Startup Directory & Company Database",
    },
    {
        "name": "10 Words Directory",
        "submit_url": "https://10words.io/submit",
        "needs_signup": False,
        "dr": 28,
        "form_fields": {
            "name": "name",
            "url": "url",
            "description": "description",
        },
        "notes": "DA 28 startup directory",
    },
]


@dataclass
class SubmissionResult:
    dir_name: str
    status: str  # success / failed / skipped / dry_run
    response_code: int = 0
    response_body: str = ""
    error: str = ""
    submitted_at: str = ""


def build_submit_payload(directory: dict) -> dict:
    """根据目录的表单字段名，构建提交数据"""
    fields = directory.get("form_fields", {})
    payload = {}

    name_field = fields.get("name", "name")
    url_field = fields.get("url", "url")
    desc_field = fields.get("description", "description")
    cat_field = fields.get("category", "category")
    tags_field = fields.get("tags", "tags")
    pricing_field = fields.get("pricing", "pricing")

    payload[name_field] = PRODUCT_INFO["name"]
    payload[url_field] = PRODUCT_INFO["url"]
    payload[desc_field] = PRODUCT_INFO["description"]

    if cat_field and cat_field in fields:
        payload[cat_field] = PRODUCT_INFO["category"]
    if tags_field and tags_field in fields:
        payload[tags_field] = PRODUCT_INFO["tags"]
    if pricing_field and pricing_field in fields:
        payload[pricing_field] = "Freemium (Free + $9.99/mo + $29.99/mo)"

    return payload


def submit_to_directory(directory: dict, dry_run: bool = False) -> SubmissionResult:
    """向单个目录提交"""
    name = directory["name"]
    submit_url = directory["submit_url"]
    needs_signup = directory.get("needs_signup", False)

    result = SubmissionResult(
        dir_name=name,
        status="pending",
    )

    # 需要注册的不自动提交
    if needs_signup:
        result.status = "skipped-needs-signup"
        result.response_body = "Requires manual signup"
        return result

    if dry_run:
        payload = build_submit_payload(directory)
        result.status = "dry_run"
        result.response_body = json.dumps(payload, indent=2, ensure_ascii=False)
        print(f"  📋 [DRY-RUN] {name}")
        print(f"     URL: {submit_url}")
        print(f"     DR: {directory.get('dr', '?')}")
        print(f"     Payload: {json.dumps(payload, ensure_ascii=False)}")
        return result

    # 实际提交
    payload = build_submit_payload(directory)
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "FateWise-Submitter/1.0 (https://bornchart.app)",
        "Referer": submit_url,
    }

    try:
        resp = requests.post(
            submit_url,
            data=payload,
            headers=headers,
            timeout=15,
            allow_redirects=True,
        )
        result.response_code = resp.status_code
        result.response_body = resp.text[:500]

        if resp.status_code in (200, 201, 302, 307):
            result.status = "success"
            print(f"  ✅ {name} → {resp.status_code}")
        elif resp.status_code == 403:
            result.status = "failed-403"
            result.error = "Forbidden"
            print(f"  ❌ {name} → 403 Forbidden")
        elif resp.status_code == 429:
            result.status = "failed-429"
            result.error = "Rate limited"
            print(f"  ⏳ {name} → 429 Rate limited")
        else:
            result.status = f"failed-{resp.status_code}"
            result.error = resp.text[:200]
            print(f"  ⚠️  {name} → {resp.status_code}")

    except requests.exceptions.Timeout:
        result.status = "failed-timeout"
        result.error = "Request timeout"
        print(f"  ⏰ {name} → Timeout")
    except requests.exceptions.ConnectionError as e:
        result.status = "failed-connection"
        result.error = str(e)
        print(f"  🔌 {name} → Connection error: {e}")
    except Exception as e:
        result.status = "failed-exception"
        result.error = str(e)
        print(f"  💥 {name} → Exception: {e}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="FateWise AI Tool Directory 批量提交",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
用法:
  python submit_directories.py --dry-run          # 预览 (不实际提交)
  python submit_directories.py                    # 实际提交
  python submit_directories.py --dirs name1,name2  # 只提交指定目录
        """,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅预览，不实际提交",
    )
    parser.add_argument(
        "--dirs",
        help="逗号分隔的目录名称，只提交这些",
    )
    parser.add_argument(
        "--output",
        help="结果输出文件路径",
    )
    parser.add_argument(
        "--delay",
        type=int,
        default=3,
        help="每次提交间隔秒数 (默认: 3)",
    )

    args = parser.parse_args()

    # 筛选目录
    if args.dirs:
        target_names = [n.strip() for n in args.dirs.split(",")]
        dirs = [d for d in DIRECTORIES if d["name"] in target_names]
        if not dirs:
            print(f"❌ 未找到匹配的目录: {args.dirs}")
            print(f"   可用目录:")
            for d in DIRECTORIES:
                print(f"     - {d['name']}")
            sys.exit(1)
    else:
        dirs = DIRECTORIES

    print(f"📊 准备提交到 {len(dirs)} 个目录")
    no_signup = sum(1 for d in dirs if not d.get("needs_signup", False))
    needs_signup = sum(1 for d in dirs if d.get("needs_signup", False))
    print(f"   自动提交: {no_signup}")
    print(f"   需手动注册: {needs_signup}")
    print(f"   总 DR 估计: {sum(d.get('dr', 0) for d in dirs)}")
    print()

    if args.dry_run:
        print("🔍 DRY-RUN 模式 - 以下不会实际提交\n")
        for i, d in enumerate(dirs):
            submit_to_directory(d, dry_run=True)
            if i < len(dirs) - 1:
                time.sleep(0.1)
    else:
        print("🚀 开始提交...\n")
        results = []
        for i, d in enumerate(dirs):
            result = submit_to_directory(d, dry_run=False)
            results.append(result)

            # Rate limit delay
            if i < len(dirs) - 1:
                time.sleep(args.delay)

        # 汇总
        print(f"\n{'='*60}")
        print("📊 提交汇总")
        success = sum(1 for r in results if r.status == "success")
        failed = sum(1 for r in results if r.status.startswith("failed"))
        skipped = sum(1 for r in results if r.status.startswith("skipped"))
        dry = sum(1 for r in results if r.status == "dry_run")
        print(f"   ✅ 成功: {success}")
        print(f"   ❌ 失败: {failed}")
        print(f"   ⏭️  跳过 (需注册): {skipped}")
        print(f"   🔍 Dry-run: {dry}")

        # 保存结果
        output_file = args.output or Path(__file__).resolve().parent / "directory_submission_results.json"
        with open(output_file, "w") as f:
            json.dump(
                {
                    "results": [asdict(r) for r in results],
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                    "dry_run": args.dry_run,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )
        print(f"   📄 结果已保存: {output_file}")

    # 输出需手动注册的目录
    manual_dirs = [d for d in DIRECTORIES if d.get("needs_signup", False)]
    if manual_dirs:
        print(f"\n{'='*60}")
        print("📝 需手动注册的目录:")
        for d in manual_dirs:
            print(f"   • {d['name']} (DR {d.get('dr', '?')})")
            print(f"     → {d['submit_url']}")
            print()


if __name__ == "__main__":
    main()
