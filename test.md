# รายงานตรวจสอบ Mini Project2: Full-Stack CRUD

วันที่ตรวจ: 22 พฤศจิกายน 2569
ขอบเขต: ตรวจข้อกำหนดจากซอร์สโค้ด ทดสอบ API บน Production และตรวจคำถามเรื่อง Supabase Free Plan
หมายเหตุ: รอบนี้แก้เฉพาะเอกสารรายงานนี้ ไม่ได้แก้โค้ดหรือเปลี่ยนข้อมูลในฐานข้อมูล

## สรุปผล

**ผ่านข้อกำหนดหลักของงาน Full-Stack CRUD**: Frontend React/Vite/TypeScript เชื่อม Express REST API ผ่าน TanStack Query และ Zustand; Backend ใช้ Prisma กับ PostgreSQL บน Supabase; มีระบบผู้ใช้/คอลเลกชันส่วนตัว และ CRUD หนังสือทั้ง API และหน้าเว็บ

ทดสอบ Production `https://readspacepro.vercel.app` เมื่อ 22 พฤศจิกายน 2569 แล้ว API อ่านข้อมูลจากฐานข้อมูลได้ 32 รายการ รายละเอียดหนังสือ สถานะผู้ใช้ การล็อกอินบัญชีสาธิต และไฟล์รูปปกตอบสำเร็จ จึงยืนยันได้ว่า Supabase **เชื่อมต่อและใช้งานได้ในเวลาที่ตรวจ** ไม่ใช่เพียง `/api/health` ที่ตอบสถานะจากตัวแอป

## ตรวจตามข้อกำหนด

| ข้อกำหนด | ผล | หลักฐาน/รายละเอียด |
|---|---|---|
| React + Vite + TypeScript | ผ่าน | Frontend ใช้ React/Vite และไฟล์ TypeScript |
| TanStack Query | ผ่าน | หน้ารายการ/รายละเอียดและหน้าจัดการใช้ `useQuery`/`useMutation` เรียก API |
| Zustand | ผ่าน | Store จัดการผู้ใช้ แต้ม คอลเลกชัน หนังสือที่ปลดล็อก และประวัติธุรกรรม พร้อม persist สถานะในเครื่อง |
| Backend RESTful API | ผ่าน | Express มี endpoint หนังสือ ผู้ใช้ ล็อกอิน สมัครสมาชิก คอลเลกชัน เติมแต้ม และปลดล็อก |
| Prisma ORM + ฐานข้อมูลที่จัดทำเอง | ผ่าน | Prisma schema/migrations กำหนด PostgreSQL บน Supabase และตารางของโปรเจกต์ |
| CRUD หนังสือ | ผ่าน | API มีอ่านรายการ/รายละเอียด เพิ่ม แก้ไข ลบ; หน้า `/admin/comics` มีฟอร์มจัดการและเรียก API |
| Personal Collection | ผ่านตามขอบเขตต้นแบบ | สมัคร/ล็อกอินด้วยอีเมลและรหัสผ่าน; เพิ่ม/นำหนังสือออกจากคอลเลกชัน และเก็บสถานะผู้ใช้ในฐานข้อมูล |
| ไม่ใช้ API ภายนอก | ผ่านจากการตรวจซอร์ส | Frontend เรียก API ของโปรเจกต์; ไม่พบการเรียก API หนังสือภายนอก ข้อมูลตัวอย่างสร้างจาก `prisma/seed.ts` |
| CustomExtended Page | ไม่ได้ทำ | เป็นส่วนที่โจทย์ระบุว่าไม่บังคับ |

### โครงสร้างและแหล่งอ้างอิงในโปรเจกต์

- Prisma models: `User`, `Comic`, `Collection`, `Unlocked`, `Transaction` ใน [schema.prisma](./prisma/schema.prisma)
- ข้อมูลตัวอย่าง 32 รายการและบัญชีสาธิตใน [seed.ts](./prisma/seed.ts)
- REST endpoints และการเชื่อม Prisma ใน [server/app.ts](./server/app.ts)
- Vercel Function entry points แยกตามเส้นทางในโฟลเดอร์ [api/](./api/)
- การเรียก API จาก Frontend ใน [comicsApi.ts](./src/api/comicsApi.ts)
- TanStack Query ใน [HomePage.tsx](./src/pages/HomePage.tsx) และ [ManageComicsPage.tsx](./src/pages/ManageComicsPage.tsx)
- Zustand ใน [useUserStore.ts](./src/store/useUserStore.ts)
- Routing หน้าจัดการหนังสือใน [router.tsx](./src/router.tsx)

### REST API ที่มีใน Backend

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/api/health` | ตรวจสถานะ API |
| `GET` | `/api/comics` | อ่านรายการหนังสือ |
| `GET` | `/api/comics/:id` | อ่านรายละเอียดหนังสือ |
| `POST` | `/api/comics` | เพิ่มหนังสือ (ต้องเป็น ADMIN) |
| `PUT` | `/api/comics/:id` | แก้ไขหนังสือ (ต้องเป็น ADMIN) |
| `DELETE` | `/api/comics/:id` | ลบหนังสือ (ต้องเป็น ADMIN) |
| `POST` | `/api/auth/register` | สมัครสมาชิก |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ |
| `GET` | `/api/users/:id/state` | อ่านสถานะผู้ใช้ |
| `POST` / `DELETE` | `/api/users/:id/collection[/:comicId]` | เพิ่ม/นำหนังสือออกจากคอลเลกชัน |
| `POST` | `/api/users/:id/topup` | เติมแต้ม |
| `POST` | `/api/users/:id/unlock` | ใช้แต้มปลดล็อกหนังสือ |

## ผลทดสอบ Production

ทดสอบกับ `https://readspacepro.vercel.app`:

