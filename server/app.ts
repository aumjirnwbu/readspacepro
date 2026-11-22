import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient, type Comic } from '@prisma/client';
import path from 'node:path';

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 3001);
const apiPublicUrl = process.env.API_PUBLIC_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);

app.use(cors());
app.use(express.json());
const uploadsDirectory = path.resolve(process.cwd(), 'server', 'uploads');
app.use('/uploads', express.static(uploadsDirectory));
app.use('/api/uploads', express.static(uploadsDirectory));

const comicShape = (comic: Comic) => ({
  id: comic.id,
  title: comic.title,
  authors: [{ name: comic.author }],
  languages: comic.language.split(',').map((language: string) => language.trim()),
  download_count: comic.downloadCount,
  pointCost: comic.pointCost,
  formats: {
    'image/jpeg': comic.coverUrl.startsWith('/uploads/')
      ? `${apiPublicUrl}/api${comic.coverUrl}`
      : comic.coverUrl,
  },
  subjects: comic.subject.split(',').map((subject: string) => subject.trim()),
  synopsis: comic.synopsis,
});

const userState = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      collections: { select: { comicId: true } },
      unlocked: { select: { comicId: true } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    points: user.points,
    collection: user.collections.map((item) => item.comicId),
    unlockedBooks: user.unlocked.map((item) => item.comicId),
    transactions: user.transactions.map((tx) => ({
      id: String(tx.id),
      type: tx.type,
      title: tx.title,
      amount: tx.amount,
      date: tx.createdAt.toISOString(),
    })),
  };
};

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });

  const user = await prisma.user.create({
    data: {
      email,
      password,
      points: 1000,
      transactions: { create: { type: 'topup', title: 'แต้มเริ่มต้น', amount: 1000 } },
    },
  });
  return res.status(201).json(await userState(user.id));
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }
  return res.json(await userState(user.id));
});

app.get('/api/users/:id/state', async (req, res) => {
  const state = await userState(Number(req.params.id));
  if (!state) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
  return res.json(state);
});

app.get('/api/comics', async (_req, res) => {
  const comics = await prisma.comic.findMany({ orderBy: { id: 'asc' } });
  res.json(comics.map(comicShape));
});

app.get('/api/comics/:id', async (req, res) => {
  const comic = await prisma.comic.findUnique({ where: { id: Number(req.params.id) } });
  if (!comic) return res.status(404).json({ message: 'ไม่พบหนังสือการ์ตูน' });
  res.json(comicShape(comic));
});

const requireAdmin: express.RequestHandler = async (req, res, next) => {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Basic ')) {
    res.status(401).json({ message: 'กรุณาเข้าสู่ระบบแอดมิน' });
    return;
  }

  const decoded = Buffer.from(authorization.slice('Basic '.length), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator < 1) {
    res.status(401).json({ message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง' });
    return;
  }

  const email = decoded.slice(0, separator).trim().toLowerCase();
  const password = decoded.slice(separator + 1);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN' || user.password !== password) {
    res.status(403).json({ message: 'ต้องใช้บัญชีแอดมินเพื่อจัดการหนังสือ' });
    return;
  }

  next();
};

app.post('/api/comics', requireAdmin, async (req, res) => {
  try {
    const comic = await prisma.comic.create({
      data: {
        id: Number(req.body.id),
        title: req.body.title,
        author: req.body.author || 'ไม่ระบุผู้แต่ง',
        language: req.body.language || 'TH',
        downloadCount: Number(req.body.downloadCount || 0),
        pointCost: Number(req.body.pointCost || 1000),
        coverUrl: req.body.coverUrl || '/favicon.svg',
        subject: req.body.subject || 'Manga',
        synopsis: req.body.synopsis || '',
      },
    });
    res.status(201).json(comicShape(comic));
  } catch {
    res.status(400).json({ message: 'ไม่สามารถเพิ่มหนังสือได้' });
  }
});

app.put('/api/comics/:id', requireAdmin, async (req, res) => {
  try {
    const comic = await prisma.comic.update({
      where: { id: Number(req.params.id) },
      data: {
        title: req.body.title,
        author: req.body.author,
        language: req.body.language,
        downloadCount: req.body.downloadCount === undefined ? undefined : Number(req.body.downloadCount),
        pointCost: req.body.pointCost === undefined ? undefined : Number(req.body.pointCost),
        coverUrl: req.body.coverUrl,
        subject: req.body.subject,
        synopsis: req.body.synopsis,
      },
    });
    res.json(comicShape(comic));
  } catch {
    res.status(404).json({ message: 'ไม่พบหนังสือการ์ตูน' });
  }
});

app.delete('/api/comics/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.comic.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'ไม่พบหนังสือการ์ตูน' });
  }
});

app.post('/api/users/:id/collection', async (req, res) => {
  const userId = Number(req.params.id);
  const comicId = Number(req.body.comicId);
  await prisma.collection.upsert({
    where: { userId_comicId: { userId, comicId } },
    update: {},
    create: { userId, comicId },
  });
  res.json(await userState(userId));
});

app.delete('/api/users/:id/collection/:comicId', async (req, res) => {
  const userId = Number(req.params.id);
  const comicId = Number(req.params.comicId);
  await prisma.collection.deleteMany({ where: { userId, comicId } });
  res.json(await userState(userId));
});

app.post('/api/users/:id/topup', async (req, res) => {
  const userId = Number(req.params.id);
  const amount = Number(req.body.amount || 0);
  if (amount <= 0) return res.status(400).json({ message: 'จำนวนแต้มไม่ถูกต้อง' });

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { points: { increment: amount } } }),
    prisma.transaction.create({
      data: { userId, type: 'topup', title: String(req.body.title || `เติมแต้ม ${amount}`), amount },
    }),
  ]);
  res.json(await userState(userId));
});

app.post('/api/users/:id/unlock', async (req, res) => {
  const userId = Number(req.params.id);
  const comicId = Number(req.body.comicId);
  const comic = await prisma.comic.findUnique({ where: { id: comicId } });
  if (!comic) return res.status(404).json({ message: 'ไม่พบหนังสือการ์ตูน' });

  const existing = await prisma.unlocked.findUnique({
    where: { userId_comicId: { userId, comicId } },
  });
  if (existing) return res.json(await userState(userId));

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.points < comic.pointCost) {
    return res.status(400).json({ message: 'แต้มสะสมไม่เพียงพอ' });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { points: { decrement: comic.pointCost } } }),
    prisma.unlocked.create({ data: { userId, comicId } }),
    prisma.transaction.create({
      data: {
        userId,
        type: 'purchase',
        title: `ปลดล็อกอ่านเรื่อง: ${comic.title}`,
        amount: -comic.pointCost,
      },
    }),
  ]);
  res.json(await userState(userId));
});

export default app;
