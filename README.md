# Mini Project2 — ระบบคอลเลกชันหนังสือการ์ตูน

เว็บแอป Full-Stack สำหรับเรียกดูหนังสือ จัดการคอลเลกชันส่วนตัว สะสมแต้ม และจัดการข้อมูลหนังสือ โดยเชื่อม Frontend, REST API, Prisma ORM และ PostgreSQL บน Supabase เข้าด้วยกัน

## เทคโนโลยี

- **Frontend:** React, Vite, TypeScript, React Router
- **Data fetching/cache:** TanStack Query
- **Client state:** Zustand
- **Backend:** Express RESTful API
- **ORM:** Prisma
- **Database:** PostgreSQL บน Supabase
- **Deployment:** Vercel

โปรเจกต์ไม่ดึงรายการหนังสือจาก API ภายนอก ข้อมูลตัวอย่างสร้างจาก `prisma/seed.ts` ตามที่โจทย์อนุญาต

## ความสามารถ

- ดูรายการ ค้นหา และดูรายละเอียดหนังสือ
- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน
- เพิ่มและนำหนังสือออกจากคอลเลกชันส่วนตัว
- เติมแต้มจำลอง ปลดล็อกหนังสือ และดูประวัติธุรกรรม
- จัดการหนังสือแบบ CRUD ผ่านหน้า `/admin/comics`
- เก็บข้อมูลหนังสือ ผู้ใช้ คอลเลกชัน การปลดล็อก และธุรกรรมในฐานข้อมูล

หน้า `CustomExtended` ไม่ได้ทำ เนื่องจากโจทย์ระบุว่าเป็นหน้าพิเศษที่ทำหรือไม่ทำก็ได้

## ภาพรวมการทำงาน

1. หน้า React เรียก API ผ่าน `src/api/comicsApi.ts`
2. TanStack Query โหลด/อัปเดตข้อมูลจาก API และจัดการ cache
3. Zustand จัดการสถานะผู้ใช้ แต้ม คอลเลกชัน และรายการที่ปลดล็อก
4. Express ประมวลผล REST routes และเรียก Prisma
5. Prisma อ่านหรือเขียน PostgreSQL บน Supabase

ใน Production Frontend เรียก API ผ่าน `/api`; ในเครื่องเรียก `http://localhost:3001/api` ส่วน Vercel Functions ส่งคำขอต่อไปยัง Express app

## โครงสร้างข้อมูล

| Model | ข้อมูล |
|---|---|
| `User` | อีเมล รหัสผ่าน บทบาท และแต้ม |
| `Comic` | ชื่อเรื่อง ผู้แต่ง ภาษา ปก หมวดหมู่ ราคาแต้ม และเรื่องย่อ |
| `Collection` | ความสัมพันธ์ระหว่างผู้ใช้กับหนังสือที่บันทึก |
| `Unlocked` | หนังสือที่ผู้ใช้ปลดล็อก |
| `Transaction` | ประวัติเติมแต้มและใช้แต้ม |

มีข้อมูลหนังสือตัวอย่าง 32 รายการและบัญชีสาธิตใน `prisma/seed.ts` รูปปกเก็บใน `server/uploads/covers/` และเสิร์ฟผ่าน `/api/uploads/covers/...`

## REST API

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/api/health` | ตรวจว่า API ตอบสนอง |
| `GET` | `/api/comics` | อ่านรายการหนังสือ |
| `GET` | `/api/comics/:id` | อ่านรายละเอียดหนังสือ |
| `POST` | `/api/comics` | เพิ่มหนังสือ (ADMIN) |
| `PUT` | `/api/comics/:id` | แก้ไขหนังสือ (ADMIN) |
| `DELETE` | `/api/comics/:id` | ลบหนังสือ (ADMIN) |
| `POST` | `/api/auth/register` | สมัครสมาชิก |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ |
| `GET` | `/api/users/:id/state` | อ่านสถานะผู้ใช้ |
| `POST` / `DELETE` | `/api/users/:id/collection[/:comicId]` | เพิ่ม/นำหนังสือออกจากคอลเลกชัน |
| `POST` | `/api/users/:id/topup` | เติมแต้มจำลอง |
| `POST` | `/api/users/:id/unlock` | ใช้แต้มปลดล็อกหนังสือ |

## ติดตั้งและรันในเครื่อง

### 1. ติดตั้งแพ็กเกจ

```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล Supabase

1. สร้างโปรเจกต์ PostgreSQL บน Supabase
2. คัดลอก `.env.example` เป็น `.env` แล้วกรอก Connection String ของโปรเจกต์
   - PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
3. กำหนดตัวแปร:
   - `DATABASE_URL`: Connection Pooler สำหรับ Backend (โดยทั่วไป Transaction Pooler ใช้พอร์ต `6543` และ `pgbouncer=true`)
   - `DIRECT_URL`: Direct connection สำหรับ Prisma Migrate (โดยทั่วไปพอร์ต `5432`; หากเครือข่ายไม่รองรับ direct connection ให้ใช้ Session Pooler ตามค่าที่ Supabase ให้มา)
   - `PORT`: พอร์ต Backend ในเครื่อง ปกติใช้ `3001`
