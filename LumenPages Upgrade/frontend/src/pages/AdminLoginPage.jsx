import { useEffect, useState } from 'react';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { TOKEN_KEY } from '../auth';
import AmbientShell from '../components/AmbientShell';

export default function AdminLoginPage() {
  const [site, setSite] = useState(null);
  const [form, setForm] = useState({ username: 'admin', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSite().then(setSite).catch(() => {});
    document.title = '管理员登录';
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const data = await api.login(form);
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate('/admin');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AmbientShell site={site} minimal variant="atelier">
      <section className="admin-auth-section">
        <form className="admin-auth-card glass-panel" onSubmit={handleSubmit}>
          <div className="auth-icon">
            <LockKeyhole size={20} />
          </div>
          <span className="section-kicker">Administrator</span>
          <h1>登录后台</h1>
          <p>用于更新个人主页、游戏发布页，以及前台发布页序列里的内容。</p>

          <label>
            用户名
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="admin"
            />
          </label>

          <label>
            密码
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="请输入密码"
            />
          </label>

          {message && <div className="form-message error">{message}</div>}

          <button className="primary-button full-width" disabled={busy}>
            {busy ? '正在验证...' : '进入后台'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </AmbientShell>
  );
}
