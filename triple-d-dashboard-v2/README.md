# Triple D Finest Logistics Dashboard v2

This is a rebuilt static front-end version of your trucking dashboard.

## What is included
- Owner dashboard
- Driver board
- Client tracking board
- Add, edit, and delete loads
- Live fuel, expense, and net profit calculations
- 50/50 owner split totals
- Status filtering and search
- CSV export
- Demo role login
- Ready for Vercel deploy

## Files
- `index.html`
- `styles.css`
- `script.js`
- `vercel.json`

## Deploy to Vercel
1. Put these files in one folder.
2. Upload the folder to Vercel or connect through GitHub.
3. Deploy.

## Important note
This build is still using browser storage on the device.
That means it is ready to use now, but it is **not yet a shared live database**.

## To make it shared across Noel, Carlos, drivers, and clients
Use Supabase for the backend.

### Suggested Supabase table
Create a table named `loads` with columns like:
- `id` uuid primary key
- `load_id` text
- `date` date
- `broker_name` text
- `driver_name` text
- `pickup_location` text
- `delivery_location` text
- `load_status` text
- `gross_load` numeric
- `loaded_miles` numeric
- `deadhead_out` numeric
- `deadhead_return` numeric
- `mpg` numeric
- `fuel_price` numeric
- `driver_pay` numeric
- `other_expenses` numeric
- `notes` text
- `created_at` timestamp default now()

### Next code step
Replace the local storage functions in `script.js`:
- `getLoads()`
- `setLoads()`

with Supabase queries for:
- select
- insert
- update
- delete

## Recommended next upgrade after backend
- real email/password login
- owner-only protected pages
- driver-specific assigned load filtering
- client tracking by reference number
- invoice upload / POD upload
- maintenance and IFTA tracking
