import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import AmbientShell from '../components/AmbientShell';
import LoadingState from '../components/LoadingState';
import MarkdownRenderer from '../components/MarkdownRenderer';

function formatDate(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value));
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [site, setSite] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSite(), api.getPost(slug)])
      .then(([siteData, postData]) => {
        setSite(siteData);
        setPost(postData);
        document.title = `${postData.title} · ${siteData.site_name}`;
      })
      .catch(() => {
        document.title = '内容未找到';
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <AmbientShell site={site} minimal variant="atelier">
        <LoadingState label="正在展开发布页..." />
      </AmbientShell>
    );
  }

  if (!post) {
    return (
      <AmbientShell site={site} minimal variant="atelier">
        <div className="empty-state glass-panel">
          <h2>这条内容没有找到</h2>
          <p>大概率是它还没发布，或者 slug 已经被改过了。</p>
          <Link to="/" className="primary-button">返回首页</Link>
        </div>
      </AmbientShell>
    );
  }

  return (
    <AmbientShell site={site} minimal variant="atelier">
      <section className="article-hero">
        <motion.div
          className="article-hero-card glass-panel"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            返回首页
          </Link>

          <div className="article-meta">
            <span>{formatDate(post.published_at || post.updated_at)}</span>
            <span className="article-reading-time">
              <Clock3 size={14} />
              {post.reading_time} min read
            </span>
          </div>

          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>

          <div className="tag-row">
            {post.tags?.map((tag) => (
              <span key={tag} className="soft-tag">{tag}</span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="article-body-section">
        <motion.div
          className="article-body-wrap glass-panel"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          {post.content_html ? (
            <div
              className="rich-article-content"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          ) : (
            <MarkdownRenderer content={post.content} />
          )}
        </motion.div>
      </section>
    </AmbientShell>
  );
}
