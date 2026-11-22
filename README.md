# Mini Project2 — ระบบเว็บคอลเลกชันหนังสือการ์ตูน

## เทคโนโลยีที่ใช้

- Frontend: React, Vite และ TypeScript
- State Management: Zustand
- Data Fetching: TanStack Query
- Backend: Express RESTful API
- ORM: Prisma
- Database: PostgreSQL บน Supabase

ระบบทำงานแบบ Full-Stack โดยข้อมูลหนังสือ คอลเลกชัน แต้มสะสม ผู้ใช้ และประวัติการทำรายการเก็บใน PostgreSQL บน Supabase ผ่าน Prisma ORM ไม่มีการดึงข้อมูลจาก API ภายนอก

## ความสามารถหลัก

- แสดงรายการและรายละเอียดหนังสือการ์ตูน
- ค้นหาและกรองข้อมูลหนังสือ
- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- กำหนดบทบาท `ADMIN` สำหรับจัดการข้อมูลหนังสือ
- บันทึกหนังสือในคอลเลกชันส่วนตัว
- ปลดล็อกหนังสือด้วยแต้มสะสม
- เติมแต้มและดูประวัติการใช้แต้ม
- CRUD ข้อมูลหนังสือผ่าน RESTful API
- หน้าจัดการหนังสือ `/admin/comics` สำหรับเพิ่ม แก้ไข และลบข้อมูล

## โครงสร้างฐานข้อมูล

- `User`: ข้อมูลผู้ใช้ อีเมล รหัสผ่าน และแต้มสะสม
- `Comic`: ข้อมูลหนังสือ ผู้แต่ง ปก หมวดหมู่ ราคาแต้ม และเรื่องย่อ
- `Collection`: ความสัมพันธ์ระหว่างผู้ใช้และหนังสือที่บันทึกไว้
- `Unlocked`: ความสัมพันธ์ระหว่างผู้ใช้และหนังสือที่ปลดล็อกแล้ว
- `Transaction`: ประวัติการเติมแต้มและการใช้แต้ม

ข้อมูลตัวอย่างจำนวน 32 รายการถูกสร้างผ่านไฟล์ `prisma/seed.ts`
ไฟล์รูปปกเก็บไว้ใน `server/uploads/covers/` และ Backend ให้บริการรูปผ่าน URL `/api/uploads/covers/...`

## วิธีติดตั้งและรันโปรเจกต์

ติดตั้งแพ็กเกจ:

```bash
npm install
```

### ตั้งค่า Supabase

1. สร้างโปรเจกต์ใน Supabase
2. จากหน้า Supabase เลือก **Connect** แล้วคัดลอก Connection String สำหรับ Transaction Pooler และ Direct connection
3. เปิดไฟล์ `.env` แล้วแทนค่าตัวอย่างใน `DATABASE_URL` และ `DIRECT_URL` ด้วย Connection String จาก Supabase อย่าส่งรหัสผ่านฐานข้อมูลในแชตหรือ commit ไฟล์ `.env`
   - `DATABASE_URL`: ใช้ Transaction Pooler สำหรับ Backend (โดยทั่วไปใช้พอร์ต `6543` และ `pgbouncer=true`)
   - `DIRECT_URL`: ใช้ Direct connection สำหรับ Prisma Migrate (โดยทั่วไปใช้พอร์ต `5432`)
4. ถ้า Connection String มีอักขระพิเศษในรหัสผ่าน ให้ URL-encode ก่อนนำไปใส่ใน URL

ตัวอย่างรูปแบบ URL อยู่ในไฟล์ `.env.example`

สร้าง Prisma Client, ตารางฐานข้อมูล และข้อมูลตัวอย่าง:

