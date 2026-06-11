#!/usr/bin/env python3
"""
FateWise AI Tool Directory Browser Submission Script
Uses Playwright for browser automation to submit FateWise to directory sites.

Product Info:
  Name: FateWise
  URL: https://bornchart.app  
  Description: AI-powered Bazi (Four Pillars of Destiny) chart analysis platform. Get your free destiny reading with Chinese astrology, Five Elements analysis, and AI deep interpretation.
  Category: AI / Wellness / Spirituality
  Tags: AI, astrology, bazi, chinese astrology, destiny, wellness
"""

import asyncio
import json
import os
import time
import random
from datetime import datetime
from playwright.async_api import async_playwright, Page

# Product info for submissions
PRODUCT = {
    "name": "FateWise",
    "url": "https://bornchart.app",
    "description": "AI-powered Bazi (Four Pillars of Destiny) chart analysis platform. Get your free destiny reading with Chinese astrology, Five Elements analysis, and AI deep interpretation.",
    "category": "AI / Wellness / Spirituality",
    "tags": ["AI", "astrology", "bazi", "chinese astrology", "destiny", "wellness"],
    "logo_url": "https://bornchart.app/logo.png"
}

# Directory submission targets to attempt via browser
DIRECTORIES = [
    # Tier 1 - Highest DR priority
    {
        "name": "There's An AI For That",
        "url": "https://theresanaiforthat.com/submit/",
    },
    {
        "name": "Toolify AI", 
        "url": "https://www.toolify.ai/submit",
    },
    {
        "name": "Product Hunt", 
        "url": "https://www.producthunt.com/topics/new-tools",
    },
    {
        "name": "Futurepedia", 
        "url": "https://www.futurepedia.io/submit-a-tool",
    },
    {
        "name": "AI21 Tools Directory", 
        "url": "https://www.ai21.com/tools",
    },
    # Tier 2 - Good DR
    {
        "name": "AITools.fyi",
        "url": "https://aitools.fyi/submit",
    },
    {
        "name": "TopAI.tools",
        "url": "https://topai.tools/submit",
    },
    {
        "name": "AI SuperHub", 
        "url": "https://www.aisuperhub.io/submit",
    },
    {
        "name": "FutureTools.io", 
        "url": "https://www.futuretools.io/submit-tool",
    },
    {
        "name": "The AI Library", 
        "url": "https://www.theailibrary.co/submit-tool",
    },
    # Tier 3 - Additional directories
    {
        "name": "AI Tool DB", 
        "url": "https://www.aitooldb.com/submit",
    },
    {
        "name": "SubmitAITool", 
        "url": "https://submitaitool.com/",
    },
    {
        "name": "AI Agents Directory", 
        "url": "https://aiagentsdirectory.com/submit",
    },
    {
        "name": "Dofollow.Tools", 
        "url": "https://dofollow.tools/submit",
    },
    {
        "name": "TopFreeAITools", 
        "url": "https://topfreeaitools.com/submit",
    },
]

RESULTS = []


