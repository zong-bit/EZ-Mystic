#!/usr/bin/env python3
"""
FateWise → Medium 批量发布脚本

用法:
  # 查看 Medium integration token 获取方式:
  python publish_medium.py --help

  # Dry-run 测试一篇:
  python publish_medium.py --dry-run --slug bazi-chart-explained-complete-guide

  # Dry-run 批量:
  python publish_medium.py --dry-run --all

  # 正式批量发布 (写入 draft):
  python publish_medium.py --all

  # 指定 token (也可通过环境变量 MEDIUM_TOKEN):
  python publish_medium.py --token <your-medium-token> --all

前置步骤 (手动):
  1. 登录 https://medium.com/me/settings
  2. 滚动到 "Integration secret" 区域
  3. 点击 "Generate new secret"
  4. 复制生成的 token (格式: m_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
  5. 设置环境变量: export MEDIUM_TOKEN=m_...

注意:
  - Medium API 不支持编辑/删除，仅在 draft 状态测试
  - 每篇间隔 5 秒避免 rate limit
  - 发布后需手动在 Medium 后台确认/发布
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import markdown
import requests

# ─── 配置 ───────────────────────────────────────────────────────────
BLOG_DIR = Path(__file__).resolve().parent.parent / "content" / "blog"
PUBLISHED_FILE = Path(__file__).resolve().parent / "published_medium.json"
BASE_URL = "https://bornchart.app"
RATE_LIMIT_DELAY = 5  # 秒

# Medium API
MEDIUM_API = "https://api.medium.com/v1"

# FateWise 产品描述（用于 directory 提交，内联复用）
PRODUCT_INFO = {
    "name": "FateWise",
    "url": "https://bornchart.app",
    "description": "AI-powered Bazi (Four Pillars of Destiny) chart analysis platform. Get your free destiny reading with Chinese astrology, Five Elements analysis, and AI deep interpretation.",
    "category": "AI / Wellness / Spirituality",
    "tags": "AI, astrology, bazi, chinese astrology, destiny, wellness",
}


def parse_frontmatter(md_text: str) -> tuple[dict, str]:
    """解析 Markdown 文件的 frontmatter，返回 (meta, body)"""
    body = md_text
    meta = {}

    # 支持 --- 分隔的 YAML frontmatter
    if md_text.startswith("---"):
        parts = md_text.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1].strip()
            body = parts[2].lstrip("\n")
            for line in fm_text.split("\n"):
                line = line.strip()
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    meta[key] = val

    return meta, body


def md_to_html(md_text: str) -> str:
    """Markdown → HTML，保留 h2/h3/p/li/blockquote/table 等"""
    extensions = [
        "extra",
        "codehilite",
        "toc",
        "tables",
        "fenced_code",
        "attr_list",
        "def_list",
    ]
    html = markdown.markdown(
        md_text,
        extensions=extensions,
        extension_configs={
            "toc": {"permalink": True},
        },
    )
    return html


def get_blog_files() -> list[Path]:
    """获取博客文件列表，按日期排序"""
    files = list(BLOG_DIR.glob("*.md"))
    files.sort(key=lambda p: p.name)
    return files


def get_published_slugs() -> set[str]:
    """读取已发布的 slug 记录"""
    if PUBLISHED_FILE.exists():
        try:
            with open(PUBLISHED_FILE, "r") as f:
                data = json.load(f)
                return set(data.get("published_slugs", []))
        except (json.JSONDecodeError, IOError):
            return set()
    return set()


def save_published_slugs(slugs: set[str]):
    """保存已发布的 slug 记录"""
    data = {
        "published_slugs": sorted(slugs),
        "last_updated": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    with open(PUBLISHED_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_medium_user_id(token: str) -> str:
    """获取 Medium 用户 ID"""
    resp = requests.get(
        f"{MEDIUM_API}/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["data"]["id"]


def publish_to_medium(
    token: str,
    user_id: str,
    title: str,
    content: str,
    content_format: str = "html",
    tags: list[str] | None = None,
    canonical_url: str | None = None,
    publish_status: str = "draft",
) -> dict:
    """发布文章到 Medium"""
    payload = {
        "title": title,
        "contentFormat": content_format,
        "content": content,
        "publishStatus": publish_status,
        "license": "all-rights-reserved",
        "notifyFollowers": False,
        "apiVersion": "latest",
    }

    if tags:
        payload["tags"] = tags
    if canonical_url:
        payload["canonicalUrl"] = canonical_url

    resp = requests.post(
        f"{MEDIUM_API}/users/{user_id}/posts",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
        timeout=30,
    )

    if resp.status_code == 403:
        print(f"  ⚠️  403 Forbidden: 检查 token 是否有效且未过期")
        print(f"     Response: {resp.text[:500]}")
    resp.raise_for_status()
    return resp.json()["data"]


def process_blog_file(
    file_path: Path,
    token: str,
    user_id: str,
    dry_run: bool = False,
    publish_status: str = "draft",
) -> dict:
    """处理单个博客文件"""
    md_text = file_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(md_text)

    title = meta.get("title", file_path.stem.replace("-", " ").title())
    slug = meta.get("slug", file_path.stem)
    date = meta.get("date", "")
    description = meta.get("description", "")
    tags_raw = meta.get("tags", "")

    # 解析 tags
    tags = []
    if tags_raw:
        if isinstance(tags_raw, list):
            tags = tags_raw
        else:
            tags = [t.strip() for t in tags_raw.split(",") if t.strip()]

    # 默认 tags
    if not tags:
        tags = ["bazi", "chinese-astrology", "destiny"]

    canonical = f"{BASE_URL}/blog/{slug}"
    html_content = md_to_html(body)

    # 添加 canonical link 和来源声明
    attribution = f"""

