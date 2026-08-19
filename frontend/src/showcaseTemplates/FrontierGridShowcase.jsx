import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

const cells = [
  'hot', 'hot', 'deep', 'hot', 'sun', 'deep', 'hot', 'hot',
  'hot', 'sun', 'deep', 'deep', 'hot', 'ember', 'hot', 'sun',
  'deep', 'hot', 'hot', 'sun', 'deep', 'hot', 'deep', 'hot'
];

function FrontierCell({ tone, cell, progress }) {
  const y = useTransform(progress, [0, 1], [cell % 4 === 0 ? 42 : -18, cell % 3 === 0 ? -44 : 22]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.92, cell % 5 === 0 ? 1.18 : 1, 0.96]);

  return <motion.span className={`cell-${tone}`} style={{ y, scale }} />;
}

export default function FrontierGridShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const headlineY = useTransform(progress, [0, 0.35, 1], [-90, 0, 64]);
  const mosaicY = useTransform(progress, [0, 0.48, 1], [130, 0, -120]);
  const sideY = useTransform(progress, [0, 0.48, 1], [80, -20, -90]);
  const cubeX = useTransform(progress, [0, 1], ['-8%', '18%']);
  const cubeRotate = useTransform(progress, [0, 1], [-4, 44]);
  const scan = useTransform(progress, [0.08, 0.52, 1], ['0%', '62%', '100%']);

  return (
    <section className="showcase-stage tech-frontier" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '230svh')}>
      <div className="showcase-sticky frontier-sticky">
        <motion.div className="frontier-headline" style={{ y: headlineY }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={9} /></h2>
        </motion.div>

        <motion.div className="frontier-mosaic" style={{ y: mosaicY }}>
          <motion.i className="frontier-scanline" style={{ left: scan }} />
          {cells.map((tone, cell) => (
            <FrontierCell
              key={cell}
              tone={tone}
              cell={cell}
              progress={progress}
            />
          ))}
          <motion.b className="frontier-cube" style={{ x: cubeX, rotate: cubeRotate }} />
          <strong>IN YOUR HANDS</strong>
        </motion.div>

        <motion.aside className="frontier-brief" style={{ y: sideY }}>
          <div className="frontier-glyphs"><span>▣</span><span>◈</span><span>◉</span></div>
          <p>{release.introduction}</p>
          <div className="frontier-news">
            <small>FEATURED RELEASE</small>
            <a href={release.target_url}>{release.cta_label || '打开'}<span>›</span></a>
          </div>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.aside>
      </div>
    </section>
  );
}