async def fill_form(page: Page, fields_info: dict):
    """Try to auto-detect and fill form fields."""
    filled = 0
    
    # Common field selectors to try
    common_selectors = {
        "tool_name": ["input[name*='name']", "#name", 'input[placeholder*i="name"]', 
                       'input[placeholder*i="tool name"]', 'label:has-text("Name")+input'],
        "url_field": ["input[name*='url']", 'input[name="website"]', '#url', 
                       'input[placeholder*i="https://"]', 'input[placeholder*i="website"]'],
        "description": ["textarea[name*='desc']", 'textarea[placeholder*i="describe"]',
                         '#description', "input[name*='description']", 
                         'textarea[placeholder*i="brief"]'],
        "category": ["select[name*='cat']", 'select[name*="category"]', 
                      'input[placeholder*i="category"]'],
        "tags": ["input[name*='tag']", 'input[placeholder*i="tag"]'],
    }
    
    # Try to fill name field
    for selector in common_selectors["tool_name"]:
        try:
            el = page.locator(selector).first
            if await el.is_visible(timeout=2000):
                await el.fill(PRODUCT["name"])
                filled += 1
                print(f"  Filled 'Name' via: {selector}")
                break
        except Exception:
            continue
    
    # Try to fill URL field
    for selector in common_selectors["url_field"]:
        try:
            el = page.locator(selector).first
            if await el.is_visible(timeout=2000):
                await el.fill(PRODUCT["url"])
                filled += 1
                print(f"  Filled 'URL' via: {selector}")
                break
        except Exception:
            continue
    
    # Try to fill description field
    for selector in common_selectors["description"]:
        try:
            el = page.locator(selector).first
            if await el.is_visible(timeout=2000):
                # Type slowly to avoid bot detection
                await el.click()
                for i, char in enumerate(PRODUCT["description"]):
                    await el.press_sequentially(char, delay=random.randint(50, 150))
                # If too long for single field, just fill first 300 chars
                await el.fill(PRODUCT["description"][:400])
                filled += 1
                print(f"  Filled 'Description' via: {selector}")
                break
        except Exception:
            continue
    
    return filled


async def wait_for_cloudflare(page: Page, timeout=30):
    """Wait for Cloudflare challenge to resolve."""
    start = time.time()
    while time.time() - start < timeout:
        current_url = page.url
        try:
            title = await page.title()
            if "just a moment" not in current_url.lower() and "cloudflare" not in title.lower():
                # Check if challenge iframe is gone
                frames = page.frames
                challenge_frames = [f for f in frames if "cloudflare" in f.url.lower() or "challenges" in f.url.lower()]
                if len(challenge_frames) <= 1:  # Only main frame should remain
                    await page.wait_for_load_state("networkidle", timeout=5000)
                    return True
        except Exception:
            pass
        await asyncio.sleep(1)
    return False