```bash
npm install
npx prisma generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

รัน Frontend และ Backend พร้อมกัน:

```bash
npm run dev:all
```

- เว็บไซต์: <http://localhost:5173>
- Backend API: <http://localhost:3001/api>

ฐานข้อมูล SQLite เดิมที่อยู่ในเครื่องจะไม่ถูกย้ายขึ้น Supabase อัตโนมัติ คำสั่ง Seed จะเพิ่มข้อมูลตัวอย่างในฐานข้อมูล Supabase

## บัญชีแอดมินสำหรับสาธิต

- อีเมล: `demo@example.com`
- รหัสผ่าน: `1234`

ผู้ใช้ที่สมัครใหม่จะเป็นบทบาท `USER` ส่วนบัญชีทดลองข้างต้นเป็น `ADMIN` ใช้บัญชีแอดมินยืนยันตัวตนในหน้าจัดการหนังสือ การเพิ่ม แก้ไข และลบจะตรวจบทบาทและรหัสผ่านซ้ำที่ Backend ทุกครั้ง โดยส่ง Basic Authorization และไม่ใช้ token/session

รูปแบบนี้เป็นเพียงต้นแบบสำหรับงานเรียน รหัสผ่านยังเก็บและตรวจแบบข้อความธรรมดา และ Basic Authorization ไม่เข้ารหัสข้อมูล จึงไม่ควรเปิดระบบนี้บนอินเทอร์เน็ตหรือใช้กับข้อมูลจริง

## Deploy บน Vercel

โปรเจกต์เตรียม `vercel.json` สำหรับ Vite SPA และ Express API Functions ไว้แล้ว โดยแยก entry point ตาม endpoint เพื่อให้ Vercel รองรับทั้ง API path แบบซ้อน เช่น `/api/auth/login` และ `/api/comics/:id`:

1. Push โปรเจกต์ขึ้น GitHub แล้วเลือก **Add New → Project** ใน Vercel เพื่อ Import repository
2. ใช้ Root Directory เป็นโฟลเดอร์โปรเจกต์; Framework Preset เป็น Vite; Build Command เป็น `npm run build`; Output Directory เป็น `dist`
3. ใน Vercel Project Settings → Environment Variables เพิ่ม:
   - `DATABASE_URL`: Supabase Transaction Pooler URL (port `6543`, ตั้ง `pgbouncer=true`)
   - `DIRECT_URL`: Supabase Direct connection URL (port `5432`) สำหรับ Prisma Migrate
   - `API_PUBLIC_URL` (ไม่บังคับ): URL หลักของ Vercel deployment หากต้องการกำหนดโดเมนรูปปกเอง; หากไม่ตั้ง โค้ดจะใช้ `VERCEL_URL`
4. Deploy แล้วตรวจ `https://<โดเมนของเว็บ>/api/health`, `/api/comics` และลองเข้าสู่ระบบ เพื่อยืนยันว่า API ที่มี path ซ้อนทำงานด้วย
5. ถ้าเป็น Supabase โปรเจกต์เดิมที่รัน migration แล้ว ไม่ต้อง seed ซ้ำ; บัญชีสาธิต `demo@example.com` / `1234` ใช้ได้

โค้ดจะใช้ `/api` บน Production โดยอัตโนมัติ และ Vercel จะส่ง API ไปที่ Express Function ส่วนการรันในเครื่องยังใช้ `http://localhost:3001/api`

**คำเตือน:** บัญชีสาธิตเป็นแอดมินที่ทราบรหัสผ่าน และระบบไม่มี password hash/token ตามขอบเขตต้นแบบ ผู้ที่เข้าถึงเว็บสาธารณะอาจจัดการข้อมูลหนังสือได้ ไม่ควรใช้กับข้อมูลจริง

หากต้องการรันแยกกัน ให้เปิดสอง Terminal และรันคำสั่งต่อไปนี้:

```bash
npm run dev:server
```

```bash
npm run dev
```

## บัญชีสำหรับทดลอง

- อีเมล: `demo@example.com`
- รหัสผ่าน: `1234`

## คำสั่งตรวจสอบและสร้างโปรเจกต์

ตรวจสอบโค้ด:

```bash
npm run lint
```

สร้างไฟล์สำหรับใช้งานจริง:

```bash
npm run build
```