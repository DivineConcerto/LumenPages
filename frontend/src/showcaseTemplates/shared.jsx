import { useMemo, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const productPalettes = [
  ['#e13721', '#f08125', '#f4c84c', '#76b78a', '#67a7dc'],
  ['#111111', '#e9e1cf', '#c6d7e5', '#f2b84b', '#e0523d'],
  ['#273a2d', '#f2efe5', '#8fb996', '#e8bc62', '#d85c3f'],
  ['#1e2f4d', '#f6f1df', '#76a7c8', '#f18f3b', '#c3382f'],
  ['#070707', '#f5f3ed', '#d7472f', '#f6cd5f', '#8db7d8']
];

const semanticTitleBreaks = ['为什么', '放在', '应该', '以及', '如何', '正在', '长期', '世界', '不是', '它是'];

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

  const spaceBreaks = [...text.matchAll(/\s+/g)]
    .map((match) => match.index + match[0].length)
    .filter((index) => index >= 3 && index <= maxLength);

  const target = Math.min(maxLength, Math.ceil(text.length / 2));
  const bestBreak = [...punctuationBreaks, ...spaceBreaks]
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

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

export function normalizeTargetUrl(url = '') {
  const value = String(url).trim();
  if (!value) return '#';
  if (value.startsWith('/') || value.startsWith('#')) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function useStageScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  return [ref, scrollYProgress];
}

export function Eyebrow({ children, tone = 'light' }) {
  return (
    <span className={`stage-eyebrow stage-eyebrow-${tone}`}>
      <Sparkles size={16} />
      {children}
    </span>
  );
}

export function CtaLink({ href, children, tone = 'dark' }) {
  return (
    <a className={`stage-cta stage-cta-${tone}`} href={normalizeTargetUrl(href)}>
      {children}
      <ArrowRight size={18} />
    </a>
  );
}

export function TitleLines({ title, maxLength = 12 }) {
  const lines = useMemo(() => splitTitle(title, maxLength), [title, maxLength]);
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>{line}</span>
      ))}
    </>
  );
}

export function releaseAnchor(release, index) {
  return index === 0 ? 'latest' : `release-${release.id}`;
}

export function vars(template, height) {
  return {
    '--showcase-accent': template.accent,
    '--showcase-accent-2': template.accent2,
    '--showcase-bg': template.bg,
    '--showcase-ink': template.ink,
    '--showcase-height': height || template.stageHeight
  };
}

export { motion };
