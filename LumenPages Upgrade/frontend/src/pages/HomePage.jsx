import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CircleDot, Sparkles } from 'lucide-react';
import { api } from '../api';
import AmbientShell from '../components/AmbientShell';
import LoadingState from '../components/LoadingState';
import { getReleaseTemplate } from '../releaseTemplates';

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

  const target = Math.min(maxLength, Math.ceil(text.length / 2));
  const bestBreak = punctuationBreaks.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

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
  const copyY = useTransform(progress, [0, 0.26, 0.84, 1], [94, 0, 0, -96]);
  const copyOpacity = useTransform(progress, [0, 0.16, 0.86, 1], [0.08, 1, 1, 0.12]);
  const plateScale = useTransform(progress, [0, 0.4, 1], [0.9, 1, 1.05]);
  const plateRadius = useTransform(progress, [0, 0.5, 1], ['52px', '28px', '12px']);
  const gridY = useTransform(progress, [0, 1], [70, -110]);
  const shardOne = useTransform(progress, [0, 1], [-80, 84]);
  const shardTwo = useTransform(progress, [0, 1], [96, -76]);
  const orbRotate = useTransform(progress, [0, 1], [-22, 34]);
  const revealScale = useTransform(progress, [0.55, 1], [0, 1]);

  return (
    <section className="release-stage personal-stage premium-personal-stage" ref={ref} id="intro">
      <div className="release-sticky personal-sticky premium-personal-sticky">
        <motion.div className="personal-plate premium-personal-plate" style={{ scale: plateScale, borderRadius: plateRadius }}>
          <motion.div className="personal-grid premium-personal-grid" style={{ y: gridY }} />
          <motion.div className="personal-shard personal-shard-a premium-shard-a" style={{ y: shardOne }} />
          <motion.div className="personal-shard personal-shard-b premium-shard-b" style={{ y: shardTwo }} />
          <motion.div className="premium-hero-orbit" style={{ rotate: orbRotate }} />
          <div className="premium-hero-noise" />
        </motion.div>

        <motion.div className="personal-copy premium-personal-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <Eyebrow>{site.hero_badge}</Eyebrow>
          <h1><TitleLines title={site.hero_title} maxLength={13} /></h1>
          <p>{site.hero_subtitle || site.about_body}</p>
          <CtaLink href="#latest">查看最新发布</CtaLink>
        </motion.div>

        <motion.div className="transition-center-expand premium-transition-bar" style={{ scaleX: revealScale }} />
      </div>
    </section>
  );
}

function TemplateCopy({ release, template, y, opacity }) {
  const dark = template.mood === 'night';
  return (
    <motion.div className="template-copy" style={{ y, opacity }}>
      <Eyebrow tone={dark ? 'dark' : 'light'}>{release.eyebrow}</Eyebrow>
      <h2><TitleLines title={release.title} maxLength={12} /></h2>
      <p>{release.introduction}</p>
      <CtaLink href={release.target_url} tone={dark ? 'light' : 'dark'}>
        {release.cta_label || '打开'}
      </CtaLink>
    </motion.div>
  );
}

function VisualLabel({ release }) {
  return (
    <div className="visual-label">
      <span>{release.eyebrow}</span>
      <strong>{release.title}</strong>
    </div>
  );
}

