# Axis Settler - Railway Cron Job

Automatic on-chain settlement script for Axis oracle feeds using Switchboard.

## Setup on Railway.app

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project → "Empty Project"
3. Click "Add Service" → "GitHub Repo" (or deploy this `scripts/` folder directly)

### 2. Configure Environment Variables

Add these environment variables in Railway dashboard:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://zryeulucckdgaiboxntn.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `SETTLER_PRIVATE_KEY` | Base58-encoded private key of settler wallet |
| `HELIUS_RPC_URL` | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` |

### 3. Configure Cron Schedule

The `railway.json` already configures the cron schedule to run every minute (`* * * * *`).

If you need to change it, go to Settings → Deploy → Cron Schedule.

### 4. Deploy

Railway will automatically:
1. Install dependencies from `package.json`
2. Run `npm start` (which runs `node settler.js`)
3. Execute every minute based on cron schedule

## How It Works

1. **Query Supabase**: Finds feeds with `status='pending'` and `resolution_date <= now()`
2. **On-Chain Settlement**: For each feed:
   - Loads Switchboard PullFeed
   - Fetches oracle signatures (3 signatures for consensus)
   - Builds and signs transaction with settler wallet
   - Sends transaction to Solana blockchain
3. **Update Database**: Updates feed with:
   - `status = 'settled'`
   - `settled_at = now()`
   - `settled_value = oracle price`
   - `settlement_tx = Solana signature`

## Logs

View logs in Railway dashboard → Service → Logs

Example output:
```
[2024-01-15T12:00:00.000Z] Starting settler job...
Found 2 feeds to settle
Settler wallet: 5abc...xyz

Processing feed abc-123: BTC Price Feed
Gateway: https://crossbar.switchboard.xyz
Got 3 oracle signatures
Transaction sent: 5xyz...abc
✅ Settled feed abc-123: value=42150.25, tx=5xyz...abc

[2024-01-15T12:00:05.000Z] Settler job complete: 2 settled, 0 failed
```

## Cost

Railway Hobby plan: **$5/month**
- Includes 500 execution hours/month
- More than enough for every-minute cron jobs

## Troubleshooting

### "Missing required environment variables"
- Check all 4 environment variables are set in Railway dashboard

### "No feeds to settle"
- Normal if no pending feeds have reached their resolution date

### Transaction failures
- Check settler wallet has enough SOL for gas (~0.01 SOL per transaction)
- Verify HELIUS_RPC_URL is valid
