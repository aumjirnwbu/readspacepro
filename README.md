# Mini Project2 — ระบบเว็บคอลเลกชันหนังสือการ์ตูน

## เทคโนโลยีที่ใช้

- Frontend: React, Vite และ TypeScript
- State Management: Zustand
- Data Fetching: TanStack Query
- Backend: Express RESTful API
- ORM: Prisma
- Database: SQLite

ระบบทำงานแบบ Full-Stack โดยข้อมูลหนังสือ คอลเลกชัน แต้มสะสม ผู้ใช้ และประวัติการทำรายการเก็บอยู่ในฐานข้อมูลที่พัฒนาขึ้นเอง ไม่มีการดึงข้อมูลจาก API ภายนอก

## ความสามารถหลัก

- แสดงรายการและรายละเอียดหนังสือการ์ตูน
- ค้นหาและกรองข้อมูลหนังสือ
- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- บันทึกหนังสือในคอลเลกชันส่วนตัว
- ปลดล็อกหนังสือด้วยแต้มสะสม
- เติมแต้มและดูประวัติการใช้แต้ม
- CRUD ข้อมูลหนังสือผ่าน RESTful API

## โครงสร้างฐานข้อมูล

- `User`: ข้อมูลผู้ใช้ อีเมล รหัสผ่าน และแต้มสะสม
- `Comic`: ข้อมูลหนังสือ ผู้แต่ง ปก หมวดหมู่ ราคาแต้ม และเรื่องย่อ
- `Collection`: ความสัมพันธ์ระหว่างผู้ใช้และหนังสือที่บันทึกไว้
- `Unlocked`: ความสัมพันธ์ระหว่างผู้ใช้และหนังสือที่ปลดล็อกแล้ว
- `Transaction`: ประวัติการเติมแต้มและการใช้แต้ม

ข้อมูลตัวอย่างจำนวน 32 รายการถูกสร้างผ่านไฟล์ `prisma/seed.ts`
ไฟล์รูปปกเก็บไว้ใน `server/uploads/covers/` และ Backend ให้บริการรูปผ่าน URL `/uploads/covers/...`

## วิธีติดตั้งและรันโปรเจกต์

ติดตั้งแพ็กเกจ:

```bash
npm install
```

สร้าง Prisma Client และฐานข้อมูล:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

รัน Frontend และ Backend พร้อมกัน:

```bash
npm run dev:all
```

- เว็บไซต์: <http://localhost:5173>
- Backend API: <http://localhost:3001/api>

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
