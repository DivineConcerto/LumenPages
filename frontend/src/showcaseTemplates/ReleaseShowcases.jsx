import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll } from './shared.jsx';

const BLOG_THEMES = [
  {
    name: 'chapter',
    accent: '#b84a35',
    accent2: '#e8b85b',
    ink: '#221f1a',
    paper: '#fbf7ee',
    soft: '#efe7d8',
    height: '226svh'
  },
  {
    name: 'river',
    accent: '#4f7f6a',
    accent2: '#d9a441',
    ink: '#1f2722',
    paper: '#f7f8ef',
    soft: '#e8efe3',
    height: '218svh'
  },
  {
    name: 'shelf',
    accent: '#7e5a8f',
    accent2: '#c06c4b',
    ink: '#211c24',
    paper: '#faf6f4',
    soft: '#ece3ea',
    height: '222svh'
  },
  {
    name: 'marginalia',
    accent: '#bf3d2c',
    accent2: '#557aa5',
    ink: '#20242a',
    paper: '#f8f4ec',
    soft: '#e9e1d3',
    height: '216svh'
  },
  {
    name: 'gallery',
    accent: '#2f6f91',
    accent2: '#d28445',
    ink: '#1f2422',
    paper: '#f6f2ea',
    soft: '#dfe9e2',
    height: '224svh'
  }
];

const stripWords = ['Essay', 'Notebook', 'Index', 'Field note', 'Archive'];
const marginalNotes = ['初稿', '修订', '留白'];

function blogVars(theme) {
  return {
    '--blog-accent': theme.accent,
    '--blog-accent-2': theme.accent2,
    '--blog-ink': theme.ink,
    '--blog-paper': theme.paper,
    '--blog-soft': theme.soft,
    '--blog-stage-height': theme.height
  };
}

function Stage({ release, index, theme, className, children }) {
  return (
    <section
      className={`blog-showcase-stage ${className}`}
      ref={children.ref}
      id={releaseAnchor(release, index)}
      style={blogVars(theme)}
    >
      {children.node}
    </section>
  );
}

function ChapterShowcase({ release, index, theme }) {
  const [ref, progress] = useStageScroll();
  const copyY = useTransform(progress, [0, 0.42, 1], [110, 0, -92]);
  const spreadY = useTransform(progress, [0, 0.44, 1], [145, -8, -118]);
  const pageLeft = useTransform(progress, [0, 0.46, 1], [-10, 0, 8]);
  const pageRight = useTransform(progress, [0, 0.46, 1], [12, 0, -10]);
  const rule = useTransform(progress, [0.08, 0.48, 1], [0.08, 1, 0.62]);
  const issueY = useTransform(progress, [0, 1], [70, -92]);

  return (
    <Stage release={release} index={index} theme={theme} className="blog-chapter-showcase">
      {{
        ref,
        node: (
          <div className="blog-showcase-sticky blog-chapter-sticky">
            <motion.div className="blog-issue-number" style={{ y: issueY }}>
              {String(index + 1).padStart(2, '0')}
            </motion.div>

            <motion.div className="blog-page-spread" style={{ y: spreadY }}>
              <motion.div className="blog-spread-page spread-left" style={{ rotate: pageLeft }}>
                <span>{release.eyebrow}</span>
                <i />
                <i />
                <i />
                <strong>卷首</strong>
              </motion.div>
              <motion.div className="blog-spread-page spread-right" style={{ rotate: pageRight }}>
                <span>{release.cta_label || '阅读'}</span>
                <i />
                <i />
                <i />
                <strong>手记</strong>
              </motion.div>
            </motion.div>

            <motion.div className="blog-showcase-copy blog-chapter-copy" style={{ y: copyY }}>
              <Eyebrow>{release.eyebrow}</Eyebrow>
              <h2><TitleLines title={release.title} maxLength={11} /></h2>
              <motion.i className="blog-copy-rule" style={{ scaleX: rule }} />
              <p>{release.introduction}</p>
              <CtaLink href={release.target_url}>{release.cta_label || '阅读'}</CtaLink>
            </motion.div>
          </div>
        )
      }}
    </Stage>
  );
}

