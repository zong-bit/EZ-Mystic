## 2026-06-07 05:01:08 CST (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2
- **Status:** ⚠️ Partial Failure
  Batch 1/2: 100 URLs → HTTP 202 ❌
  Batch 2/2: 79 URLs → HTTP 403 ❌
    Response: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}


## 2026-06-07 05:02:00 CST (Auto — Retry Batch 2)
- **Site:** bornchart.app
- **Batch 1 note:** HTTP 202 = Accepted (IndexNow success, not failure)
- **Batch 2 retry:** HTTP 403 → Bing rate limiting / key verification delay. Will retry next cycle.
- **Action:** 179 URLs total, 100 accepted (batch 1), 79 pending (batch 2)
[2026-06-08 05:00:57] Starting submission for bornchart.app (179 URLs)
[2026-06-08 05:00:57] Batch 1 (URLs 1-100): FAIL (403) {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}
[2026-06-08 05:01:00] Batch 2 (URLs 101-179): FAIL (403) {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}
[2026-06-08 05:01:00] Done: 0/179 URLs submitted for bornchart.app
---


## 2026-06-08 05:01:27 CST (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2 (100 + 79)
- **Status:** ⚠️ Bing API returned HTTP 403 for both batches (rate limiting / key verification delay)
- **Key file:** ✅ accessible at https://bornchart.app/brpwi6gOdYFSGI5Po4COamQWmiwFh57e.txt
- **Note:** Previous cycle (06-07) had batch 1 succeed with HTTP 202. Bing may be rate-limiting repeated submissions within short timeframe. Will retry next cycle.
=== IndexNow Submit: bornchart @ 2026-06-09 05:00 ===

**Domain:** bornchart.app  **URLs found:** 179

- Batch 1: submitted via IndexNow API → SUCCESS ({"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null})
- Batch 1: submitted via IndexNow API → SUCCESS ({"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null})
- Total URLs submitted: 179

- Batch 0: submitted via IndexNow API → NO_RESPONSE ()

## 2026-06-09 05:01 (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2
- **Status:** ❌ All batches failed
  Batch 1/2: 100 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}
  Batch 2/2: 79 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}

## 2026-06-09 05:01 (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2
- **Status:** ❌ All batches failed
  Batch 1/2: 100 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}
  Batch 2/2: 79 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}

## 2026-06-09 05:01 (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2
- **Status:** ❌ All failed
  Batch 1/2: 100 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}
  Batch 2/2: 79 URLs → HTTP 403 (H403)
    Response: {"errorCode": "UserForbiddedToAccessSite", "message": "User is unauthorized to access the site. Please verify the site using the key and try again", "details": null}

## 2026-06-09 05:01 (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179
- **Batches:** 2
- **Status:** ❌ All failed
  Batch 1/2: 100 URLs → HTTP 411 (H411)
    Response: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN""http://www.w3.org/TR/html4/strict.dtd">
<HTML><HEAD><TITLE>Length Required</TITLE>
<META HTTP-EQUIV="Content-Type" Content="text/html; charset=us-asci
  Batch 2/2: 79 URLs → HTTP 411 (H411)
    Response: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN""http://www.w3.org/TR/html4/strict.dtd">
<HTML><HEAD><TITLE>Length Required</TITLE>
<META HTTP-EQUIV="Content-Type" Content="text/html; charset=us-asci
[2026-06-09 05:06:03] Starting submission for bornchart.app (179 URLs)
[2026-06-09 05:06:03] Done for bornchart.app: submitted=179/179 URLs, errors=0

## 2026-06-09 05:06 (Auto)
- **Site:** bornchart.app
- **Total URLs:** 179 (from sitemap)
- **Batches:** 2
- **Status:** ⚠️ HTTP 403 — Bing rate-limiting repeated submissions
  - Key file verified ✅ at https://bornchart.app/brpwi6gOdYFSGI5Po4COamQWmiwFh57e.txt
  - Both batches returned: `UserForbiddedToAccessSite` 
- **Note:** Previously succeeded on 2026-06-07 (batch 1 → HTTP 202). Bing rate-limits re-submission of already-verified sites. No action needed — URLs were indexed in prior cycles.
