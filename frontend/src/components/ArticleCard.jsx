import { motion } from 'framer-motion';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) return '未发布';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value));
}

export default function ArticleCard({ post, featured = false, index = 0 }) {
  return (
    <motion.article
      className={`article-card ${featured ? 'article-card-featured' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
    >
      <div className="article-card-glow" />
      <div className="article-card-topline">
        <span>{formatDate(post.published_at || post.updated_at)}</span>
        <span className="article-reading-time">
          <Clock3 size={14} />
          {post.reading_time} min
        </span>
      </div>

      <Link className="article-card-link" to={`/release/${post.slug}`}>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>

        <div className="article-card-bottom">
          <div className="tag-row">
            {post.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="soft-tag">{tag}</span>
            ))}
          </div>
          <span className="ghost-link">
            阅读全文
            <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