async def submit_to_directory(dir_info: dict, browser, output_dir: str) -> dict:
    """Submit FateWise to a single directory via browser."""
    result = {
        "dir_name": dir_info["name"],
        "url": dir_info["url"],
        "timestamp": datetime.now().isoformat(),
    }
    
    context = None
    page = None
    
    try:
        print(f"\n{'='*60}")
        print(f"Submitting to: {dir_info['name']}")
        print(f"URL: {dir_info['url']}")
        
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-US"
        )
        
        page = await context.new_page()
        
        # Navigate with extended timeout for Cloudflare
        print(f"  Navigating...")
        await page.goto(dir_info["url"], wait_until="domcontentloaded", timeout=30000)
        
        # Wait for Cloudflare if present
        print(f"  Waiting for security check...")
        cf_passed = await wait_for_cloudflare(page, timeout=25)
        
        if not cf_passed:
            print(f"  ⚠️ Cloudflare challenge may still be active")
        
        # Wait for page to fully load
        await asyncio.sleep(3)
        
        # Take initial screenshot
        screenshot_path = os.path.join(output_dir, f"screenshot_{dir_info['name'].replace(' ', '_')}.png")
        await page.screenshot(path=screenshot_path, full_page=False)
        
        # Try to fill the form
        print(f"  Attempting to auto-detect and fill form fields...")
        filled = await fill_form(page, dir_info.get("fields", {}))
        
        if filled == 0:
            # Try common form patterns with label-based detection
            print(f"  Trying label-based field detection...")
            
            # Find all inputs on the page
            inputs = await page.query_selector_all("input, textarea")
            print(f"  Found {len(inputs)} form fields on page")
            
            # Map inputs by placeholder/label text
            for inp in inputs:
                try:
                    name = await inp.get_attribute("name") or ""
                    placeholder = await inp.get_attribute("placeholder") or ""
                    input_type = await inp.get_attribute("type") or "text"
                    
                    name_lower = (name + placeholder).lower()
                    
                    if ("name" in name_lower or "tool" in name_lower) and input_type != "submit":
                        await inp.click()
                        await inp.fill(PRODUCT["name"])
                        filled += 1
                        print(f"    Filled Name via name='{name}' placeholder='{placeholder}'")
                    elif ("url" in name_lower or "website" in name_lower) and input_type != "submit":
                        await inp.click()
                        await inp.fill(PRODUCT["url"])
                        filled += 1
                        print(f"    Filled URL via name='{name}'")
                    elif ("desc" in name_lower or "brief" in name_lower) and input_type != "submit":
                        await inp.click()
                        await inp.fill(PRODUCT["description"][:400])
                        filled += 1
                        print(f"    Filled Description via name='{name}'")
                except Exception:
                    continue
        
        # Try to find and click submit button
        print(f"  Looking for Submit/Submit button...")
        try:
            submit_buttons = await page.query_selector_all('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Submit Tool"), a:has-text("Submit")')
            print(f"  Found {len(submit_buttons)} potential submit buttons")
            
            for btn in submit_buttons:
                try:
                    text = await btn.inner_text()
                    if any(word in text.lower() for word in ["submit", "add", "list your"]):
                        await btn.click()
                        print(f"  Clicked: {text}")
                        
                        # Wait for response
                        await asyncio.sleep(5)
                        
                        # Take screenshot of result
                        result_path = os.path.join(output_dir, f"result_{dir_info['name'].replace(' ', '_')}.png")
                        await page.screenshot(path=result_path)
                        
                        current_url = page.url
                        result["status"] = "submitted"
                        result["final_url"] = current_url
                        print(f"  ✅ Submitted! Final URL: {current_url}")
                        break
                except Exception as e:
                    continue
        except Exception as e:
            print(f"  ⚠️ Submit button click failed: {e}")
        
        if filled > 0 and result.get("status") != "submitted":
            # Form was partially or fully filled but submit wasn't clicked/failed
            result["status"] = f"partial-fill-{filled}-fields-filled"
            
        elif filled == 0:
            result["status"] = "no-form-detected"
        
        # Take final screenshot
        if filled > 0 or result.get("status") not in ["submitted"]:
            screenshot_path_final = os.path.join(output_dir, f"final_{dir_info['name'].replace(' ', '_')}.png")
            await page.screenshot(path=screenshot_path_final, full_page=True)
        
        print(f"  Result: {result['status']}")
        
    except Exception as e:
        error_msg = str(e)[:200]
        print(f"  ❌ Error: {error_msg}")
        result["status"] = f"error-{type(e).__name__}"
        result["error"] = error_msg
    
    finally:
        if context:
            await context.close()
    
    RESULTS.append(result)
    return result


async def main():
    output_dir = os.path.join(os.path.dirname(__file__), "fatewise_browser_submissions")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"FateWise Browser Directory Submission")
    print(f"Product: {PRODUCT['name']} ({PRODUCT['url']})")
    print(f"Output dir: {output_dir}")
    print(f"Directories to attempt: {len(DIRECTORIES)}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
        )
        
        try:
            for i, dir_info in enumerate(DIRECTORIES):
                print(f"\n[{i+1}/{len(DIRECTORIES)}] Processing: {dir_info['name']}")
                
                result = await submit_to_directory(dir_info, browser, output_dir)
                
                # Rate limiting between submissions
                if i < len(DIRECTORIES) - 1:
                    delay = random.randint(5, 10)
                    print(f"  Waiting {delay}s before next submission...")
                    await asyncio.sleep(delay)
        finally:
            await browser.close()
    
    # Save results
    results_file = os.path.join(output_dir, "browser_submission_results.json")
    with open(results_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "product": PRODUCT,
            "results": RESULTS
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print("SUBMISSION SUMMARY")
    print(f"{'='*60}")
    
    for r in RESULTS:
        status_icon = "✅" if r["status"] == "submitted" else ("⚠️" if "partial" in str(r.get("status", "")) or "fill" in str(r.get("status", "")) else "❌")
        print(f"  {status_icon} {r['dir_name']}: {r.get('status', 'unknown')}")
    
    print(f"\nResults saved to: {results_file}")
    print(f"Screenshots in: {output_dir}/")


if __name__ == "__main__":
    asyncio.run(main())
