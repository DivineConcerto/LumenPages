import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Feather, Library, Mail, Sparkles } from 'lucide-react';
import { api } from '../api';
import AmbientShell from '../components/AmbientShell';
import LoadingState from '../components/LoadingState';
import ReleaseShowcase from '../showcaseTemplates/ReleaseShowcases';

const semanticTitleBreaks = ['为什么', '放在', '应该', '以及', '如何', '正在', '长期', '世界'];

function splitLongTitleSegment(segment, maxLength = 12) {
  const text = String(segment).trim();
  if (text.length <= maxLength) return [text];

  const semanticBreak = semanticTitleBreaks
    .map((phrase) => text.indexOf(phrase))
    .find((index) => index >= 3 && text.length - index <= maxLength);

  if (semanticBreak) {
    return [
      text.slice(0, semanticBreak),
      ...splitLongTitleSegment(text.slice(semanticBreak), maxLength)
    ];
  }

  const punctuationBreaks = [...text.matchAll(/[、，。！？!?：:；;]/g)]
    .map((match) => match.index + 1)
    .filter((index) => index >= 3 && index <= maxLength);

  const spaceBreaks = [...text.matchAll(/\s+/g)]
    .map((match) => match.index + match[0].length)
    .filter((index) => index >= 3 && index <= maxLength);

  const target = Math.min(maxLength, Math.ceil(text.length / 2));
  const bestBreak = [...punctuationBreaks, ...spaceBreaks]
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

  if (bestBreak) {
    return [
      text.slice(0, bestBreak),
      ...splitLongTitleSegment(text.slice(bestBreak), maxLength)
    ];
  }

  return [
    text.slice(0, maxLength),
    ...splitLongTitleSegment(text.slice(maxLength), maxLength)
  ];
}

function splitTitle(value = '', maxLength = 12) {
  const title = String(value).trim();
  const segments = title.match(/[^，。！？!?：:；;]+[，。！？!?：:；;]?/g) || [title];
  return segments.flatMap((segment) => splitLongTitleSegment(segment, maxLength));
}

function normalizeTargetUrl(url = '') {
  const value = String(url).trim();
  if (!value) return '#';
  if (value.startsWith('/') || value.startsWith('#')) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function useStageScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  return [ref, scrollYProgress];
}

function Eyebrow({ children, tone = 'light' }) {
  return (
    <span className={`stage-eyebrow stage-eyebrow-${tone}`}>
      <Sparkles size={16} />
      {children}
    </span>
  );
}

function CtaLink({ href, children, tone = 'dark' }) {
  return (
    <a className={`stage-cta stage-cta-${tone}`} href={normalizeTargetUrl(href)}>
      {children}
      <ArrowRight size={18} />
    </a>
  );
}

function TitleLines({ title, maxLength = 12 }) {
  const lines = useMemo(() => splitTitle(title, maxLength), [title, maxLength]);
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>{line}</span>
      ))}
    </>
  );
}

function PersonalHero({ site }) {
  const [ref, progress] = useStageScroll();
  const copyY = useTransform(progress, [0, 0.2, 0.82, 1], [90, 0, -16, -110]);
  const copyOpacity = useTransform(progress, [0, 0.14, 0.86, 1], [0.16, 1, 1, 0.08]);
  const paperScale = useTransform(progress, [0, 0.45, 1], [0.9, 1, 1.04]);
  const paperRadius = useTransform(progress, [0, 0.48, 1], ['42px', '24px', '10px']);
  const paperY = useTransform(progress, [0, 1], [70, -80]);
  const leftPage = useTransform(progress, [0, 0.56, 1], [-18, 0, 11]);
  const rightPage = useTransform(progress, [0, 0.56, 1], [16, 0, -9]);
  const ruleScale = useTransform(progress, [0.18, 0.6, 1], [0.18, 1, 0.64]);
  const notesY = useTransform(progress, [0, 1], [94, -82]);
  const transitionScale = useTransform(progress, [0.58, 1], [0, 1]);

  return (
    <section className="release-stage personal-stage blog-hero-stage" ref={ref} id="intro">
      <div className="release-sticky blog-hero-sticky">
        <motion.div className="blog-hero-paper" style={{ scale: paperScale, borderRadius: paperRadius, y: paperY }}>
          <motion.div className="blog-hero-book">
            <motion.div className="blog-book-page blog-book-left" style={{ rotate: leftPage }}>
              <span>{site.site_name}</span>
              <i />
              <i />
              <i />
            </motion.div>
            <motion.div className="blog-book-page blog-book-right" style={{ rotate: rightPage }}>
              <span>{site.site_tagline}</span>
              <i />
              <i />
              <i />
            </motion.div>
          </motion.div>
          <motion.div className="blog-hero-rule" style={{ scaleX: ruleScale }} />
          <motion.div className="blog-hero-notes" style={{ y: notesY }}>
            <span>01</span>
            <strong>Archive</strong>
            <span>Notes</span>
          </motion.div>
        </motion.div>

        <motion.div className="personal-copy blog-hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <Eyebrow>{site.hero_badge}</Eyebrow>
          <h1><TitleLines title={site.hero_title} maxLength={13} /></h1>
          <p>{site.hero_subtitle || site.about_body}</p>
          <CtaLink href="#latest">查看最新发布</CtaLink>
        </motion.div>

        <motion.div className="transition-center-expand blog-transition-bar" style={{ scaleX: transitionScale }} />
      </div>
    </section>
  );
}

function BlogCurationStrip({ site, count }) {
  return (
    <section className="blog-curation-strip" id="writing-room">
      <div className="blog-curation-card">
        <BookOpen size={22} />
        <span>Reading room</span>
        <strong>{count} 个公开发布</strong>
      </div>
      <div className="blog-curation-card">
        <Feather size={22} />
        <span>{site.about_title}</span>
        <strong>{site.site_description}</strong>
      </div>
      <a className="blog-curation-card blog-curation-link" href={site.email ? `mailto:${site.email}` : '#contact'}>
        <Mail size={22} />
        <span>Contact</span>
        <strong>{site.email || site.location || '保持联系'}</strong>
      </a>
      <div className="blog-curation-ribbon" aria-hidden="true">
        <Library size={18} />
        <span>Journal / Essays / Releases</span>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [site, setSite] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = '个人主页';
    Promise.all([api.getSite(), api.getReleases()])
      .then(([siteData, releaseData]) => {
        setSite(siteData);
        setReleases(releaseData);
        document.title = `${siteData.site_name} · ${siteData.site_tagline}`;
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AmbientShell site={site} variant="atelier">
        <LoadingState label="正在加载发布页..." />
      </AmbientShell>
    );
  }

  return (
    <AmbientShell site={site} variant="atelier">
      <div className="launch-home launch-home-premium">
        <PersonalHero site={site} />
        <BlogCurationStrip site={site} count={releases.length} />

        {releases.map((release, index) => (
          <ReleaseShowcase key={release.id} release={release} index={index} />
        ))}

        <section className="launch-ending premium-launch-ending blog-ending" id="reading-room">
          <span>Journal system</span>
          <h2>把每一篇发布，放进一间会呼吸的书房。</h2>
          <p>文字、手稿、目录、批注和收藏在这里互相照面。它们安静地排成一条线，也保留每一篇内容自己的房间。</p>
        </section>
      </div>
    </AmbientShell>
  );
}
