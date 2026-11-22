import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser, registerUser } = useUserStore();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await loginUser(email, password);
      else await registerUser(email, password);
      navigate('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-md">
      <form onSubmit={submit} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">ใช้อีเมลและรหัสผ่านเพื่อใช้งานคอลเลกชันส่วนตัว</p>
        </div>
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="อีเมล"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="รหัสผ่าน"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <button disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white py-3 rounded-xl text-sm font-bold">
          {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-sm text-blue-800"
        >
          {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
};