| การทดสอบ | ผล |
|---|---|
| `GET /api/health` | ผ่าน — HTTP 200, `{"ok":true}` |
| `GET /api/comics` | ผ่าน — HTTP 200, อ่านได้ 32 รายการจากฐานข้อมูล |
| `GET /api/comics/1001` | ผ่าน — HTTP 200, ได้รายละเอียดหนังสือ |
| `GET /api/users/1/state` | ผ่าน — HTTP 200, ได้สถานะผู้ใช้และบทบาท ADMIN |
| `POST /api/auth/login` บัญชีสาธิต | ผ่าน — HTTP 200 |
| โหลดรูปปกจาก `/api/uploads/covers/...` | ผ่าน — HTTP 200 |

ผล `GET /api/comics` และการล็อกอินเป็นหลักฐานว่ามีการอ่านฐานข้อมูลจริง ส่วน `/api/health` เพียงอย่างเดียวไม่ยืนยันการเชื่อมต่อฐานข้อมูล

การทดสอบ Production รอบนี้ไม่ได้สร้าง/แก้ไข/ลบข้อมูลจริง เพื่อไม่ให้เปลี่ยนข้อมูลบนเว็บที่ใช้งานอยู่; ตรวจความครบของ CRUD จากเส้นทางใน Backend และการเชื่อม mutation ในหน้า `/admin/comics` ส่วนรายงานการทดสอบก่อนหน้านี้บันทึกผล CRUD และการตรวจสิทธิ์ไว้แล้ว

## ตรวจโค้ดและ Build

| คำสั่ง/การตรวจ | ผล |
|---|---|
| `npm run lint` | ผ่าน |
| `npx tsc -b` | ผ่าน |
| `npx vite build` | ผ่าน |
| Type-check API Functions และ Express app | ผ่าน |
| `npm run build` แบบเต็ม | ติดขัดที่ `prisma generate`: Windows แจ้ง `EPERM` ขณะแทนที่ `query_engine-windows.dll.node`; จึงไม่ถือว่าคำสั่ง build แบบเต็มผ่านในรอบนี้ |
| Automated test script | ไม่มีสคริปต์ `test` ใน `package.json` |

## Supabase: สถานะ Active และการพักอัตโนมัติ

- จากการทดสอบ Production ด้านบน ฐานข้อมูลตอบสนองและมีข้อมูล 32 รายการ **ณ เวลาตรวจ** จึงใช้งานได้ในขณะนี้
- ยังไม่ได้เข้าถึง Supabase Dashboard จึงตรวจสถานะแผนและปุ่มสถานะของโปรเจกต์โดยตรงไม่ได้
- เอกสาร Supabase ระบุว่าโปรเจกต์ Free ที่มีกิจกรรมน้อยในช่วง 7 วัน **อาจถูกพัก (pause)** เพื่อประหยัดทรัพยากร และสามารถกู้คืน/Resume จาก Supabase Dashboard ได้; Pro ป้องกันการพักเนื่องจากไม่มีความเคลื่อนไหวตามที่เอกสารระบุ
- ถ้าถูกพัก ให้เข้า Supabase Dashboard แล้ว Resume/Restore โปรเจกต์ จากนั้นทดสอบ `/api/comics` และล็อกอินอีกครั้งก่อนผู้ตรวจให้คะแนน การ Resume ไม่ต้องแก้โค้ด แต่ไม่สามารถรับประกันได้ว่า Free Plan จะ Active ตลอดช่วงที่ไม่มีการใช้งาน
- อ้างอิง: [Supabase Production Checklist — Availability](https://supabase.com/docs/guides/deployment/going-into-prod#free-plan)

## ข้อจำกัดและสิ่งที่ควรระวัง

1. บัญชีสาธิต `demo@example.com` / `1234` เป็น ADMIN ที่ทราบข้อมูลเข้าสู่ระบบได้ทั่วไป; ใช้เพื่อสาธิตงานเท่านั้น
2. รหัสผ่านเก็บแบบข้อความธรรมดา และการยืนยันแอดมินใช้ Basic Authorization ตามขอบเขตต้นแบบ ไม่เหมาะกับข้อมูลจริงหรือเว็บสาธารณะ
3. API คอลเลกชัน/สถานะผู้ใช้อ้างอิง `userId` จาก URL และไม่มี session/token สำหรับผูกตัวตนใน Backend จึงยังไม่ใช่การแยกข้อมูลผู้ใช้ที่ปลอดภัยสำหรับระบบจริง
4. ก่อนอัปเดตรายงานนี้ `.env` ถูก track ใน Git; รอบนี้นำออกจาก Git index แล้วและเก็บไฟล์ไว้ในเครื่อง โดยไม่แสดงค่าภายใน หากเคย push repository นี้ขึ้น GitHub หรือแหล่งสาธารณะ การนำไฟล์ออกตอนนี้ไม่ลบข้อมูลจาก Git history: ให้เปลี่ยนรหัสผ่านฐานข้อมูล Supabase และอัปเดต `DATABASE_URL`/`DIRECT_URL` ใน Vercel; อย่า commit `.env`

## ข้อสรุป

โดยรวมโปรเจกต์ตรงกับข้อกำหนดหลักและทดสอบ Production ได้ว่ารายการ/รายละเอียดหนังสือ รูปปก และล็อกอินเชื่อมกับฐานข้อมูลได้ อย่างไรก็ตาม Supabase Free อาจพักเมื่อกิจกรรมน้อย จึงควรตรวจและ Resume ก่อนวันตรวจคะแนน และควรพิจารณาคำเตือนเรื่อง `.env` กับบัญชีสาธิตก่อนเผยแพร่ repository
