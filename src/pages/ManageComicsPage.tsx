import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComic,
  deleteComic,
  fetchComics,
  login,
  updateComic,
  type AdminCredentials,
  type ComicInput,
} from '../api/comicsApi';
import type { ComicBook } from '../types/comic';

const emptyForm = {
  id: '',
  title: '',
  author: '',
  language: 'TH',
  downloadCount: '0',
  pointCost: '1000',
  coverUrl: '/uploads/covers/',
  subject: 'Manga',
  synopsis: '',
};

export const ManageComicsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const comicsQuery = useQuery({
    queryKey: ['comics'],
    queryFn: fetchComics,
  });

  const saveComic = useMutation({
    mutationFn: async ({
      input,
      credentials,
      comicId,
    }: {
      input: ComicInput;
      credentials: AdminCredentials;
      comicId: number | null;
    }) =>
      comicId ? updateComic(comicId, {
        title: input.title,
        author: input.author,
        language: input.language,
        downloadCount: input.downloadCount,
        pointCost: input.pointCost,
        coverUrl: input.coverUrl,
        subject: input.subject,
        synopsis: input.synopsis,
      }, credentials) : createComic(input, credentials),
    onSuccess: async (_comic, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['comics'] });
      setEditingId(null);
      setForm(emptyForm);
      setMessage(variables.comicId ? 'แก้ไขข้อมูลหนังสือเรียบร้อยแล้ว' : 'เพิ่มหนังสือเรียบร้อยแล้ว');
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'บันทึกข้อมูลไม่สำเร็จ'),
  });

  const removeComic = useMutation({
    mutationFn: ({ id, credentials }: { id: number; credentials: AdminCredentials }) =>
      deleteComic(id, credentials),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comics'] });
      setMessage('ลบหนังสือเรียบร้อยแล้ว');
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'ลบหนังสือไม่สำเร็จ'),
  });

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const beginCreate = () => {
    const nextId = comicsQuery.data?.reduce(
      (highest, comic) => Math.max(highest, comic.id),
      1000,
    ) ?? 1000;
    setEditingId(null);
    setForm({ ...emptyForm, id: String(nextId + 1) });
  };

  const verifyAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCheckingAdmin(true);
    setMessage('');
    try {
      const user = await login(adminEmail, adminPassword);
      if (user.role !== 'ADMIN') {
        setMessage('บัญชีนี้ไม่มีสิทธิ์แอดมิน');
        return;
      }
      setAdminCredentials({ email: adminEmail, password: adminPassword });
      setAdminPassword('');
      setMessage('เข้าสู่ระบบแอดมินแล้ว');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'เข้าสู่ระบบแอดมินไม่สำเร็จ');
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const beginEdit = (comic: ComicBook) => {
    setEditingId(comic.id);
    setForm({
      id: String(comic.id),
      title: comic.title,
      author: comic.authors.map((author) => author.name).join(', '),
      language: comic.languages.join(','),
      downloadCount: String(comic.download_count),
      pointCost: String(comic.pointCost),
      coverUrl: comic.formats['image/jpeg'] || '/uploads/covers/',
      subject: comic.subjects.join(','),
      synopsis: comic.synopsis || '',
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = Number(form.id);
    if (!Number.isInteger(id) || id <= 0) {
      setMessage('กรุณากรอกรหัสหนังสือเป็นตัวเลข');
      return;
    }
    if (!adminCredentials) {
      setMessage('กรุณาเข้าสู่ระบบแอดมินก่อน');
      return;
    }
    saveComic.mutate({
      comicId: editingId,
      credentials: adminCredentials,
      input: {
        id,
        title: form.title.trim(),
        author: form.author.trim(),
        language: form.language.trim(),
        downloadCount: Number(form.downloadCount),
        pointCost: Number(form.pointCost),
        coverUrl: form.coverUrl.trim(),
        subject: form.subject.trim(),
        synopsis: form.synopsis.trim(),
      },
    });
  };

  const confirmDelete = (comic: ComicBook) => {
    if (!adminCredentials) {
      setMessage('กรุณาเข้าสู่ระบบแอดมินก่อน');
      return;
    }
    if (window.confirm(`ต้องการลบ "${comic.title}" หรือไม่?`)) {
      removeComic.mutate({ id: comic.id, credentials: adminCredentials });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการหนังสือ</h1>
          <p className="text-sm text-slate-500 mt-1">เพิ่ม แก้ไข และลบข้อมูลหนังสือใน Supabase</p>
        </div>
        <button
          type="button"
          onClick={beginCreate}
          className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
        >
          + เพิ่มหนังสือ
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-sm">
          {message}
        </div>
      )}

      {!adminCredentials ? (
        <form onSubmit={verifyAdmin} className="max-w-md bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">เข้าสู่ระบบแอดมิน</h2>
            <p className="text-xs text-slate-500 mt-1">ต้องใช้บัญชีที่มีบทบาท ADMIN เพื่อแก้ไขข้อมูลหนังสือ</p>
          </div>
          <input
            type="email"
            autoComplete="username"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
            placeholder="อีเมล"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="รหัสผ่าน"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            disabled={isCheckingAdmin}
            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white py-2.5 rounded-lg text-sm font-bold"
          >
            {isCheckingAdmin ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      ) : (
      <>
      <div className="flex items-center justify-between max-w-6xl">
        <p className="text-sm text-emerald-800">เข้าสู่ระบบเป็น {adminCredentials.email}</p>
        <button
          type="button"
          onClick={() => {
            setAdminCredentials(null);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          ออกจากระบบแอดมิน
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 bg-white p-5 border border-slate-200 rounded-xl space-y-3 h-fit">
          <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
            {editingId ? `แก้ไขรหัส #${editingId}` : 'ข้อมูลหนังสือ'}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสหนังสือ</label>
            <input
              type="number"
              value={form.id}
              onChange={(event) => setForm({ ...form, id: event.target.value })}
              disabled={editingId !== null}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100"
            />
          </div>

          {[
            ['title', 'ชื่อเรื่อง'],
            ['author', 'ผู้แต่ง'],
            ['language', 'ภาษา เช่น TH, JP'],
            ['coverUrl', 'URL รูปปก'],
            ['subject', 'หมวดหมู่'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input
                value={form[field as keyof typeof form]}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ราคาแต้ม</label>
              <input
                type="number"
                min="0"
                value={form.pointCost}
                onChange={(event) => setForm({ ...form, pointCost: event.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ยอดดาวน์โหลด</label>
              <input
                type="number"
                min="0"
                value={form.downloadCount}
                onChange={(event) => setForm({ ...form, downloadCount: event.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">เรื่องย่อ</label>
            <textarea
              value={form.synopsis}
              onChange={(event) => setForm({ ...form, synopsis: event.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saveComic.isPending}
              className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white py-2.5 rounded-lg text-sm font-bold"
            >
              {saveComic.isPending ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={beginCreate}
                className="px-4 border border-slate-300 rounded-lg text-sm text-slate-700"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {comicsQuery.isLoading && <p className="p-6 text-sm text-slate-500">กำลังโหลดข้อมูล...</p>}
          {comicsQuery.isError && <p className="p-6 text-sm text-rose-600">ไม่สามารถโหลดข้อมูลหนังสือได้</p>}

          {!comicsQuery.isLoading && !comicsQuery.isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">รูป</th>
                    <th className="px-4 py-3 text-left">รหัส / ชื่อเรื่อง</th>
                    <th className="px-4 py-3 text-left">ราคา</th>
                    <th className="px-4 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {comicsQuery.data?.map((comic) => (
                    <tr key={comic.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <img
                          src={comic.formats['image/jpeg'] || '/favicon.svg'}
                          alt={comic.title}
                          className="w-12 h-16 object-cover rounded border border-slate-200"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{comic.title}</div>
                        <div className="text-xs text-slate-400">#{comic.id}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-900">{comic.pointCost} แต้ม</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => beginEdit(comic)}
                            className="px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-800 rounded-lg"
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(comic)}
                            disabled={removeComic.isPending}
                            className="px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
