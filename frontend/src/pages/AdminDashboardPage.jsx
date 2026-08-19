import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Eye,
  FilePenLine,
  LayoutTemplate,
  Link2,
  LogOut,
  Plus,
  Rocket,
  Save,
  Settings2,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { TOKEN_KEY } from '../auth';
import AmbientShell from '../components/AmbientShell';
import LoadingState from '../components/LoadingState';
import RichTextEditor, { markdownishToEditorHtml } from '../components/RichTextEditor';
import { RELEASE_TEMPLATES, normalizeReleaseTemplateId } from '../releaseTemplates';

const defaultNavItems = Array.from({ length: 10 }, (_, index) => ({
  label: `测试${index + 1}`,
  href: index === 0 ? '#intro' : index === 1 ? '#latest' : '#'
}));

const emptyRelease = {
  eyebrow: 'Release',
  title: '',
  introduction: '',
  target_url: '',
  cta_label: '打开',
  visual_style: 'orbit',
  published: true
};

const emptyPost = {
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  content_html: '<p><br></p>',
  tags: '',
  cover_image: '',
  published: false,
  featured: false,
  syncRelease: true
};

const tabs = [
  { id: 'releases', label: '发布项管理', icon: LayoutTemplate },
  { id: 'write', label: '写文章', icon: FilePenLine },
  { id: 'articles', label: '文章管理', icon: BookOpen }
];

const visualOptions = RELEASE_TEMPLATES.map(({ value, label }) => ({ value, label }));

const MINIATURE_PARTS = {
  orbit: ['layer-a', 'layer-b', 'layer-c'],
  ribbon: ['layer-a', 'layer-b', 'layer-c'],
  stack: ['layer-a', 'layer-b', 'layer-c'],
  console: ['layer-a', 'line-a', 'line-b', 'dot-a', 'dot-b'],
  frontier: ['layer-a', 'layer-b', 'layer-c', 'line-a', 'dot-a'],
  agent: ['line-a', 'layer-a', 'layer-b', 'layer-c', 'dot-a'],
  launch: ['layer-a', 'layer-b', 'layer-c', 'line-a'],
  command: ['layer-a', 'line-a', 'line-b', 'dot-a', 'dot-b'],
  pulse: ['layer-a', 'layer-b', 'line-a', 'dot-a', 'dot-b'],
  canvas: ['layer-a', 'layer-b', 'layer-c', 'dot-a'],
  vault: ['layer-a', 'layer-b', 'line-a', 'line-b']
};

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/^\/?(release|writing)\//, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function postUrl(slug = '') {
  return `/release/${slug || 'your-url'}`;
}

function normalizeNavItems(items) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      label: String(item?.label || '').trim(),
      href: String(item?.href || '#').trim() || '#'
    }))
    .filter((item) => item.label)
    .slice(0, 12);

  return normalized.length ? normalized : defaultNavItems;
}

function postToForm(post) {
  if (!post) return emptyPost;
  return {
    id: post.id,
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    content_html: post.content_html || markdownishToEditorHtml(post.content),
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    cover_image: post.cover_image || '',
    published: Boolean(post.published),
    featured: Boolean(post.featured),
    syncRelease: false
  };
}

function postPayload(form, publishedOverride = null) {
  const slug = slugify(form.slug || form.title);
  return {
    title: form.title,
    slug,
    excerpt: form.excerpt,
    content: form.content,
    content_html: form.content_html,
    tags: form.tags,
    cover_image: form.cover_image,
    featured: Boolean(form.featured),
    published: publishedOverride ?? Boolean(form.published)
  };
}

