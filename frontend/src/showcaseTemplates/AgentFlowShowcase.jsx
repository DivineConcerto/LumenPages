import { useTransform } from 'framer-motion';
import { CtaLink, Eyebrow, TitleLines, motion, releaseAnchor, useStageScroll, vars } from './shared.jsx';

const steps = ['Plan', 'Route', 'Execute', 'Review'];

function AgentFlowStep({ step, stepIndex, progress }) {
  const y = useTransform(progress, [0, 1], [stepIndex * 18, stepIndex * -18]);

  return <motion.span style={{ y }}>{step}</motion.span>;
}

export default function AgentFlowShowcase({ release, index, template }) {
  const [ref, progress] = useStageScroll();
  const rail = useTransform(progress, [0.05, 0.55, 1], [0.08, 1, 0.82]);
  const leftY = useTransform(progress, [0, 0.48, 1], [110, 0, -100]);
  const boardY = useTransform(progress, [0, 0.45, 1], [150, -20, -130]);
  const previewX = useTransform(progress, [0, 0.5, 1], ['16%', '0%', '-7%']);
  const glow = useTransform(progress, [0, 0.55, 1], [0.2, 0.9, 0.34]);

  return (
    <section className="showcase-stage tech-agent" ref={ref} id={releaseAnchor(release, index)} style={vars(template, '226svh')}>
      <div className="showcase-sticky agent-sticky">
        <motion.div className="agent-copy" style={{ y: leftY }}>
          <Eyebrow tone="dark">{release.eyebrow}</Eyebrow>
          <h2><TitleLines title={release.title} maxLength={10} /></h2>
          <p>{release.introduction}</p>
          <CtaLink href={release.target_url} tone="light">{release.cta_label || '打开'}</CtaLink>
        </motion.div>

        <div className="agent-flow-rail">
          <motion.i style={{ scaleY: rail }} />
          {steps.map((step, stepIndex) => (
            <AgentFlowStep
              key={step}
              step={step}
              stepIndex={stepIndex}
              progress={progress}
            />
          ))}
        </div>

        <motion.div className="agent-task-board" style={{ y: boardY }}>
          <div className="agent-board-head"><b>agent.session</b><small>live</small></div>
          <div className="agent-task task-a"><span>01</span><strong>Collect context</strong></div>
          <div className="agent-task task-b"><span>02</span><strong>Run validation</strong></div>
          <div className="agent-task task-c"><span>03</span><strong>Ship release</strong></div>
        </motion.div>

        <motion.div className="agent-preview" style={{ x: previewX }}>
          <motion.div className="agent-preview-glow" style={{ opacity: glow }} />
          <div className="agent-window">
            <header><span /><span /><span /><b>control plane</b></header>
            <main>
              <div className="agent-chart"><i /><i /><i /><i /></div>
              <div className="agent-log"><span>route.complete</span><span>handoff.ready</span><span>release.open</span></div>
            </main>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
