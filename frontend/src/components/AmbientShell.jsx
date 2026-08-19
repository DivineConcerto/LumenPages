import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight, BookOpen, Feather, Github, Linkedin, Mail, Search, Sparkles, Twitter } from 'lucide-react';
import { useMemo } from 'react';

function optionalLink(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const defaultAtelierNav = [
  { label: '卷首', href: '#intro' },
  { label: '最新', href: '#latest' },
  { label: '札记', href: '#writing-room' },
  { label: '书房', href: '#reading-room' },
  { label: '联系', href: '#contact' }
];

function normalizeNavItems(site, isAtelier) {
  if (!isAtelier) {
    return [
      { href: '#latest', label: '内容' },
      { href: '#about', label: '关于' }
    ];
  }

  const items = Array.isArray(site?.nav_items)
    ? site.nav_items
    : defaultAtelierNav;

  const normalized = items
    .map((item) => ({
      label: String(item?.label || '').trim(),
      href: String(item?.href || '#').trim() || '#'
    }))
    .filter((item) => item.label)
    .slice(0, 12);

  const isPlaceholderNav = normalized.every((item) => /^测试\d+$/.test(item.label));
  return normalized.length && !isPlaceholderNav ? normalized : defaultAtelierNav;
}

export default function AmbientShell({ site, minimal = false, variant = 'default', children }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });
  const isAtelier = variant === 'atelier';
  const navItems = normalizeNavItems(site, isAtelier);

  const footerLinks = useMemo(() => [
    {
      icon: Github,
      label: 'GitHub',
      href: optionalLink(site?.github_url)
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: optionalLink(site?.linkedin_url)
    },
    {
      icon: Twitter,
      label: 'X',
      href: optionalLink(site?.x_url)
    },
    {
      icon: Mail,
      label: 'Email',
      href: site?.email ? `mailto:${site.email}` : null
    }
  ].filter((item) => item.href), [site]);

  return (
    <div className={`page-shell ${isAtelier ? 'page-shell-atelier' : ''}`}>
      <motion.div className="scroll-line" style={{ scaleX: progress }} />
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <header className={`site-header ${minimal ? 'site-header-minimal' : ''}`}>
        <div className="nav-container glass-panel">
          <Link to="/" className="brand-mark apple-brand">
            <span className="brand-emblem"><Sparkles size={14} /></span>
            <div className="brand-copy">
              <strong>{site?.site_name || 'Aster Archive'}</strong>
              <small>{site?.site_tagline || 'Personal journal'}</small>
            </div>
          </Link>

          {!minimal && (
            <nav className="main-nav apple-main-nav">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>{item.label}</a>
              ))}
              {!isAtelier && (
                <Link to="/admin/login" className="admin-link">
                  管理后台
                  <ArrowUpRight size={15} />
                </Link>
              )}
            </nav>
          )}

          {isAtelier && !minimal && (
            <div className="apple-nav-icons" aria-hidden="true">
              <Search size={19} />
              <BookOpen size={18} />
              <Feather size={17} />
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-panel glass-panel">
          <div>
            <p className="footer-label">Archive / Signal / Release</p>
            <h3>{site?.site_name || 'Aster Archive'}</h3>
            <p className="footer-copy">
              {site?.footer_note || 'A personal homepage, maintained with care.'}
            </p>
          </div>

          <div className="footer-meta">
            <div>
              <span>位置</span>
              <strong>{site?.location || 'Anywhere with a notebook'}</strong>
            </div>
            <div>
              <span>联系</span>
              <strong>{site?.email || 'hello@example.com'}</strong>
            </div>
          </div>

          {footerLinks.length > 0 && (
            <div className="footer-socials">
              {footerLinks.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer">
                  <Icon size={16} />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