4. หากรหัสผ่านมีอักขระพิเศษ ให้ URL-encode ก่อนใส่ใน Connection String

**ห้าม commit หรือส่งไฟล์ `.env`** ไฟล์นี้ถูกกำหนดใน `.gitignore`; ใช้ `.env.example` เป็นแม่แบบและห้ามใส่รหัสผ่านจริงในไฟล์ตัวอย่าง

### 3. สร้างตารางและข้อมูลตัวอย่าง

```bash
npx prisma generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

ถ้าฐานข้อมูลมี migrations และข้อมูลแล้ว ไม่ต้องสร้าง migration เริ่มต้นซ้ำ การ seed ใช้ `upsert` สำหรับรายการตัวอย่าง

### 4. เปิด Frontend และ Backend

```bash
npm run dev:all
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>
- ตรวจ API: <http://localhost:3001/api/health>

หากต้องการเปิดแยก ให้ใช้คนละ Terminal:

```bash
npm run dev:server
```

```bash
npm run dev
```

## บัญชีสาธิต

- อีเมล: `demo@example.com`
- รหัสผ่าน: `1234`
- บทบาท: `ADMIN`

ผู้ใช้ที่สมัครใหม่จะได้บทบาท `USER` บัญชีสาธิตใช้เข้าสู่หน้า `/admin/comics` เพื่อจัดการหนังสือ

## Deploy บน Vercel

1. Import repository ใน Vercel และตั้ง Root Directory เป็นโฟลเดอร์โปรเจกต์
2. ใช้ Framework Preset `Vite`, Build Command `npm run build`, Output Directory `dist`
3. เพิ่ม Environment Variables ใน Vercel:
   - `DATABASE_URL`: Supabase Transaction Pooler URL
   - `DIRECT_URL`: Supabase Direct connection หรือ Session Pooler สำหรับ migrations
   - `API_PUBLIC_URL` (ไม่บังคับ): URL หลักของเว็บ หากต้องการกำหนด URL รูปปกเอง
4. ตรวจให้แน่ใจว่า migrations ถูกใช้กับฐานข้อมูลก่อนเปิดเว็บ
5. Deploy แล้วตรวจ:
   - `https://<โดเมน>/api/health` — ตรวจการตอบสนองของ API
   - `https://<โดเมน>/api/comics` — ตรวจว่าดึงข้อมูลจากฐานข้อมูลได้
   - ลองล็อกอินและเปิดหน้ารายละเอียดหนังสือ

`/api/health` ยืนยันเฉพาะว่า API ตอบสนอง ควรตรวจ `/api/comics` เพิ่มเพื่อยืนยันการเชื่อมต่อฐานข้อมูล

Production URL ปัจจุบัน: <https://readspacepro.vercel.app>

## Supabase Free Plan อาจ Pause

Supabase อาจพักโปรเจกต์ Free ที่มีกิจกรรมน้อยในช่วง 7 วัน หากหน้าเว็บไม่มีข้อมูลหรือ API ติดต่อฐานข้อมูลไม่ได้ ให้ตรวจสถานะใน Supabase Dashboard และเลือก Resume/Restore จากนั้นทดสอบ `/api/comics` และล็อกอินอีกครั้ง การ Resume ไม่ต้องแก้โค้ด แต่ Free Plan ไม่รับประกันว่าจะ Active ตลอดช่วงไม่มีการใช้งาน

ดูผลตรวจและสถานะล่าสุดเพิ่มเติมได้ที่ [testresult.md](./testresult.md) และใช้สคริปต์นำเสนอจาก [present.md](./present.md)

## คำสั่งตรวจสอบ

```bash
npm run lint
npx tsc -b
npx vite build
npm run build
```

`npm run build` รวม Prisma generate, TypeScript และ Vite build หากบน Windows พบ `EPERM` ตอน Prisma แทนที่ `query_engine-windows.dll.node` ให้ตรวจว่ามีโปรเซสพัฒนาเครื่องเดิมเปิดค้างอยู่หรือไม่ แล้วลองใหม่; รายงานผลตรวจล่าสุดระบุข้อผิดพลาดนี้ไว้

## ข้อจำกัดด้านความปลอดภัย

ระบบล็อกอินเป็นต้นแบบสำหรับงานเรียน รหัสผ่านเก็บแบบข้อความธรรมดา และการยืนยันแอดมินใช้ Basic Authorization โดยไม่มี token/session ตามขอบเขตที่กำหนด API สถานะ/คอลเลกชันอ้างอิง `userId` จาก URL ด้วย จึงไม่ควรใช้กับข้อมูลจริงหรือเปิดให้ใช้งานสาธารณะ บัญชี ADMIN สาธิตเป็นข้อมูลที่เปิดเผยได้
