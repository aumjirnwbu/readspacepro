import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const titles = [
  ['เจ้าหญิงแห่งดวงดาว', 'คาโนะ อาโออิ', 'Fantasy'],
  ['กาลครั้งหนึ่งในโตเกียว', 'ทานากะ ฮารุ', 'Drama'],
  ['นักดาบพันธสัญญา', 'ซากุรา อิโต', 'Action'],
  ['โรงเรียนแห่งเวทมนตร์', 'มิยาวากิ เรน', 'Fantasy'],
  ['หัวใจสีฟ้า', 'อิโต ยูริ', 'Romance'],
  ['นักสืบยามค่ำคืน', 'ทาคาฮาชิ เคน', 'Mystery'],
  ['อาณาจักรแมว', 'ฮิโนะ มิยู', 'Comedy'],
  ['เส้นทางฮีโร่', 'อาคิซาวา โซ', 'Action'],
  ['บันทึกเรือเมฆา', 'นาคามูระ ไอ', 'Adventure'],
  ['สวนดอกไม้ฤดูหนาว', 'ฟูจิซากิ มาโอะ', 'Romance'],
  ['เกมพิชิตมิติ', 'โคบายาชิ เรย์', 'Sci-Fi'],
  ['แสงจันทร์ในโรงเรียน', 'ยามาดะ ฮานะ', 'Slice of Life'],
  ['ตำนานเมืองเวหา', 'ซาโต ชุน', 'Fantasy'],
  ['มิตรภาพกับหุ่นยนต์', 'โอกาว่า นาโอ', 'Sci-Fi'],
  ['ล่าขุมทรัพย์ใต้ทะเล', 'โมริ ยูกิ', 'Adventure'],
  ['ลูกแก้วแห่งโชคชะตา', 'ฮาชิโมโต ริน', 'Fantasy'],
  ['ศึกกุหลาบดำ', 'คาวาอิ เอริ', 'Action'],
  ['ร้านหนังสือข้ามเวลา', 'นิชิมูระ โทโกะ', 'Mystery'],
  ['รักในโลกไซเบอร์', 'อินุอิ มิระ', 'Romance'],
  ['ครัวซองวันวาน', 'โอซาว่า คาโอรุ', 'Slice of Life'],
  ['นักแข่งสายฟ้า', 'อิชิกาวา จุน', 'Sports'],
  ['ปราสาทลอยฟ้า', 'ทัตสุมิ อายะ', 'Adventure'],
  ['นักเวทน้อยกับแมวพูดได้', 'ฟูคูดะ นัตสึ', 'Fantasy'],
  ['รหัสลับเมืองเก่า', 'ทานิ เอจิ', 'Mystery'],
  ['แดนซ์จนฟ้าสั่น', 'นางาเซ ฮิมาริ', 'Drama'],
  ['ปีศาจใต้ม่านน้ำ', 'อุเอะดะ โทโมยะ', 'Horror'],
  ['มหาวิทยาลัยซูเปอร์สตาร์', 'มัตสึโมโตะ ริน', 'Comedy'],
  ['แขนกลผู้ออกเดินทาง', 'คุราตะ เซ็น', 'Sci-Fi'],
  ['อักษรคำนั้นคือคำสาป', 'ชิมาดะ คาเอเดะ', 'Mystery'],
  ['สายน้ำแห่งพระจันทร์', 'คานาโกะ โยโก', 'Romance'],
  ['ตำนานนักรบเงา', 'ยามาโมโตะ ไดกิ', 'Action'],
  ['โลกหลังเลิกเรียน', 'ซาวาดะ อากิ', 'Drama'],
];

async function main() {
  for (let i = 0; i < titles.length; i++) {
    const [title, author, subject] = titles[i];
    const data = {
        id: 1000 + i + 1,
        title,
        author,
        language: 'TH',
        downloadCount: 1200 + i * 317,
        pointCost: 899 + ((1000 + i + 1) * 37) % 1701,
        coverUrl: `/uploads/covers/${encodeURIComponent(title)}.png`,
        subject,
        synopsis: `${title} เป็นเรื่องราวต้นฉบับที่จัดทำขึ้นสำหรับโปรเจกต์ Mini Project2 บอกเล่าการเดินทาง ตัวละคร และเหตุการณ์ในโลกของ ${subject} พร้อมภารกิจและมิตรภาพที่ผู้ชมต้องติดตาม`,
    };
    await prisma.comic.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'demo@example.com',
      password: '1234',
      role: 'ADMIN',
      points: 1000,
      transactions: {
        create: { type: 'topup', title: 'แต้มเริ่มต้น', amount: 1000 },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
