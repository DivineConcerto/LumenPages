import { useTransform } from 'framer-motion';
import {
  CtaLink,
  Eyebrow,
  TitleLines,
  motion,
  normalizeTargetUrl,
  productPalettes,
  releaseAnchor,
  useStageScroll
} from './shared.jsx';

export function LegacyOrbitShowcase({ release, index }) {
  const [ref, progress] = useStageScroll();
  const palette = productPalettes[(index + 1) % productPalettes.length];
  const rotate = useTransform(progress, [0, 1], [-60, 72]);
  const coreScale = useTransform(progress, [0, 0.46, 1], [0.72, 1, 0.86]);
  const coreY = useTransform(progress, [0, 0.5, 1], [120, 0, -88]);
  const copyY = useTransform(progress, [0, 0.35, 1], [130, 0, -80]);
  const mask = useTransform(progress, [0, 0.25, 1], ['circle(18% at 50% 50%)', 'circle(78% at 50% 50%)', 'circle(92% at 50% 50%)']);
  const floorY = useTransform(progress, [0, 1], [80, -120]);

  return (
    <section className="release-stage product-stage orbit-page" ref={ref} id={releaseAnchor(release, index)}>
      <div className="release-sticky orbit-sticky">
        <motion.div className="orbit-world" style={{ clipPath: mask }}>
          <motion.div className="orbit-rings" style={{ rotate }} />
          <motion.div className="orbit-core-card" style={{ scale: coreScale, y: coreY }}>
            <span>{release.eyebrow}</span>
            <strong>{release.title}</strong>
          </motion.div>
          <motion.span className="orbit-chip chip-a" style={{ background: palette[0], rotate, y: floorY }} />
          <motion.span className="orbit-chip chip-b" style={{ background: palette[2], rotate }} />
          <motion.span className="orbit-chip chip-c" style={{ background: palette[4], rotate, y: coreY }} />
        </motion.div>

        <motion.div className="orbit-copy floating-copy" style={{ y: copyY }}>
          <Eyebrow tone="dark">{release.eyebrow}</Eyebrow>
          <h2>{release.title}</h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}

export function LegacyFoldShowcase({ release, index }) {
  const [ref, progress] = useStageScroll();
  const palette = productPalettes[(index + 1) % productPalettes.length];
  const doorLeft = useTransform(progress, [0, 0.45, 1], ['0%', '-48%', '-62%']);
  const doorRight = useTransform(progress, [0, 0.45, 1], ['0%', '48%', '62%']);
  const titleScale = useTransform(progress, [0, 0.45, 1], [0.8, 1, 0.92]);
  const titleY = useTransform(progress, [0, 0.62, 1], [42, -92, -150]);
  const ribbonA = useTransform(progress, [0, 1], ['-34%', '24%']);
  const ribbonB = useTransform(progress, [0, 1], ['30%', '-22%']);
  const panelY = useTransform(progress, [0, 0.58, 1], [180, 0, -52]);

  return (
    <section className="release-stage product-stage fold-page" ref={ref} id={releaseAnchor(release, index)}>
      <div className="release-sticky fold-sticky">
        <motion.div className="fold-door fold-door-left" style={{ x: doorLeft, background: palette[0] }} />
        <motion.div className="fold-door fold-door-right" style={{ x: doorRight, background: palette[3] }} />
        <div className="fold-ribbons" aria-hidden="true">
          <motion.span style={{ x: ribbonA, background: palette[1] }} />
          <motion.span style={{ x: ribbonB, background: palette[2] }} />
          <motion.span style={{ x: ribbonA, background: palette[4] }} />
        </div>
        <motion.div className="fold-title-block" style={{ scale: titleScale, y: titleY }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} /></h2>
        </motion.div>
        <motion.div className="fold-info-panel" style={{ y: panelY }}>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}

export function LegacyConsoleShowcase({ release, index }) {
  const [ref, progress] = useStageScroll();
  const palette = productPalettes[(index + 1) % productPalettes.length];
  const wipe = useTransform(progress, [0, 0.42, 1], ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);
  const consoleRotate = useTransform(progress, [0, 0.45, 1], [-8, -2, 3]);
  const consoleY = useTransform(progress, [0, 0.56, 1], [120, 0, -90]);
  const scanX = useTransform(progress, [0, 1], ['-20%', '102%']);
  const copyX = useTransform(progress, [0, 0.5, 1], [-70, 0, 44]);

  return (
    <section className="release-stage product-stage console-page" ref={ref} id={releaseAnchor(release, index)}>
      <div className="release-sticky console-sticky">
        <motion.div className="console-wipe" style={{ clipPath: wipe }} />
        <motion.div className="console-terminal" style={{ rotate: consoleRotate, y: consoleY }}>
          <div className="terminal-bar"><span /><span /><span /></div>
          <div className="terminal-lines">
            <div><span style={{ color: palette[2] }}>release.title</span><strong>{release.title}</strong></div>
            <div><span style={{ color: palette[3] }}>release.target</span><strong>{normalizeTargetUrl(release.target_url)}</strong></div>
            <div><span style={{ color: palette[4] }}>release.ready</span><strong>{release.cta_label || '打开'}</strong></div>
          </div>
          <motion.span className="terminal-scan" style={{ left: scanX }} />
        </motion.div>
        <motion.div className="console-copy" style={{ x: copyX }}>
          <Eyebrow tone="dark">{release.eyebrow}</Eyebrow>
          <h2>{release.title}</h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url} tone="light">{release.cta_label || '打开'}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}

function DeckCard({ release, progress, offset, tone, label }) {
  const y = useTransform(progress, [0, 1], [offset * 54, offset * -46]);
  const rotate = useTransform(progress, [0, 1], [offset * -5, offset * 4]);
  const scale = useTransform(progress, [0, 0.55, 1], [0.9, 1, 0.94]);

  return (
    <motion.div className={`deck-card deck-card-${tone}`} style={{ y, rotate, scale }}>
      <span>{label}</span>
      <strong>{offset === 0 ? release.cta_label : release.eyebrow}</strong>
    </motion.div>
  );
}

export function LegacyDeckShowcase({ release, index }) {
  const [ref, progress] = useStageScroll();
  const titleY = useTransform(progress, [0, 0.52, 1], [96, 0, -100]);
  const deckX = useTransform(progress, [0, 0.5, 1], [90, 0, -70]);
  const introClip = useTransform(progress, [0, 0.42, 1], ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);

  return (
    <section className="release-stage product-stage deck-page" ref={ref} id={releaseAnchor(release, index)}>
      <div className="release-sticky deck-sticky">
        <motion.div className="deck-title" style={{ y: titleY }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} /></h2>
        </motion.div>
        <motion.div className="deck-stack" style={{ x: deckX }}>
          <DeckCard release={release} progress={progress} offset={-2} tone="paper" label="01" />
          <DeckCard release={release} progress={progress} offset={-1} tone="red" label="02" />
          <DeckCard release={release} progress={progress} offset={0} tone="blue" label="03" />
          <DeckCard release={release} progress={progress} offset={1} tone="black" label="04" />
        </motion.div>
        <motion.div className="deck-intro" style={{ clipPath: introClip }}>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}
