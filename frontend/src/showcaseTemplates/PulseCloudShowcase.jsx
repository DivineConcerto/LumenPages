import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

const nodes = Array.from({ length: 14 }, (_, node) => node);

export default function PulseCloudShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const ring = useTransform(progress, [0, 1], [-28, 38]);
  const packet = useTransform(progress, [0, 1], ['4%', '82%']);
  const mapY = useTransform(progress, [0, 0.5, 1], [130, 0, -120]);
  const copyY = useTransform(progress, [0, 0.44, 1], [80, 0, -90]);
  const stat = useTransform(progress, [0.1, 0.52, 1], [0.65, 1, 0.8]);

  return (
    <section className="showcase-stage tech-pulse" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '224svh')}>
      <div className="showcase-sticky pulse-sticky">
        <motion.div className="pulse-copy" style={{ y: copyY }}>
          <Eyebrow tone="dark">{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={10} /></h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url} tone="light">{release.cta_label || '打开'}</CtaLink>
        </motion.div>

        <motion.div className="pulse-map" style={{ y: mapY, rotate: ring }}>
          <span className="pulse-ring ring-one" />
          <span className="pulse-ring ring-two" />
          <span className="pulse-ring ring-three" />
          {nodes.map((node) => <i key={node} className={`pulse-node pulse-node-${node}`} />)}
          <motion.b className="pulse-packet" style={{ left: packet }} />
        </motion.div>

        <motion.div className="pulse-stat-strip" style={{ scaleX: stat }}>
          <span><b>14</b> nodes</span>
          <span><b>3</b> regions</span>
          <span><b>live</b> signal</span>
        </motion.div>
      </div>
    </section>
  );
}
