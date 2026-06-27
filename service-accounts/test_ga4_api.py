#!/usr/bin/env python3
"""Test GA4 Data API with service account credentials."""

import json
import sys
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA_KEY_PATH = "/home/zxw/.openclaw/workspace/ez-mystic/service-accounts/fatewise-analytics-sa.json"
GA4_PROPERTY_ID = "266936974"  # extracted from G-BKXH2XKRMJ

def main():
    creds = service_account.Credentials.from_service_account_file(SA_KEY_PATH)
    
    # Build GA4 Data API client
    analytics = build('analyticsdata', 'v1beta', credentials=creds)
    
    # Fetch last 7 days active users
    today = datetime.now()
    start_date = (today - timedelta(days=7)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    print(f"Fetching active users from {start_date} to {end_date}...")
    
    try:
        response = analytics.properties().runReport(
            property=f'properties/{GA4_PROPERTY_ID}',
            body={
                'dimensions': [
                    {'name': 'date'}
                ],
                'metrics': [
                    {'name': 'activeUsers'}
                ]
            }
        ).execute()
        
        print(json.dumps(response, indent=2, ensure_ascii=False))
        
        # Print summary
        rows = response.get('rows', [])
        total_users = sum(r.get('metricValues', [{}])[0].get('value', 0) for r in rows)
        print(f"\nTotal active users (last 7 days): {total_users}")
        
    except Exception as e:
        print(f"Error: {e}")
        print(f"\nThis likely means the service account needs GA4 property access.")
        print("To fix:")
        print("  1. Go to https://analytics.google.com")
        print("  2. Admin → Property Settings → Property Access Management")
        print("  3. Add open-361@fatewise-analytics.iam.gserviceaccount.com")
        print("  4. Grant 'Read & Analyze' role")

if __name__ == '__main__':
    main()