function ReadingRiverShowcase({ release, index, theme }) {
  const [ref, progress] = useStageScroll();
  const copyY = useTransform(progress, [0, 0.44, 1], [96, 0, -80]);
  const quoteScale = useTransform(progress, [0, 0.5, 1], [0.86, 1, 0.9]);
  const stripA = useTransform(progress, [0, 1], ['-18%', '18%']);
  const stripB = useTransform(progress, [0, 1], ['16%', '-20%']);
  const mask = useTransform(progress, [0.06, 0.52, 1], ['inset(0 92% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)']);

  return (
    <Stage release={release} index={index} theme={theme} className="blog-river-showcase">
      {{
        ref,
        node: (
          <div className="blog-showcase-sticky blog-river-sticky">
            <div className="blog-river-strips" aria-hidden="true">
              {stripWords.map((word, wordIndex) => (
                <motion.span
                  key={word}
                  style={{ x: wordIndex % 2 ? stripB : stripA }}
                >
                  {word}<b>{release.title}</b>
                </motion.span>
              ))}
            </div>

            <motion.div className="blog-river-card" style={{ scale: quoteScale, clipPath: mask }}>
              <span>摘录</span>
              <strong>{release.introduction}</strong>
            </motion.div>

            <motion.div className="blog-showcase-copy blog-river-copy" style={{ y: copyY }}>
              <Eyebrow>{release.eyebrow}</Eyebrow>
              <h2><TitleLines title={release.title} maxLength={10} /></h2>
              <p>{release.introduction}</p>
              <CtaLink href={release.target_url}>{release.cta_label || '阅读'}</CtaLink>
            </motion.div>
          </div>
        )
      }}
    </Stage>
  );
}

function ShelfShowcase({ release, index, theme }) {
  const [ref, progress] = useStageScroll();
  const shelfX = useTransform(progress, [0, 1], ['-8%', '8%']);
  const shelfY = useTransform(progress, [0, 0.5, 1], [110, 0, -110]);
  const coverRotate = useTransform(progress, [0, 0.46, 1], [-8, 0, 7]);
  const copyX = useTransform(progress, [0, 0.46, 1], ['7%', '0%', '-5%']);
  const lamp = useTransform(progress, [0.08, 0.5, 1], [0.24, 0.8, 0.36]);

  return (
    <Stage release={release} index={index} theme={theme} className="blog-shelf-showcase">
      {{
        ref,
        node: (
          <div className="blog-showcase-sticky blog-shelf-sticky">
            <motion.div className="blog-shelf-light" style={{ opacity: lamp }} />

            <motion.div className="blog-shelf-wall" style={{ x: shelfX, y: shelfY }}>
              {Array.from({ length: 21 }, (_, spine) => (
                <span key={spine} className={`spine-${spine % 5}`}>
                  <b>{spine % 4 === 0 ? '文' : spine % 4 === 1 ? '记' : spine % 4 === 2 ? '札' : '页'}</b>
                </span>
              ))}
            </motion.div>

            <motion.div className="blog-featured-cover" style={{ rotate: coverRotate }}>
              <small>{release.eyebrow}</small>
              <strong>{release.title}</strong>
              <i />
            </motion.div>

            <motion.div className="blog-showcase-copy blog-shelf-copy" style={{ x: copyX }}>
              <Eyebrow>{release.eyebrow}</Eyebrow>
              <h2><TitleLines title={release.title} maxLength={10} /></h2>
              <p>{release.introduction}</p>
              <CtaLink href={release.target_url}>{release.cta_label || '阅读'}</CtaLink>
            </motion.div>
          </div>
        )
      }}
    </Stage>
  );
}

