import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

export default function LaunchStackShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const stackY = useTransform(progress, [0, 0.48, 1], [160, 0, -150]);
  const stackRotate = useTransform(progress, [0, 1], [-10, 8]);
  const light = useTransform(progress, [0.08, 0.52, 1], [0.2, 1, 0.42]);
  const codeX = useTransform(progress, [0, 1], ['-18%', '10%']);
  const copyY = useTransform(progress, [0, 0.42, 1], [90, 0, -110]);

  return (
    <section className="showcase-stage tech-launch" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '232svh')}>
      <div className="showcase-sticky launch-sticky">
        <motion.div className="launch-copy" style={{ y: copyY }}>
          <Eyebrow tone="dark">{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={10} /></h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url} tone="light">{release.cta_label || '打开'}</CtaLink>
        </motion.div>

        <motion.div className="launch-beam" style={{ opacity: light }} />
        <motion.div className="launch-code-river" style={{ x: codeX }}>
          <span>deploy --target=edge</span>
          <span>build ✓</span>
          <span>cache warm</span>
          <span>latency 18ms</span>
        </motion.div>

        <motion.div className="launch-product-stack" style={{ y: stackY, rotate: stackRotate }}>
          <section className="launch-layer layer-top">
            <header><b>Release health</b><small>{String(index + 1).padStart(2, '0')}</small></header>
            <div className="launch-bars"><i /><i /><i /><i /></div>
          </section>
          <section className="launch-layer layer-mid">
            <span>Edge functions</span><strong>98.8%</strong>
          </section>
          <section className="launch-layer layer-base">
            <span>Preview</span><span>Production</span><span>Observability</span>
          </section>
        </motion.div>
      </div>
    </section>
  );
}
