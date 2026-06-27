#!/usr/bin/env python3
"""GA4 Data API scraper for FateWise daily reporting.
Uses official GA4 Data API with service account authentication.
"""

import json
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path

SA_KEY_PATH = Path(__file__).parent.parent / "service-accounts" / "fatewise-analytics-sa.json"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xgaxejeaxfhlupguqteu.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_Ic345MFMBPwc6dtrUEWCgA_L27K74dX")
GA4_PROPERTY_ID = "538688356"  # from G-BKXH2XKRMJ

def sign_jwt(payload_dict, private_key_pem, key_id):
    """Sign a JWT with RS256."""
    import base64
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives.asymmetric import padding
    
    header = {"alg": "RS256", "typ": "JWT", "kid": key_id}
    def b64(data): return base64.urlsafe_b64encode(data).rstrip(b'=').decode()
    header_b64 = b64(json.dumps(header, separators=(',', ':')).encode())
    payload_b64 = b64(json.dumps(payload_dict, separators=(',', ':')).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    pk = serialization.load_pem_private_key(private_key_pem.encode(), password=None, backend=default_backend())
    sig = pk.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
    return f"{header_b64}.{payload_b64}.{b64(sig)}"

def get_oauth_token(sa_key_path):
    """Get OAuth2 access token from service account."""
    import urllib.request, urllib.parse
    import time
    import os
    os.environ['http_proxy'] = 'http://127.0.0.1:7897'
    os.environ['https_proxy'] = 'http://127.0.0.1:7897'
    os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7897'
    os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7897'
    
    with open(sa_key_path) as f:
        sa = json.load(f)
    
    now = int(time.time())
    assertion = sign_jwt({
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/analytics.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "exp": now + 3600,
        "iat": now
    }, sa["private_key"], sa["private_key_id"])
    
    token_req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    resp = urllib.request.urlopen(token_req, timeout=15)
    return json.loads(resp.read())["access_token"]

def fetch_ga4_data(access_token, start_date, end_date):
    """Fetch GA4 report data via Data API."""
    import urllib.request
    import os
    os.environ['http_proxy'] = 'http://127.0.0.1:7897'
    os.environ['https_proxy'] = 'http://127.0.0.1:7897'
    os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7897'
    os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7897'
    
    api_url = f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4_PROPERTY_ID}:runReport"
    body = {
        "dateRanges": [{"startDate": start_date, "endDate": end_date}],
        "dimensions": [{"name": "date"}],
        "metrics": [
            {"name": "activeUsers"},
            {"name": "newUsers"},
            {"name": "screenPageViews"},
            {"name": "averageSessionDuration"},
            {"name": "bounceRate"}
        ]
    }
    
    api_req = urllib.request.Request(
        api_url,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    )
    api_resp = urllib.request.urlopen(api_req, timeout=30)
    return json.loads(api_resp.read())

def save_to_supabase(rows, access_token):
    """Save ALL days' data to Supabase ga4_daily_data table (not just latest)."""
    import urllib.request
    import os
    os.environ['http_proxy'] = 'http://127.0.0.1:7897'
    os.environ['https_proxy'] = 'http://127.0.0.1:7897'
    os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7897'
    os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7897'
    
    today = datetime.now().strftime('%Y-%m-%d')
    saved_count = 0
    
    for row in rows.get("rows", []):
        date_str = row["dimensionValues"][0]["value"]
        save_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
        
        # Skip today (incomplete data)
        if save_date == today:
            print(f"⏭️ Skipping today ({save_date}) — incomplete")
            continue
        
        metric_values = row["metricValues"]
        data = {
            "date": save_date,
            "domain": "bornchart.app",
            "active_users": int(metric_values[0]["value"]),
            "new_users": int(metric_values[1]["value"]),
            "screen_page_views": int(metric_values[2]["value"]),
            "avg_session_duration": float(metric_values[3]["value"]),
            "bounce_rate": float(metric_values[4]["value"]),
            "scraped_at": datetime.now().isoformat()
        }
        
        # Upsert: delete existing then insert
        delete_url = f"{SUPABASE_URL}/rest/v1/ga4_daily_data?date=eq.{save_date}&domain=eq.bornchart.app"
        delete_req = urllib.request.Request(
            delete_url,
            method="DELETE",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "return=minimal"
            }
        )
        try:
            urllib.request.urlopen(delete_req, timeout=10)
        except Exception:
            pass  # ignore if not exists
        
        insert_url = f"{SUPABASE_URL}/rest/v1/ga4_daily_data"
        insert_req = urllib.request.Request(
            insert_url,
            data=json.dumps(data).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
        )
        try:
            urllib.request.urlopen(insert_req, timeout=15)
            saved_count += 1
        except Exception as e:
            print(f"⚠️ Failed to save {save_date}: {e}")
    
    print(f"✅ Saved {saved_count} days to Supabase")
    return saved_count

