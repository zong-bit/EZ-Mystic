# IndexNow Submission Log
Domain: bornchart.app
Key: yJWr0rWGgRfTy8PSwleCj9LX5q1VpReB-ipxtPH4VFBTPqf
Total URLs: 254
Batches: 3
---

## Batch 1/3 (100 URLs)
Response: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}

## Batch 2/3 (100 URLs)
Response: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}

## Batch 3/3 (54 URLs)
Response: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}

## ⚠️ Issue
Key file exists on server (https://bornchart.app/yJWr0rWGgRfTy8PSwleCcj9LX5q1VpReB-ipxtPH4VFBTPqf.txt returns correctly),
but Bing returns "UserForbiddedToAccessSite". Possible causes:
- Key was generated for a different domain/URL
- Bing cache needs time to pick up the key file
- Key format issue

## Summary
Total batches: 3
Successful: 0/3
Total URLs attempted: 254
Date: 2026-06-26 05:19:00 CST
## 2026-06-27 05:00:43 IndexNow 批量提交

- **域名**: bornchart.app
- **总 URL 数**: 254
- **批次**: 3 批 (每批最多 100)

- 第 1 批: 100 URLs → ❌ HTTP 403: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}
- 第 2 批: 100 URLs → ❌ HTTP 403: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}
- 第 3 批: 54 URLs → ❌ HTTP 403: {"errorCode":"UserForbiddedToAccessSite","message":"User is unauthorized to access the site. Please verify the site using the key and try again","details":null}

---

