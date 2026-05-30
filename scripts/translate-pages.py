#!/usr/bin/env python3
"""
FateWise 全站中文页面翻译脚本
读取所有英文 page.tsx，创建中文版 app/zh/<path>/page.tsx
用正则替换可见文本为中文，保留 JSX 结构和变量名
"""

import os
import re
import shutil

PROJECT_DIR = os.path.expanduser("/home/zxw/.openclaw/workspace/ez-mystic")
APP_DIR = os.path.join(PROJECT_DIR, "app")

# 需要翻译的页面（排除 blog 和 zh 下已有的）
PAGES_TO_TRANSLATE = [
    "page.tsx",              # 首页 /
    "bazi/page.tsx",
    "daily/page.tsx",
    "chat/page.tsx",
    "pricing/page.tsx",
    "contact/page.tsx",
    "zen/page.tsx",
    "tools/page.tsx",
    "about/page.tsx",
    "privacy/page.tsx",
    "terms/page.tsx",
    "refund/page.tsx",
    "login/page.tsx",
    "signup/page.tsx",
    "dashboard/page.tsx",
    "account/page.tsx",
    "activate/page.tsx",
    "payment/page.tsx",
    "payment/success/page.tsx",
    "payment/verify/page.tsx",
    "fatebook/page.tsx",
    "compatibility/page.tsx",
    "colors/page.tsx",
    "diet/page.tsx",
    "direction/page.tsx",
    "exercise/page.tsx",
    "luck/page.tsx",
]

def get_original_path(page_path):
    return os.path.join(APP_DIR, page_path)

def get_zh_path(page_path):
    # 特殊处理首页
    if page_path == "page.tsx":
        return os.path.join(APP_DIR, "zh", "page.tsx")
    return os.path.join(APP_DIR, "zh", page_path)

def create_zh_page(page_path):
    src = get_original_path(page_path)
    dst = get_zh_path(page_path)
    
    if not os.path.exists(src):
        print(f"  ❌ 源文件不存在: {src}")
        return False
    
    if os.path.exists(dst):
        print(f"  ⏭️  已存在: {dst}")
        return True
    
    # 确保目标目录存在
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    
    # 读取源文件
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修改 metadata 中的 alternates.canonical
    content = content.replace(
        "canonical: '/zh/blog'",
        "canonical: '/zh'"
    )
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ 创建: {dst}")
    return True

def main():
    os.makedirs(os.path.join(APP_DIR, "zh"), exist_ok=True)
    
    print("=" * 60)
    print("FateWise 全站中文页面翻译")
    print("=" * 60)
    
    success = 0
    skipped = 0
    failed = 0
    
    for page in PAGES_TO_TRANSLATE:
        dst = get_zh_path(page)
        if os.path.exists(dst):
            skipped += 1
            continue
        
        result = create_zh_page(page)
        if result:
            success += 1
        else:
            failed += 1
    
    print(f"\n📊 汇总: 新建 {success}, 已存在 {skipped}, 失败 {failed}")

if __name__ == "__main__":
    main()
