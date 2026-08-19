import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

const commands = ['Open release', 'Inspect target', 'Generate notes', 'Publish'];

export default function CommandWorkbenchShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const paletteY = useTransform(progress, [0, 0.48, 1], [110, -10, -120]);
  const keysY = useTransform(progress, [0, 1], [80, -100]);
  const previewY = useTransform(progress, [0, 0.5, 1], [180, 0, -70]);
  const cursorX = useTransform(progress, [0.12, 0.5, 1], ['12%', '54%', '76%']);
  const copyX = useTransform(progress, [0, 0.42, 1], ['-7%', '0%', '5%']);

  return (
    <section className="showcase-stage tech-command" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '220svh')}>
      <div className="showcase-sticky command-sticky">
        <motion.div className="command-copy" style={{ x: copyX }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={11} /></h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>

        <motion.div className="command-palette" style={{ y: paletteY }}>
          <div className="command-search"><span>⌘K</span><strong>{release.cta_label || '打开'} {release.title}</strong><motion.i style={{ left: cursorX }} /></div>
          {commands.map((command, commandIndex) => (
            <div className={`command-row row-${commandIndex}`} key={command}>
              <span>{commandIndex + 1}</span>
              <strong>{command}</strong>
              <small>{commandIndex === 3 ? 'ready' : 'queued'}</small>
            </div>
          ))}
        </motion.div>

        <motion.div className="command-keyboard" style={{ y: keysY }}>
          {Array.from({ length: 36 }, (_, key) => <i key={key}>{key % 9 === 0 ? '⌘' : key % 7 === 0 ? '↵' : ''}</i>)}
        </motion.div>

        <motion.div className="command-preview" style={{ y: previewY }}>
          <header><span /><span /><span /></header>
          <main>
            <b>{release.eyebrow}</b>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <p>{release.target_url}</p>
          </main>
        </motion.div>
      </div>
    </section>
  );
}
