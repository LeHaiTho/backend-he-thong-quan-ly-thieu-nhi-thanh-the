# GitHub Actions — Deploy backend lên Vercel

Repo: [LeHaiTho/backend-he-thong-quan-ly-thieu-nhi-thanh-the](https://github.com/LeHaiTho/backend-he-thong-quan-ly-thieu-nhi-thanh-the)

Workflow: `.github/workflows/deploy.yml`

## Secrets (Settings → Secrets and variables → Actions)

| Secret | Mô tả |
|--------|--------|
| `VERCEL_TOKEN` | [Vercel Account Token](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `orgId` trong `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` backend trên Vercel |

## Biến Vercel (Production)

- `DB_*` — Railway public host  
- `JWT_SECRET`, `JWT_EXPIRE`  
- `APP_URL` = `https://server-two-zeta-47.vercel.app`  
- `NODE_ENV` = `production`

Frontend repo riêng: [frontend-he-thong-quan-ly-thieu-nhi-thanh-the](https://github.com/LeHaiTho/frontend-he-thong-quan-ly-thieu-nhi-thanh-the)
