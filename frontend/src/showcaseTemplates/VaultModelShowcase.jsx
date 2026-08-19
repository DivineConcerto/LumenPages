import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

export default function VaultModelShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const ledgerY = useTransform(progress, [0, 0.48, 1], [130, 0, -100]);
  const slabX = useTransform(progress, [0, 1], ['12%', '-6%']);
  const cardsY = useTransform(progress, [0, 1], [90, -90]);
  const rule = useTransform(progress, [0.1, 0.5, 1], [0.12, 1, 0.7]);
  const copyY = useTransform(progress, [0, 0.44, 1], [70, 0, -80]);

  return (
    <section className="showcase-stage tech-vault" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '214svh')}>
      <div className="showcase-sticky vault-sticky">
        <motion.div className="vault-slab" style={{ x: slabX }}>
          <span>MODEL</span><span>RISK</span><span>RELEASE</span>
        </motion.div>

        <motion.div className="vault-copy" style={{ y: copyY }}>
          <Eyebrow>{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={10} /></h2>
          <motion.i className="vault-rule" style={{ scaleX: rule }} />
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url}>{release.cta_label || '打开'}</CtaLink>
        </motion.div>

        <motion.div className="vault-ledger" style={{ y: ledgerY }}>
          <header><b>evaluation ledger</b><small>{String(index + 1).padStart(2, '0')}</small></header>
          <div><span>Capability</span><strong>frontier</strong></div>
          <div><span>Review</span><strong>passed</strong></div>
          <div><span>Access</span><strong>controlled</strong></div>
        </motion.div>

        <motion.div className="vault-model-cards" style={{ y: cardsY }}>
          <section><span>Opus</span><b>72</b></section>
          <section><span>Sonnet</span><b>94</b></section>
          <section><span>Haiku</span><b>61</b></section>
        </motion.div>
      </div>
    </section>
  );
}