function Field({ label, children, wide = false }) {
  return (
    <label className={`admin-field ${wide ? 'admin-field-wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function releasePayload(form) {
  return {
    eyebrow: String(form.eyebrow || '').trim() || 'Release',
    title: String(form.title || '').trim(),
    introduction: String(form.introduction || '').trim(),
    target_url: String(form.target_url || '').trim(),
    cta_label: String(form.cta_label || '').trim() || '打开',
    visual_style: normalizeReleaseTemplateId(form.visual_style || 'orbit'),
    published: Boolean(form.published)
  };
}

function TemplateMiniature({ template, large = false }) {
  const parts = MINIATURE_PARTS[template.value] || MINIATURE_PARTS.orbit;

  return (
    <div
      className={`template-miniature miniature-${template.value} ${template.mood === 'night' ? 'miniature-dark' : 'miniature-light'} ${large ? 'miniature-large' : ''}`}
      style={{
        '--template-accent': template.accent,
        '--template-accent-2': template.accent2,
        '--template-bg': template.bg,
        '--template-ink': template.ink
      }}
      aria-hidden="true"
    >
      {parts.map((part) => {
        const type = part.split('-')[0];
        return <i key={part} className={`mini-${type} ${part}`} />;
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const [activeTab, setActiveTab] = useState('releases');
  const [site, setSite] = useState(null);
  const [siteForm, setSiteForm] = useState(null);
  const [releases, setReleases] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState('new');
  const [releaseForm, setReleaseForm] = useState(emptyRelease);
  const [writerForm, setWriterForm] = useState(emptyPost);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [manageForm, setManageForm] = useState(emptyPost);
  const [busy, setBusy] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [savingRelease, setSavingRelease] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    Promise.all([api.getAdminSite(token), api.getAdminReleases(token), api.getAdminPosts(token)])
      .then(([siteData, releaseData, postData]) => {
        const nextSite = {
          ...siteData,
          nav_items: normalizeNavItems(siteData.nav_items)
        };
        setSite(nextSite);
        setSiteForm(nextSite);
        setReleases(releaseData);
        setPosts(postData);
        setSelectedPostId(postData[0]?.id ?? null);
        document.title = `后台 · ${siteData.site_name}`;
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        navigate('/admin/login');
      })
      .finally(() => setBusy(false));
  }, [navigate, token]);

  useEffect(() => {
    if (selectedReleaseId === 'new') {
      setReleaseForm(emptyRelease);
      return;
    }

    const selected = releases.find((release) => String(release.id) === String(selectedReleaseId));
    if (selected) setReleaseForm({ ...selected, visual_style: normalizeReleaseTemplateId(selected.visual_style) });
  }, [releases, selectedReleaseId]);

  useEffect(() => {
    const selected = posts.find((post) => post.id === selectedPostId);
    setManageForm(postToForm(selected));
  }, [posts, selectedPostId]);

  const sortedReleases = useMemo(
    () => [...releases].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [releases]
  );

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [posts]
  );

  if (busy || !siteForm) {
    return (
      <AmbientShell site={site} minimal variant="atelier">
        <LoadingState label="正在加载管理台..." />
      </AmbientShell>
    );
  }

  function flash(nextMessage) {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 3200);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate('/admin/login');
  }

  function updateSiteField(field, value) {
    setSiteForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateNavItem(index, field, value) {
    setSiteForm((prev) => ({
      ...prev,
      nav_items: prev.nav_items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  }

  function addNavItem() {
    setSiteForm((prev) => ({
      ...prev,
      nav_items: [...prev.nav_items, { label: `测试${prev.nav_items.length + 1}`, href: '#' }].slice(0, 12)
    }));
  }

  function removeNavItem(index) {
    setSiteForm((prev) => ({
      ...prev,
      nav_items: prev.nav_items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function saveSiteSettings() {
    if (savingSite) return;
    setSavingSite(true);
    try {
      const saved = await api.saveSite(siteForm, token);
      const nextSite = { ...saved, nav_items: normalizeNavItems(saved.nav_items) };
      setSite(nextSite);
      setSiteForm(nextSite);
      flash('首页内容和导航已保存。');
    } catch (error) {
      flash(error.message);
    } finally {
      setSavingSite(false);
    }
  }

  async function saveRelease() {
    if (savingRelease) return;
    setSavingRelease(true);
    const payload = releasePayload(releaseForm);
    const isNew = selectedReleaseId === 'new';

    try {
      const saved = isNew
        ? await api.createRelease(payload, token)
        : await api.updateRelease(selectedReleaseId, payload, token);
      const freshReleases = await api.getAdminReleases(token);

      setReleases(freshReleases);
      setSelectedReleaseId(saved.id);
      setReleaseForm({ ...saved, visual_style: normalizeReleaseTemplateId(saved.visual_style) });
      flash(isNew ? '发布项已创建，前台已可读取。' : '发布项已保存，前台已可读取。');
    } catch (error) {
      flash(error.message);
    } finally {
      setSavingRelease(false);
    }
  }

  async function removeRelease() {
    if (selectedReleaseId === 'new') return;
    if (!window.confirm('确定要删除这个发布项吗？')) return;

    try {
      await api.deleteRelease(selectedReleaseId, token);
      setReleases((prev) => prev.filter((release) => release.id !== selectedReleaseId));
      setSelectedReleaseId('new');
      flash('发布项已删除。');
    } catch (error) {
      flash(error.message);
    }
  }

  async function syncReleaseForPost(post) {
    const targetUrl = postUrl(post.slug);
    const existing = releases.find((release) => release.target_url === targetUrl);
    const payload = {
      eyebrow: '最新发布',
      title: post.title,
      introduction: post.excerpt,
      target_url: targetUrl,
      cta_label: '阅读全文',
      visual_style: 'stack',
      published: true
    };

    const saved = existing
      ? await api.updateRelease(existing.id, payload, token)
      : await api.createRelease(payload, token);

    setReleases((prev) => (
      existing
        ? prev.map((release) => (release.id === saved.id ? saved : release))
        : [saved, ...prev]
    ));
  }

  async function saveWriterPost(publishNow = false) {
    try {
      const saved = await api.createPost(postPayload(writerForm, publishNow), token);
      setPosts((prev) => [saved, ...prev]);
      setSelectedPostId(saved.id);
      if (publishNow && writerForm.syncRelease) await syncReleaseForPost(saved);
      setWriterForm(emptyPost);
      setActiveTab('articles');
      flash(publishNow ? '文章已发布，并生成发布项。' : '草稿已保存。');
    } catch (error) {
      flash(error.message);
    }
  }

  async function saveManagedPost(publishOverride = null) {
    if (!manageForm.id) return;
    try {
      const saved = await api.updatePost(manageForm.id, postPayload(manageForm, publishOverride), token);
      setPosts((prev) => prev.map((post) => (post.id === saved.id ? saved : post)));
      if ((publishOverride ?? manageForm.published) && manageForm.syncRelease) await syncReleaseForPost(saved);
      flash('文章已保存。');
    } catch (error) {
      flash(error.message);
    }
  }

  async function removePost() {
    if (!manageForm.id) return;
    if (!window.confirm('确定要删除这篇文章吗？')) return;

    try {
      await api.deletePost(manageForm.id, token);
      setPosts((prev) => prev.filter((post) => post.id !== manageForm.id));
      setSelectedPostId(null);
      flash('文章已删除。');
    } catch (error) {
      flash(error.message);
    }
  }

  const activeReleaseTemplate = RELEASE_TEMPLATES.find((template) => template.value === normalizeReleaseTemplateId(releaseForm.visual_style)) || RELEASE_TEMPLATES[0];

  return (
    <AmbientShell site={site} minimal variant="atelier">
      <section className="admin-workspace">
        <aside className="admin-rail">
          <div className="admin-rail-brand">
            <span>后台</span>
            <strong>{site?.site_name}</strong>
          </div>

          <nav className="admin-rail-nav">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={activeTab === id ? 'active' : ''}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <button className="admin-logout" type="button" onClick={logout}>
            <LogOut size={17} />
            退出
          </button>
        </aside>

        <div className="admin-view">
          <header className="admin-view-head">
            <div>
              <span>Control room</span>
              <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            </div>
            {message && <div className="admin-toast">{message}</div>}
          </header>

          {activeTab === 'releases' && (
            <div className="admin-stack">
              <section className="admin-surface">
                <div className="admin-section-title">
                  <Settings2 size={18} />
                  <div>
                    <h2>首页与导航</h2>
                    <p>主页面文字、顶部导航和首页介绍都在这里维护。</p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <Field label="站点名称">
                    <input value={siteForm.site_name} onChange={(event) => updateSiteField('site_name', event.target.value)} />
                  </Field>
                  <Field label="副标题">
                    <input value={siteForm.site_tagline} onChange={(event) => updateSiteField('site_tagline', event.target.value)} />
                  </Field>
                  <Field label="首页小标签">
                    <input value={siteForm.hero_badge} onChange={(event) => updateSiteField('hero_badge', event.target.value)} />
                  </Field>
                  <Field label="首页主标题">
                    <input value={siteForm.hero_title} onChange={(event) => updateSiteField('hero_title', event.target.value)} />
                  </Field>
                  <Field label="首页简介" wide>
                    <textarea rows="4" value={siteForm.hero_subtitle} onChange={(event) => updateSiteField('hero_subtitle', event.target.value)} />
                  </Field>
                  <Field label="Footer 文案" wide>
                    <textarea rows="2" value={siteForm.footer_note} onChange={(event) => updateSiteField('footer_note', event.target.value)} />
                  </Field>
                </div>

                <div className="nav-editor">
                  <div className="nav-editor-head">
                    <h3>顶部导航</h3>
                    <button type="button" onClick={addNavItem}>
                      <Plus size={15} />
                      添加
                    </button>
                  </div>
                  {siteForm.nav_items.map((item, index) => (
                    <div className="nav-row" key={`${item.label}-${index}`}>
                      <input value={item.label} onChange={(event) => updateNavItem(index, 'label', event.target.value)} />
                      <input value={item.href} onChange={(event) => updateNavItem(index, 'href', event.target.value)} />
                      <button type="button" onClick={() => removeNavItem(index)}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>

                <button className="admin-primary" type="button" onClick={saveSiteSettings} disabled={savingSite}>
                  <Save size={16} />
                  {savingSite ? '保存中...' : '保存首页与导航'}
                </button>
              </section>

              <section className="admin-surface">
                <div className="release-manager-grid">
                  <div className="admin-list-panel">
                    <div className="admin-section-title compact">
                      <Rocket size={18} />
                      <div>
                        <h2>发布项</h2>
                        <p>首页每一个产品屏都来自这里。</p>
                      </div>
                    </div>
                    <button className="admin-secondary full" type="button" onClick={() => setSelectedReleaseId('new')}>
                      <Plus size={16} />
                      新建发布项
                    </button>

                    <div className="admin-list">
                      {sortedReleases.map((release) => (
                        <button
                          key={release.id}
                          type="button"
                          className={selectedReleaseId === release.id ? 'active' : ''}
                          onClick={() => setSelectedReleaseId(release.id)}
                        >
                          <strong>{release.title}</strong>
                          <span>{release.published ? '展示中' : '草稿'} · {release.visual_style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="release-editor-panel">
                    <div className="admin-form-grid">
                      <Field label="小标签">
                        <input value={releaseForm.eyebrow || ''} onChange={(event) => setReleaseForm((prev) => ({ ...prev, eyebrow: event.target.value }))} />
                      </Field>
                      <Field label="标题">
                        <input value={releaseForm.title || ''} onChange={(event) => setReleaseForm((prev) => ({ ...prev, title: event.target.value }))} />
                      </Field>
                      <Field label="介绍" wide>
                        <textarea rows="5" value={releaseForm.introduction || ''} onChange={(event) => setReleaseForm((prev) => ({ ...prev, introduction: event.target.value }))} />
                      </Field>
                      <Field label="跳转 URL">
                        <input value={releaseForm.target_url || ''} onChange={(event) => setReleaseForm((prev) => ({ ...prev, target_url: event.target.value }))} />
                      </Field>
                      <Field label="按钮文案">
                        <input value={releaseForm.cta_label || ''} onChange={(event) => setReleaseForm((prev) => ({ ...prev, cta_label: event.target.value }))} />
                      </Field>
                      <Field label="视觉样式 · 原版 4 + 新 7">
                        <select value={releaseForm.visual_style || 'orbit'} onChange={(event) => setReleaseForm((prev) => ({ ...prev, visual_style: event.target.value }))}>
                          {visualOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                      <div className="template-choice-grid">
                        {RELEASE_TEMPLATES.map((template) => (
                          <button
                            key={template.value}
                            type="button"
                            className={normalizeReleaseTemplateId(releaseForm.visual_style) === template.value ? 'active' : ''}
                            style={{ '--template-accent': template.accent, '--template-accent-2': template.accent2 }}
                            onClick={() => setReleaseForm((prev) => ({ ...prev, visual_style: template.value }))}
                          >
                            <TemplateMiniature template={template} />
                            <span>{template.label.split('·')[0].trim()}</span>
                            <strong>{template.label.split('·').slice(1).join('·').trim()}</strong>
                          </button>
                        ))}
                      </div>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Boolean(releaseForm.published)}
                          onChange={(event) => setReleaseForm((prev) => ({ ...prev, published: event.target.checked }))}
                        />
                        前台展示
                      </label>
                    </div>

                    <div
                      className={`release-admin-preview admin-template-preview preview-${activeReleaseTemplate.value}`}
                      style={{
                        '--template-accent': activeReleaseTemplate.accent,
                        '--template-accent-2': activeReleaseTemplate.accent2,
                        '--template-bg': activeReleaseTemplate.bg,
                        '--template-ink': activeReleaseTemplate.ink
                      }}
                    >
                      <TemplateMiniature template={activeReleaseTemplate} large />
                      <div className="admin-preview-copy">
                        <span>{activeReleaseTemplate.label}</span>
                        <strong>{releaseForm.title || '发布项标题'}</strong>
                        <p>{releaseForm.introduction || '这里会显示介绍。'}</p>
                        <small><Link2 size={14} />{releaseForm.target_url || '跳转 URL'}</small>
                      </div>
                    </div>

                    <div className="admin-actions">
                      <button className="admin-primary" type="button" onClick={saveRelease} disabled={savingRelease}>
                        <Save size={16} />
                        {savingRelease ? '保存中...' : '保存发布项'}
                      </button>
                      {selectedReleaseId !== 'new' && (
                        <button className="admin-danger" type="button" onClick={removeRelease}>
                          <Trash2 size={16} />
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'write' && (
            <section className="admin-surface writer-surface">
              <div className="admin-section-title">
                <FilePenLine size={18} />
                <div>
                  <h2>新文章</h2>
                  <p>默认宋体富文本编辑器，写完后设置 URL 并发布。</p>
                </div>
              </div>

              <div className="writer-grid">
                <div className="writer-main">
                  <Field label="文章标题">
                    <input value={writerForm.title} onChange={(event) => setWriterForm((prev) => ({ ...prev, title: event.target.value }))} />
                  </Field>
                  <RichTextEditor
                    value={writerForm.content_html}
                    onChange={({ html, text }) => setWriterForm((prev) => ({ ...prev, content_html: html, content: text }))}
                  />
                </div>

                <aside className="writer-side">
                  <Field label="发布 URL">
                    <input
                      value={writerForm.slug}
                      placeholder={slugify(writerForm.title) || 'your-url'}
                      onChange={(event) => setWriterForm((prev) => ({ ...prev, slug: event.target.value }))}
                    />
                  </Field>
                  <div className="url-preview">
                    <Link2 size={15} />
                    {postUrl(slugify(writerForm.slug || writerForm.title))}
                  </div>
                  <Field label="摘要">
                    <textarea rows="5" value={writerForm.excerpt} onChange={(event) => setWriterForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
                  </Field>
                  <Field label="标签">
                    <input value={writerForm.tags} placeholder="设计, 观察" onChange={(event) => setWriterForm((prev) => ({ ...prev, tags: event.target.value }))} />
                  </Field>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={writerForm.syncRelease}
                      onChange={(event) => setWriterForm((prev) => ({ ...prev, syncRelease: event.target.checked }))}
                    />
                    发布时同步到首页发布项
                  </label>
                  <button className="admin-secondary full" type="button" onClick={() => saveWriterPost(false)}>
                    <Save size={16} />
                    保存草稿
                  </button>
                  <button className="admin-primary full" type="button" onClick={() => saveWriterPost(true)}>
                    <Eye size={16} />
                    发布文章
                  </button>
                </aside>
              </div>
            </section>
          )}

          {activeTab === 'articles' && (
            <section className="admin-surface">
              <div className="article-manager-grid">
                <div className="admin-list-panel">
                  <div className="admin-section-title compact">
                    <BookOpen size={18} />
                    <div>
                      <h2>文章库</h2>
                      <p>管理已写好的文章、URL 和发布状态。</p>
                    </div>
                  </div>
                  <div className="admin-list">
                    {sortedPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        className={selectedPostId === post.id ? 'active' : ''}
                        onClick={() => setSelectedPostId(post.id)}
                      >
                        <strong>{post.title}</strong>
                        <span>{post.published ? '已发布' : '草稿'} · {postUrl(post.slug)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="managed-editor">
                  {manageForm.id ? (
                    <>
                      <div className="admin-form-grid">
                        <Field label="文章标题">
                          <input value={manageForm.title} onChange={(event) => setManageForm((prev) => ({ ...prev, title: event.target.value }))} />
                        </Field>
                        <Field label="URL">
                          <input value={manageForm.slug} onChange={(event) => setManageForm((prev) => ({ ...prev, slug: event.target.value }))} />
                        </Field>
                        <Field label="摘要" wide>
                          <textarea rows="3" value={manageForm.excerpt} onChange={(event) => setManageForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
                        </Field>
                        <Field label="标签">
                          <input value={manageForm.tags} onChange={(event) => setManageForm((prev) => ({ ...prev, tags: event.target.value }))} />
                        </Field>
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={manageForm.published}
                            onChange={(event) => setManageForm((prev) => ({ ...prev, published: event.target.checked }))}
                          />
                          已发布
                        </label>
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={manageForm.syncRelease}
                            onChange={(event) => setManageForm((prev) => ({ ...prev, syncRelease: event.target.checked }))}
                          />
                          保存时同步发布项
                        </label>
                      </div>

                      <div className="url-preview">
                        <Link2 size={15} />
                        {postUrl(slugify(manageForm.slug || manageForm.title))}
                      </div>

                      <RichTextEditor
                        value={manageForm.content_html}
                        onChange={({ html, text }) => setManageForm((prev) => ({ ...prev, content_html: html, content: text }))}
                      />

                      <div className="admin-actions">
                        <button className="admin-primary" type="button" onClick={() => saveManagedPost()}>
                          <Save size={16} />
                          保存修改
                        </button>
                        <button className="admin-secondary" type="button" onClick={() => saveManagedPost(true)}>
                          <Eye size={16} />
                          保存并发布
                        </button>
                        <button className="admin-danger" type="button" onClick={removePost}>
                          <Trash2 size={16} />
                          删除文章
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="empty-admin-panel">
                      <BookOpen size={28} />
                      <h2>还没有选择文章</h2>
                      <p>左侧选择一篇文章，或者去“写文章”创建新内容。</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </AmbientShell>
  );
}