function MarginaliaShowcase({ release, index, theme }) {
  const [ref, progress] = useStageScroll();
  const sheetY = useTransform(progress, [0, 0.48, 1], [130, -4, -96]);
  const copyY = useTransform(progress, [0, 0.44, 1], [92, 0, -80]);
  const underline = useTransform(progress, [0.1, 0.5, 1], [0.05, 1, 0.72]);
  const noteX = useTransform(progress, [0, 1], ['-10%', '12%']);
  const pencil = useTransform(progress, [0, 1], [-12, 20]);

  return (
    <Stage release={release} index={index} theme={theme} className="blog-marginalia-showcase">
      {{
        ref,
        node: (
          <div className="blog-showcase-sticky blog-marginalia-sticky">
            <motion.div className="blog-manuscript-sheet" style={{ y: sheetY }}>
              <header>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{release.eyebrow}</b>
              </header>
              <main>
                <i />
                <i />
                <i />
                <motion.i className="marked-line" style={{ scaleX: underline }} />
                <i />
                <i />
              </main>
              <motion.div className="blog-pencil" style={{ rotate: pencil }} />
            </motion.div>

            <motion.div className="blog-margin-notes" style={{ x: noteX }}>
              {marginalNotes.map((note) => <span key={note}>{note}</span>)}
            </motion.div>

            <motion.div className="blog-showcase-copy blog-marginalia-copy" style={{ y: copyY }}>
              <Eyebrow>{release.eyebrow}</Eyebrow>
              <h2><TitleLines title={release.title} maxLength={10} /></h2>
              <p>{release.introduction}</p>
              <CtaLink href={release.target_url}>{release.cta_label || '阅读'}</CtaLink>
            </motion.div>
          </div>
        )
      }}
    </Stage>
  );
}

function GalleryShowcase({ release, index, theme }) {
  const [ref, progress] = useStageScroll();
  const wallY = useTransform(progress, [0, 0.5, 1], [128, 0, -110]);
  const frameA = useTransform(progress, [0, 1], [-8, 8]);
  const frameB = useTransform(progress, [0, 1], [7, -10]);
  const copyY = useTransform(progress, [0, 0.42, 1], [86, 0, -82]);
  const rail = useTransform(progress, [0.08, 0.52, 1], [0.12, 1, 0.66]);

  return (
    <Stage release={release} index={index} theme={theme} className="blog-gallery-showcase">
      {{
        ref,
        node: (
          <div className="blog-showcase-sticky blog-gallery-sticky">
            <motion.div className="blog-gallery-wall" style={{ y: wallY }}>
              <motion.article className="gallery-piece gallery-piece-large" style={{ rotate: frameA }}>
                <span>{release.eyebrow}</span>
                <strong>{release.title}</strong>
              </motion.article>
              <motion.article className="gallery-piece gallery-piece-small" style={{ rotate: frameB }}>
                <span>Note</span>
                <i />
                <i />
              </motion.article>
              <motion.article className="gallery-piece gallery-piece-tall" style={{ rotate: frameA }}>
                <span>Collected</span>
                <i />
                <i />
                <i />
              </motion.article>
            </motion.div>

            <motion.div className="blog-gallery-rail" style={{ scaleY: rail }} />

            <motion.div className="blog-showcase-copy blog-gallery-copy" style={{ y: copyY }}>
              <Eyebrow>{release.eyebrow}</Eyebrow>
              <h2><TitleLines title={release.title} maxLength={9} /></h2>
              <p>{release.introduction}</p>
              <CtaLink href={release.target_url}>{release.cta_label || '阅读'}</CtaLink>
            </motion.div>
          </div>
        )
      }}
    </Stage>
  );
}

const BLOG_SHOWCASES = [
  ChapterShowcase,
  ReadingRiverShowcase,
  ShelfShowcase,
  MarginaliaShowcase,
  GalleryShowcase
];

export function ReleaseShowcase({ release, index }) {
  const theme = BLOG_THEMES[index % BLOG_THEMES.length];
  const Component = BLOG_SHOWCASES[index % BLOG_SHOWCASES.length];
  return <Component release={release} index={index} theme={theme} />;
}

export default ReleaseShowcase;
