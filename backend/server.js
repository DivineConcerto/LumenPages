import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  getSiteSettings,
  updateSiteSettings,
  listPublishedPosts,
  getPublishedPostBySlug,
  listPublishedReleases,
  listAllReleases,
  createRelease,
  updateRelease,
  deleteRelease,
  listAllPosts,
  createPost,
  updatePost,
  deletePost,
  verifyAdmin,
  changePassword
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-change-this-jwt-secret');

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required when NODE_ENV=production.');
}

app.use(express.json({ limit: '2mb' }));

if (!isProduction) {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }));
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    jwtSecret,
    { expiresIn: '12h' }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: '未登录或登录已过期。' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: '登录凭证无效，请重新登录。' });
  }
}

function safeSitePayload(body) {
  return {
    site_name: String(body.site_name || '').trim(),
    site_tagline: String(body.site_tagline || '').trim(),
    site_description: String(body.site_description || '').trim(),
    hero_badge: String(body.hero_badge || '').trim(),
    hero_title: String(body.hero_title || '').trim(),
    hero_subtitle: String(body.hero_subtitle || '').trim(),
    about_title: String(body.about_title || '').trim(),
    about_body: String(body.about_body || '').trim(),
    game_badge: String(body.game_badge || '').trim(),
    game_title: String(body.game_title || '').trim(),
    game_subtitle: String(body.game_subtitle || '').trim(),
    game_body: String(body.game_body || '').trim(),
    game_cta_label: String(body.game_cta_label || '').trim(),
    footer_note: String(body.footer_note || '').trim(),
    email: String(body.email || '').trim(),
    location: String(body.location || '').trim(),
    x_url: String(body.x_url || '').trim(),
    github_url: String(body.github_url || '').trim(),
    linkedin_url: String(body.linkedin_url || '').trim(),
    nav_items: Array.isArray(body.nav_items) ? body.nav_items : []
  };
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/admin/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码。' });
  }

  const admin = verifyAdmin(username, password);
  if (!admin) {
    return res.status(401).json({ message: '用户名或密码不正确。' });
  }

  return res.json({
    token: signToken(admin),
    user: { username: admin.username }
  });
});

app.get('/api/site', (_, res) => {
  res.json(getSiteSettings());
});

app.get('/api/posts', (_, res) => {
  res.json(listPublishedPosts());
});

app.get('/api/releases', (_, res) => {
  res.json(listPublishedReleases());
});

app.get('/api/posts/:slug', (req, res) => {
  const post = getPublishedPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).json({ message: '文章不存在，或者还没有发布。' });
  }

  return res.json(post);
});

app.get('/api/admin/site', authenticate, (_, res) => {
  res.json(getSiteSettings());
});

app.put('/api/admin/site', authenticate, (req, res) => {
  const payload = safeSitePayload(req.body);
  const missing = [
    'site_name',
    'site_tagline',
    'site_description',
    'hero_badge',
    'hero_title',
    'hero_subtitle',
    'about_title',
    'about_body',
    'game_badge',
    'game_title',
    'game_subtitle',
    'game_body',
    'game_cta_label',
    'footer_note'
  ]
    .find((key) => !payload[key]);

  if (missing) {
    return res.status(400).json({ message: '请把站点信息填写完整。' });
  }

  return res.json(updateSiteSettings(payload));
});

app.get('/api/admin/posts', authenticate, (_, res) => {
  res.json(listAllPosts());
});

app.get('/api/admin/releases', authenticate, (_, res) => {
  res.json(listAllReleases());
});

app.post('/api/admin/releases', authenticate, (req, res) => {
  try {
    const release = createRelease(req.body);
    return res.status(201).json(release);
  } catch (error) {
    return res.status(400).json({ message: error.message || '创建发布项失败。' });
  }
});

app.put('/api/admin/releases/:id', authenticate, (req, res) => {
  try {
    const release = updateRelease(Number(req.params.id), req.body);
    return res.json(release);
  } catch (error) {
    return res.status(400).json({ message: error.message || '保存发布项失败。' });
  }
});

app.delete('/api/admin/releases/:id', authenticate, (req, res) => {
  const deleted = deleteRelease(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ message: '发布项不存在。' });
  }

  return res.status(204).send();
});

app.post('/api/admin/posts', authenticate, (req, res) => {
  try {
    const post = createPost(req.body);
    return res.status(201).json(post);
  } catch (error) {
    return res.status(400).json({ message: error.message || '创建文章失败。' });
  }
});

app.put('/api/admin/posts/:id', authenticate, (req, res) => {
  try {
    const post = updatePost(Number(req.params.id), req.body);
    return res.json(post);
  } catch (error) {
    return res.status(400).json({ message: error.message || '保存文章失败。' });
  }
});

app.delete('/api/admin/posts/:id', authenticate, (req, res) => {
  const deleted = deletePost(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ message: '文章不存在。' });
  }

  return res.status(204).send();
});

app.put('/api/admin/password', authenticate, (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');

  if (newPassword.length < 6) {
    return res.status(400).json({ message: '新密码至少需要 6 位。' });
  }

  try {
    changePassword(req.user.id, currentPassword, newPassword);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ message: error.message || '修改密码失败。' });
  }
});

const frontendDist = path.resolve(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Lumen Journal backend is running at http://localhost:${port}`);
});
