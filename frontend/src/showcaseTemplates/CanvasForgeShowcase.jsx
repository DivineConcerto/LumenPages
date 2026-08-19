import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

export default function CanvasForgeShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const canvasX = useTransform(progress, [0, 1], ['8%', '-10%']);
  const frameA = useTransform(progress, [0, 1], [-6, 8]);
  const frameB = useTransform(progress, [0, 1], [10, -9]);
  const toolbarY = useTransform(progress, [0, 0.45, 1], [-60, 0, 70]);
  const copyY = useTransform(progress, [0, 0.5, 1], [140, 0, -120]);

  return (
    <section className="showcase-stage tech-canvas" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '218svh')}>
      <div className="showcase-sticky canvas-sticky">
        <motion.div className="canvas-toolbar" style={{ y: toolbarY }}>
          <span>Move</span><span>Frame</span><span>Vector</span><span>AI</span>
        </motion.div>

        <motion.div className="canvas-field" style={{ x: canvasX }}>
          <motion.div className="canvas-frame frame-product" style={{ rotate: frameA }}>
            <header><b>{release.eyebrow}</b><small>{String(index + 1).padStart(2, '0')}</small></header>
            <main><span /><span /><span /></main>
          </motion.div>
          <motion.div className="canvas-frame frame-prompt" style={{ rotate: frameB }}>
            <strong>Prompt</strong>
            <p>{release.introduction.slice(0, 42)}</p>
          </motion.div>
          <motion.div className="canvas-frame frame-media" style={{ rotate: frameA }}>
            <i /><i /><i /><i />
          </motion.div>
          <div className="canvas-handles"><span /><span /><span /><span /></div>
        </motion.div>

        <motion.div className="canvas-copy" style={{ y: copyY }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={10} /></h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}
