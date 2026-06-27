#!/usr/bin/env python3
"""Set up GA4 Data API for fatewise-analytics project."""

import json
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SA_KEY_PATH = "/home/zxw/.openclaw/workspace/ez-mystic/service-accounts/fatewise-analytics-sa.json"
PROJECT_ID = "fatewise-analytics"
GA4_PROPERTY_ID = "G-BKXH2XKRMJ"

def main():
    # Load service account credentials
    creds = service_account.Credentials.from_service_account_file(SA_KEY_PATH)
    
    # Step 1: Enable the GA4 Data API
    print("Step 1: Enabling GA4 Data API...")
    service_management = build('servicemanagement', 'v1', credentials=creds)
    enable_request = service_management.services().enable(
        name=f'projects/{PROJECT_ID}/services/analyticsdata.googleapis.com'
    )
    try:
        enable_response = enable_request.execute()
        print(f"  ✅ API enabled: {enable_response.get('operationName', 'unknown')}")
    except HttpError as e:
        if '403' in str(e):
            print(f"  ⚠️ Permission denied (likely need org admin): {e}")
        elif 'already enabled' in str(e).lower() or '409' in str(e):
            print("  ✅ API already enabled")
        else:
            print(f"  ❌ Error: {e}")
            sys.exit(1)
    
    # Step 2: Grant the service account access to GA4 data
    print(f"\nStep 2: Granting 'Analytics Reader' role to service account...")
    iam = build('iam', 'v1', credentials=creds)
    sa_email = f"open-361@{PROJECT_ID}.iam.gserviceaccount.com"
    
    # Try to add the service account as a viewer on the project
    binding = {
        "role": "roles/analytics.reader",
        "members": [f"serviceAccount:{sa_email}"]
    }
    
    try:
        policy = iam.projects().getIamPolicy(
            resource=f"projects/{PROJECT_ID}",
            body={"pageSize": 100}
        ).execute()
        
        bindings = policy.get('bindings', [])
        # Check if already granted
        found = False
        for b in bindings:
            if b.get('role') == 'roles/analytics.reader':
                if f"serviceAccount:{sa_email}" in b.get('members', []):
                    print(f"  ✅ Service account already has Analytics Reader role")
                    found = True
                    break
        
        if not found:
            bindings.append(binding)
            policy['bindings'] = bindings
            iam.projects().setIamPolicy(
                resource=f"projects/{PROJECT_ID}",
                body={"policy": policy}
            ).execute()
            print(f"  ✅ Granted Analytics Reader role to {sa_email}")
    except HttpError as e:
        print(f"  ⚠️ Could not set IAM policy: {e}")
        print(f"  ℹ️ You may need to manually grant 'Analytics Reader' role in the console")
    
    # Step 3: Test the GA4 Data API
    print(f"\nStep 3: Testing GA4 Data API...")
    try:
        analytics_data = build('analyticsdata', 'v1beta', credentials=creds)
        response = analytics_data.properties().batchGet(
            body={
                'propertyNames': [f'properties/{GA4_PROPERTY_ID.split(":")[1]}']
            }
        ).execute()
        print(f"  ✅ GA4 Data API working! Properties found: {len(response.get('reports', []))}")
    except HttpError as e:
        error_details = e.content.decode() if hasattr(e, 'content') else str(e)
        if '403' in error_details or 'PERMISSION_DENIED' in error_details:
            print(f"  ⚠️ Permission denied - need to grant GA4 access")
            print(f"     Go to: https://analytics.google.com → Admin → Property Access Management")
            print(f"     Add {sa_email} as 'Read & Analyze'")
        else:
            print(f"  ⚠️ API error: {e}")
    
    print("\n✅ Setup complete!")
    print(f"\nNext steps:")
    print(f"  1. If API test failed, manually add {sa_email} to GA4 property")
    print(f"     URL: https://analytics.google.com → Admin → Property Access Management")
    print(f"  2. Use the service account key for API calls")
    print(f"  3. Run: python3 ga4_api_fetch.py to fetch daily data")

if __name__ == '__main__':
    main()
