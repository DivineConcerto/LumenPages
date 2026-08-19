import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { TOKEN_KEY } from './auth';

const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

function RequireAuth({ children }) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="empty-state glass-panel">
        <h2>页面走丢了</h2>
        <p>链接可能写错了，也可能这页已经被作者悄悄收起来了。</p>
        <a href="/" className="primary-button">返回首页</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">正在加载...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/release/:slug" element={<ArticlePage />} />
        <Route path="/writing/:slug" element={<ArticlePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={(
            <RequireAuth>
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
