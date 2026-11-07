# PRO SHOP — Cloud-Based Mobile Shop Management System

**PRO SHOP** is a modern, enterprise-grade Mobile Shop Management and POS System designed specifically for mobile phone retailers, electronics shops, and repairing centers.

---

## 🌟 Key Features

1. **Hardware & Mobile Scanning Engine**
   - Instant USB / Bluetooth barcode scanner gun input (burst detection).
   - Camera & Webcam barcode / QR / IMEI scanner.
   - Mobile native photo snap scanner (100% reliable on all mobile phones).
2. **Individual IMEI & Device Tracking**
   - Strict 15-digit unique IMEI lifecycle tracking (`AVAILABLE`, `RESERVED`, `SOLD`, `RETURNED`, `IN_REPAIR`).
   - Prevents duplicate physical device entries.
3. **Sales & Fast POS Terminal**
   - Quick barcode/IMEI cart addition.
   - Multiple payment methods: **Cash**, **JazzCash**, **Easypaisa**, **Bank Transfer**, **Card**, and **Credit (Udhaar)**.
   - Thermal receipt and A4 invoice generation.
4. **Mobile Repairing Workflow**
   - Customer repair ticket generation with fault diagnosis, device condition, accessories received.
   - Automated spare parts consumption directly from inventory.
   - Initial labour charges and live status updates (Received &rarr; Under Inspection &rarr; In Progress &rarr; Ready for Delivery &rarr; Delivered).
5. **Double-Entry Accounting & Accurate Profit Engine**
   - Fully balanced debit/credit ledger for all sales, purchases, and expenses.
   - **Gross Profit** = `Net Sales - Cost of Goods Sold (COGS)`.
   - **Net Profit** = `Gross Profit - Operating Expenses`.
   - Dedicated Chart of Accounts (Cash, Banks, Mobile Wallets, Receivables, Payables).
6. **Mobile Responsive & Retail POS Style Navigation**
   - Touch-optimized layout with sticky bottom navigation bar (Home, POS, Scan, Repairs, Menu).

---

## 🏗️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, HTML5-QRCode.
- **Backend:** NestJS, TypeScript, Class Validator, Swagger API Docs, Passport JWT.
- **Database:** Prisma ORM with PostgreSQL / SQLite support.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ installed
- npm / pnpm / yarn

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run start
```
The backend REST API will be available at: `http://localhost:5000/api`  
Swagger Documentation: `http://localhost:5000/api/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at: `http://localhost:3000`

---

## 📄 License
UNLICENSED — Proprietary software for PRO SHOP.