function TemplateVisual({ release, template, motionStyle }) {
  const { visualY, visualYAlt, rotate, rotateAlt, scale, scaleAlt, sweep, reveal, xDrift, xDriftAlt } = motionStyle;

  switch (template.visual) {
    case 'orbit':
      return (
        <motion.div className="template-visual visual-orbit" style={{ y: visualY, scale }}>
          <motion.div className="orbit-radar" style={{ rotate }} />
          <motion.div className="orbit-moon orbit-moon-a" style={{ y: visualYAlt, x: xDrift }} />
          <motion.div className="orbit-moon orbit-moon-b" style={{ y: visualY, x: xDriftAlt }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'ribbon':
      return (
        <motion.div className="template-visual visual-ribbon" style={{ y: visualY }}>
          {[0, 1, 2, 3, 4].map((item) => (
            <motion.span key={item} style={{ x: item % 2 ? xDriftAlt : xDrift, scaleX: sweep }} />
          ))}
          <motion.div className="ribbon-title-card" style={{ rotate: rotateAlt, scale }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    case 'stack':
      return (
        <motion.div className="template-visual visual-stack" style={{ y: visualY }}>
          {[0, 1, 2, 3].map((item) => (
            <motion.div className={`stack-plate stack-plate-${item}`} key={item} style={{ rotate: item % 2 ? rotateAlt : rotate, y: item % 2 ? visualYAlt : visualY }}>
              <span>{String(item + 1).padStart(2, '0')}</span>
              <strong>{item === 3 ? release.cta_label : release.eyebrow}</strong>
            </motion.div>
          ))}
        </motion.div>
      );
    case 'console':
      return (
        <motion.div className="template-visual visual-console" style={{ y: visualY, rotate: rotateAlt }}>
          <div className="console-top"><span /><span /><span /></div>
          <div className="console-lines">
            <div><span>release.title</span><strong>{release.title}</strong></div>
            <div><span>target.url</span><strong>{normalizeTargetUrl(release.target_url)}</strong></div>
            <div><span>visual.template</span><strong>{template.label}</strong></div>
          </div>
          <motion.i style={{ left: xDrift }} />
        </motion.div>
      );
    case 'prism':
      return (
        <motion.div className="template-visual visual-prism" style={{ y: visualY, rotate: rotate }}>
          <motion.div className="prism-core" style={{ scale }}><VisualLabel release={release} /></motion.div>
          <motion.span className="prism-beam beam-a" style={{ x: xDrift }} />
          <motion.span className="prism-beam beam-b" style={{ x: xDriftAlt }} />
          <motion.span className="prism-beam beam-c" style={{ x: xDrift }} />
        </motion.div>
      );
    case 'aurora':
      return (
        <motion.div className="template-visual visual-aurora" style={{ y: visualY }}>
          <motion.span className="aurora-wave wave-a" style={{ x: xDrift, scaleX: sweep }} />
          <motion.span className="aurora-wave wave-b" style={{ x: xDriftAlt, scaleX: sweep }} />
          <motion.span className="aurora-wave wave-c" style={{ x: xDrift, scaleX: sweep }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'editorial':
      return (
        <motion.div className="template-visual visual-editorial" style={{ y: visualY }}>
          <motion.div className="editorial-number" style={{ x: xDrift }}>§</motion.div>
          <motion.div className="editorial-cover" style={{ rotate: rotateAlt, scale }}><VisualLabel release={release} /></motion.div>
          <motion.div className="editorial-rule" style={{ scaleX: sweep }} />
        </motion.div>
      );
    case 'cinema':
      return (
        <motion.div className="template-visual visual-cinema" style={{ y: visualY }}>
          <motion.div className="cinema-frame" style={{ scale }}><VisualLabel release={release} /></motion.div>
          <motion.div className="cinema-curtain curtain-a" style={{ x: xDrift }} />
          <motion.div className="cinema-curtain curtain-b" style={{ x: xDriftAlt }} />
        </motion.div>
      );
    case 'atlas':
      return (
        <motion.div className="template-visual visual-atlas" style={{ y: visualY }}>
          <motion.div className="atlas-contours" style={{ rotate }} />
          <motion.div className="atlas-pin pin-a" style={{ x: xDrift }} />
          <motion.div className="atlas-pin pin-b" style={{ x: xDriftAlt }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'lattice':
      return (
        <motion.div className="template-visual visual-lattice" style={{ y: visualY, scale }}>
          {Array.from({ length: 18 }, (_, item) => <motion.span key={item} style={{ opacity: reveal }} />)}
          <motion.div className="lattice-proof" style={{ rotate: rotateAlt }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    case 'nebula':
      return (
        <motion.div className="template-visual visual-nebula" style={{ y: visualY }}>
          <motion.div className="nebula-cloud" style={{ rotate, scale }} />
          {Array.from({ length: 16 }, (_, item) => <motion.span key={item} className={`nebula-dot dot-${item}`} style={{ opacity: reveal }} />)}
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'glass':
      return (
        <motion.div className="template-visual visual-glass" style={{ y: visualY }}>
          <motion.div className="glass-pane pane-a" style={{ x: xDrift, rotate }} />
          <motion.div className="glass-pane pane-b" style={{ x: xDriftAlt, rotate: rotateAlt }} />
          <motion.div className="glass-display" style={{ scale }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    case 'timeline':
      return (
        <motion.div className="template-visual visual-timeline" style={{ y: visualY }}>
          <motion.div className="timeline-line" style={{ scaleY: sweep }} />
          {[0, 1, 2, 3].map((item) => <motion.div className={`timeline-event event-${item}`} key={item} style={{ x: item % 2 ? xDrift : xDriftAlt }} />)}
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'spotlight':
      return (
        <motion.div className="template-visual visual-spotlight" style={{ y: visualY }}>
          <motion.div className="spotlight-beam" style={{ rotate }} />
          <motion.div className="spotlight-card" style={{ scale }}><VisualLabel release={release} /></motion.div>
          <motion.div className="spotlight-floor" style={{ scaleX: sweep }} />
        </motion.div>
      );
    case 'monolith':
      return (
        <motion.div className="template-visual visual-monolith" style={{ y: visualY, scale }}>
          <motion.div className="monolith-slab" style={{ rotate: rotateAlt }}><VisualLabel release={release} /></motion.div>
          <motion.div className="monolith-shadow" style={{ scaleX: sweep }} />
        </motion.div>
      );
    case 'garden':
      return (
        <motion.div className="template-visual visual-garden" style={{ y: visualY }}>
          {[0, 1, 2, 3, 4].map((item) => <motion.span key={item} className={`garden-leaf leaf-${item}`} style={{ rotate: item % 2 ? rotate : rotateAlt, y: item % 2 ? visualYAlt : visualY }} />)}
          <motion.div className="garden-card" style={{ scale }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    case 'blueprint':
      return (
        <motion.div className="template-visual visual-blueprint" style={{ y: visualY }}>
          <motion.div className="blueprint-grid" style={{ x: xDrift }} />
          <motion.div className="blueprint-arc" style={{ rotate }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'liquid':
      return (
        <motion.div className="template-visual visual-liquid" style={{ y: visualY }}>
          <motion.div className="liquid-blob blob-a" style={{ x: xDrift, scale }} />
          <motion.div className="liquid-blob blob-b" style={{ x: xDriftAlt, scale: scaleAlt }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'constellation':
      return (
        <motion.div className="template-visual visual-constellation" style={{ y: visualY }}>
          <motion.div className="constellation-web" style={{ rotate }} />
          {Array.from({ length: 10 }, (_, item) => <motion.span key={item} className={`star-node node-${item}`} style={{ opacity: reveal }} />)}
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'gallery':
      return (
        <motion.div className="template-visual visual-gallery" style={{ y: visualY }}>
          {[0, 1, 2].map((item) => <motion.div key={item} className={`gallery-frame frame-${item}`} style={{ rotate: item % 2 ? rotate : rotateAlt, x: item % 2 ? xDrift : xDriftAlt }} />)}
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'horizon':
      return (
        <motion.div className="template-visual visual-horizon" style={{ y: visualY }}>
          <motion.div className="horizon-sun" style={{ y: visualYAlt, scale }} />
          <motion.div className="horizon-line line-a" style={{ x: xDrift }} />
          <motion.div className="horizon-line line-b" style={{ x: xDriftAlt }} />
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'capsule':
      return (
        <motion.div className="template-visual visual-capsule" style={{ y: visualY }}>
          {[0, 1, 2, 3, 4].map((item) => <motion.div key={item} className={`capsule-pill pill-${item}`} style={{ x: item % 2 ? xDrift : xDriftAlt, scale: item % 2 ? scale : scaleAlt }} />)}
          <VisualLabel release={release} />
        </motion.div>
      );
    case 'origami':
      return (
        <motion.div className="template-visual visual-origami" style={{ y: visualY }}>
          {[0, 1, 2, 3].map((item) => <motion.div key={item} className={`origami-fold fold-${item}`} style={{ rotate: item % 2 ? rotate : rotateAlt }} />)}
          <motion.div className="origami-card" style={{ scale }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    case 'equation':
      return (
        <motion.div className="template-visual visual-equation" style={{ y: visualY }}>
          <motion.div className="equation-surface" style={{ rotate }} />
          <motion.div className="equation-formula" style={{ x: xDrift }}>∫ e<sup>iθ</sup> dμ · Δ</motion.div>
          <motion.div className="equation-card" style={{ scale }}><VisualLabel release={release} /></motion.div>
        </motion.div>
      );
    default:
      return (
        <motion.div className="template-visual visual-orbit" style={{ y: visualY, scale }}>
          <motion.div className="orbit-radar" style={{ rotate }} />
          <VisualLabel release={release} />
        </motion.div>
      );
  }
}

function ReleaseTemplateStage({ release, index }) {
  const template = getReleaseTemplate(release.visual_style, index);
  const [ref, progress] = useStageScroll();
  const isDark = template.mood === 'night';
  const copyY = useTransform(progress, [0, 0.34, 0.78, 1], [112, 0, 0, -92]);
  const copyOpacity = useTransform(progress, [0, 0.16, 0.86, 1], [0.08, 1, 1, 0.1]);
  const visualY = useTransform(progress, [0, 0.45, 1], [120, 0, -110]);
  const visualYAlt = useTransform(progress, [0, 1], [-70, 92]);
  const rotate = useTransform(progress, [0, 1], [-34, 38]);
  const rotateAlt = useTransform(progress, [0, 1], [28, -32]);
  const scale = useTransform(progress, [0, 0.45, 1], [0.82, 1, 0.92]);
  const scaleAlt = useTransform(progress, [0, 0.52, 1], [1.08, 0.92, 1.14]);
  const sweep = useTransform(progress, [0, 0.42, 1], [0.18, 1, 1.12]);
  const reveal = useTransform(progress, [0, 0.28, 0.82, 1], [0.18, 1, 1, 0.42]);
  const xDrift = useTransform(progress, [0, 1], ['-16%', '16%']);
  const xDriftAlt = useTransform(progress, [0, 1], ['18%', '-14%']);
  const clip = useTransform(progress, [0, 0.28, 1], ['inset(8% 10% 8% 10% round 32px)', 'inset(0% 0% 0% 0% round 18px)', 'inset(0% 0% 0% 0% round 0px)']);

  return (
    <section
      className={`release-stage product-stage template-stage template-${template.value} template-${template.visual} ${isDark ? 'template-dark' : 'template-light'}`}
      ref={ref}
      id={index === 0 ? 'latest' : `release-${release.id}`}
      style={{
        '--template-accent': template.accent,
        '--template-accent-2': template.accent2,
        '--template-ink': template.ink,
        '--template-bg': template.bg
      }}
    >
      <motion.div className="release-sticky template-sticky" style={{ clipPath: clip }}>
        <div className="template-bg-grid" />
        <div className="template-bg-glow glow-a" />
        <div className="template-bg-glow glow-b" />
        <TemplateVisual
          release={release}
          template={template}
          motionStyle={{ visualY, visualYAlt, rotate, rotateAlt, scale, scaleAlt, sweep, reveal, xDrift, xDriftAlt }}
        />
        <TemplateCopy release={release} template={template} y={copyY} opacity={copyOpacity} />
        <div className="template-index"><CircleDot size={14} /> {String(index + 1).padStart(2, '0')}</div>
      </motion.div>
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

        {releases.map((release, index) => (
          <ReleaseTemplateStage key={release.id} release={release} index={index} />
        ))}

        <section className="launch-ending premium-launch-ending">
          <span>Release system</span>
          <h2>24 种宣传页骨架，后台一键换装。</h2>
          <p>游戏、文章、工具、外部项目都可以用发布项管理。每一屏都有独立构图、滑动节奏和视觉重心，新增内容时直接挑模板，不用再拿 CSS 当砂纸慢慢磨。</p>
        </section>
      </div>
    </AmbientShell>
  );
}