def main():
    print(f"📊 GA4 Data API Scraper - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"   Property: {GA4_PROPERTY_ID}")
    
    # Get OAuth token
    print("Getting OAuth token...")
    access_token = get_oauth_token(SA_KEY_PATH)
    print("✅ Token obtained")
    
    # Fetch last 30 days (enough for meaningful monthly trends)
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    print(f"Fetching data ({start_date} → {end_date})...")
    result = fetch_ga4_data(access_token, start_date, end_date)
    
    # Print summary
    rows = result.get("rows", [])
    
    # Sort by date
    sorted_rows = sorted(rows, key=lambda r: r["dimensionValues"][0]["value"])
    
    # Calculate weekly stats (last 7 days)
    week_rows = sorted_rows[-7:]
    week_total_active = sum(int(r["metricValues"][0]["value"]) for r in week_rows)
    week_total_new = sum(int(r["metricValues"][1]["value"]) for r in week_rows)
    week_total_views = sum(int(r["metricValues"][2]["value"]) for r in week_rows)
    week_avg_duration = sum(float(r["metricValues"][3]["value"]) for r in week_rows) / len(week_rows)
    week_avg_bounce = sum(float(r["metricValues"][4]["value"]) for r in week_rows) / len(week_rows)
    
    # Calculate monthly stats (all rows)
    month_total_active = sum(int(r["metricValues"][0]["value"]) for r in sorted_rows)
    month_total_new = sum(int(r["metricValues"][1]["value"]) for r in sorted_rows)
    month_total_views = sum(int(r["metricValues"][2]["value"]) for r in sorted_rows)
    month_avg_duration = sum(float(r["metricValues"][3]["value"]) for r in sorted_rows) / len(sorted_rows)
    month_avg_bounce = sum(float(r["metricValues"][4]["value"]) for r in sorted_rows) / len(sorted_rows)
    
    print(f"\n📈 上周数据 (Last 7 days):")
    print(f"{'Date':<12} {'Active':>6} {'New':>5} {'Views':>6} {'Duration':>10} {'Bounce':>8}")
    print("-" * 50)
    for row in week_rows:
        date_str = row["dimensionValues"][0]["value"]
        mv = row["metricValues"]
        date_fmt = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
        duration_sec = float(mv[3]["value"])
        duration_str = f"{duration_sec:.0f}s" if duration_sec < 60 else f"{duration_sec/60:.1f}m"
        bounce_str = f"{float(mv[4]['value']):.0%}" if float(mv[4]['value']) > 0 else "N/A"
        print(f"{date_fmt:<12} {int(mv[0]['value']):>6} {int(mv[1]['value']):>5} {int(mv[2]['value']):>6} {duration_str:>10} {bounce_str:>8}")
    print("-" * 50)
    print(f"{'Week Total':<12} {week_total_active:>6} {week_total_new:>5} {week_total_views:>6}")
    print(f"{'Week Avg':<12} {week_total_active/len(week_rows):>6.1f} {week_total_new/len(week_rows):>5.1f} {week_total_views/len(week_rows):>6.1f} {week_avg_duration/60:.1f}m  {week_avg_bounce:>6.0%}")
    
    print(f"\n📈 本月数据 (Last 30 days):")
    print(f"{'Metric':<20} {'Value':>10}")
    print("-" * 35)
    print(f"{'Total Active Users':<20} {month_total_active:>10}")
    print(f"{'Total New Users':<20} {month_total_new:>10}")
    print(f"{'Total Page Views':<20} {month_total_views:>10}")
    print(f"{'Avg Daily Active':<20} {month_total_active/len(sorted_rows):>10.1f}")
    print(f"{'Avg Daily Views':<20} {month_total_views/len(sorted_rows):>10.1f}")
    print(f"{'Avg Session Duration':<20} {month_avg_duration/60:>10.1f}m")
    print(f"{'Avg Bounce Rate':<20} {month_avg_bounce:>10.0%}")
    print(f"{'Data Points':<20} {len(sorted_rows):>10}")
    
    # Save to Supabase
    print(f"\n💾 Saving to Supabase...")
    save_to_supabase(result, access_token)
    
    print("\n✅ Done!")

if __name__ == '__main__':
    main()