---

*Originally published at [FateWise]({canonical}). Read the original article for interactive Bazi chart analysis.*
"""
    html_content += attribution

    result = {
        "file": file_path.name,
        "title": title,
        "slug": slug,
        "date": date,
        "canonical": canonical,
        "description": description,
        "tags": tags,
    }

    if dry_run:
        print(f"\n{'='*60}")
        print(f"📝 [DRY-RUN] {file_path.name}")
        print(f"   Title:    {title}")
        print(f"   Slug:     {slug}")
        print(f"   Date:     {date}")
        print(f"   Canonical: {canonical}")
        print(f"   Tags:     {', '.join(tags)}")
        print(f"   Desc:     {description[:80]}...")
        print(f"   HTML length: {len(html_content)} chars")
        print(f"   Status:   Would publish as '{publish_status}'")
        result["dry_run"] = True
    else:
        print(f"\n📤 Publishing: {file_path.name} → '{title}'")
        try:
            pub_data = publish_to_medium(
                token=token,
                user_id=user_id,
                title=title,
                content=html_content,
                content_format="html",
                tags=tags,
                canonical_url=canonical,
                publish_status=publish_status,
            )
            result["medium_id"] = pub_data.get("id", "")
            result["url"] = pub_data.get("url", "")
            result["status"] = pub_data.get("publishStatus", "")
            print(f"   ✅ Medium ID: {pub_data.get('id', 'N/A')}")
            print(f"   ✅ URL: {pub_data.get('url', 'N/A')}")
        except requests.exceptions.HTTPError as e:
            result["error"] = str(e)
            result["status"] = "failed"
            print(f"   ❌ Failed: {e}")
            print(f"   Response: {e.response.text[:300] if e.response else 'N/A'}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="FateWise → Medium 批量发布脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
前置步骤 (手动):
  1. 登录 https://medium.com/me/settings
  2. 滚动到 "Integration secret" 区域
  3. 点击 "Generate new secret"
  4. 复制 token (格式: m_xxx...)
  5. export MEDIUM_TOKEN=m_xxx...

用法:
  python publish_medium.py --dry-run --all          # 预览
  python publish_medium.py --all                    # 发布为 draft
  python publish_medium.py --slug bazi-chart-explained-complete-guide  # 单篇
        """,
    )
    parser.add_argument(
        "--token",
        help="Medium integration token (默认: MEDIUM_TOKEN 环境变量)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅预览，不实际发布",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="批量处理所有博客",
    )
    parser.add_argument(
        "--slug",
        help="指定单篇博客的 slug",
    )
    parser.add_argument(
        "--publish-status",
        choices=["draft", "public"],
        default="draft",
        help="发布状态 (默认: draft)",
    )
    parser.add_argument(
        "--delay",
        type=int,
        default=RATE_LIMIT_DELAY,
        help=f"每篇间隔秒数 (默认: {RATE_LIMIT_DELAY})",
    )
    parser.add_argument(
        "--output",
        help="结果输出文件路径",
    )

    args = parser.parse_args()

    # 获取 token
    token = args.token or os.environ.get("MEDIUM_TOKEN", "")
    if not token:
        token_file = os.path.join(SCRIPT_DIR, "medium_token.txt")
        if os.path.exists(token_file):
            token = open(token_file).read().strip()
            print(f"📎 从 {token_file} 自动读取 token")
    if not token:
        print("❌ 缺少 Medium token")
        print("   方式 1: python publish_medium.py --token m_xxx...")
        print(f"   方式 2: echo 'm_xxx...' > {SCRIPT_DIR}/medium_token.txt")
    print("   方式 3: export MEDIUM_TOKEN=m_xxx...")
        print()
        print("📖 获取 token:")
        print("   1. 登录 https://medium.com/me/settings")
        print("   2. 滚动到 'Integration secret'")
        print("   3. 点击 'Generate new secret'")
        print("   4. 复制 token")
        sys.exit(1)

    # 获取 user_id
    print("🔑 获取 Medium 用户 ID...")
    try:
        user_id = get_medium_user_id(token)
        print(f"   ✅ User ID: {user_id}")
    except requests.exceptions.HTTPError as e:
        print(f"   ❌ 获取用户 ID 失败: {e}")
        print(f"   请检查 token 是否有效")
        if e.response:
            print(f"   Response: {e.response.text[:300]}")
        sys.exit(1)

    # 获取文件列表
    if args.slug:
        # 单篇模式
        files = [f for f in get_blog_files() if f.stem == args.slug]
        if not files:
            # 尝试 slug 带完整文件名
            files = [f for f in get_blog_files() if args.slug in f.name]
        if not files:
            print(f"❌ 未找到 slug='{args.slug}' 的博客文件")
            print(f"   可用 slug:")
            for f in get_blog_files()[:10]:
                print(f"     - {f.stem}")
            sys.exit(1)
    elif args.all:
        files = get_blog_files()
        print(f"📚 找到 {len(files)} 篇博客")
    else:
        parser.print_help()
        sys.exit(0)

    # 读取已发布记录
    published_slugs = get_published_slugs()
    print(f"📋 已发布记录: {len(published_slugs)} 篇")

    # 处理文件
    results = []
    for i, file_path in enumerate(files):
        slug = file_path.stem

        # 检查是否已发布
        if slug in published_slugs and not args.dry_run:
            print(f"\n⏭️  跳过 (已发布): {file_path.name}")
            results.append(
                {
                    "file": file_path.name,
                    "slug": slug,
                    "status": "skipped-already-published",
                }
            )
            continue

        result = process_blog_file(
            file_path,
            token,
            user_id,
            dry_run=args.dry_run,
            publish_status=args.publish_status,
        )
        results.append(result)

        # 更新已发布记录
        if not args.dry_run and result.get("status") == "draft":
            published_slugs.add(slug)
            save_published_slugs(published_slugs)

        # Rate limit delay
        if i < len(files) - 1:
            print(f"   ⏳ 等待 {args.delay}s...")
            time.sleep(args.delay)

    # 输出汇总
    print(f"\n{'='*60}")
    print("📊 汇总")
    print(f"   总计:   {len(results)}")
    success = sum(1 for r in results if r.get("status") in ("draft", "public", True))
    failed = sum(1 for r in results if r.get("status") == "failed")
    skipped = sum(1 for r in results if r.get("status") == "skipped-already-published")
    dry = sum(1 for r in results if r.get("dry_run"))
    print(f"   ✅ 成功: {success}")
    print(f"   ❌ 失败: {failed}")
    print(f"   ⏭️  跳过: {skipped}")
    print(f"   🔍 Dry-run: {dry}")

    # 保存结果
    output_file = args.output or Path(__file__).resolve().parent / "publish_results.json"
    with open(output_file, "w") as f:
        json.dump(
            {
                "results": results,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "dry_run": args.dry_run,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )
    print(f"   📄 结果已保存: {output_file}")


if __name__ == "__main__":
    main()
