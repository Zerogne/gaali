# Seeding MongoDB Database

## Prerequisites

1. **Set up MongoDB connection** in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DB_NAME=truck-weighing-dashboard
```

2. **Make sure MongoDB is running** (local or Atlas)

## Method 1: Via API Endpoint (Recommended)

1. Start your development server:
```bash
npm run dev
```

2. In another terminal, call the seed endpoint:
```bash
curl -X POST http://localhost:3000/api/seed
```

Or use a tool like Postman/Insomnia to POST to `http://localhost:3000/api/seed`

## Method 2: Via npm Script

1. Install tsx (TypeScript executor):
```bash
npm install -D tsx
```

2. Run the seed script:
```bash
npm run seed
```

## What Gets Seeded

### Companies (in `companies` collection):
- Altan Logistics LLC
- Steppe Mining Co.
- BlueRoad Transport
- Frontier Customs Partner

### Workers (in `company_{id}_workers` collections):
- 3 workers per company (12 total)
- All workers have password: `password123`

### Sample Truck Logs:
- 2 logs for Altan Logistics (in `company_altan-logistics_logs`)
- 2 logs for Steppe Mining (in `company_steppe-mining_logs`)

## Verify Seeding

After seeding, you can:
1. Login with any company
2. Use password `password123` for any worker
3. See sample logs in the dashboard
4. Test multi-tenant isolation (Company A can't see Company B's data)

## Troubleshooting

- **Connection Error**: Make sure MongoDB is running and `MONGODB_URI` is correct
- **No data after seeding**: Check MongoDB connection and database name
- **API returns 500**: Check server logs for detailed error messages

