const RAW_RELEASE_TEMPLATES = [
  {
    value: 'orbit',
    label: '01 · 卷首手记',
    visual: 'orbit',
    mood: 'paper',
    accent: '#b84a35',
    accent2: '#e8b85b',
    ink: '#221f1a',
    bg: '#fbf7ee'
  },
  {
    value: 'ribbon',
    label: '02 · 长句折页',
    visual: 'ribbon',
    mood: 'paper',
    accent: '#4f7f6a',
    accent2: '#d9a441',
    ink: '#1f2722',
    bg: '#f7f8ef'
  },
  {
    value: 'stack',
    label: '03 · 书房书脊',
    visual: 'stack',
    mood: 'paper',
    accent: '#7e5a8f',
    accent2: '#c06c4b',
    ink: '#211c24',
    bg: '#faf6f4'
  },
  {
    value: 'console',
    label: '04 · 批注手稿',
    visual: 'console',
    mood: 'paper',
    accent: '#bf3d2c',
    accent2: '#557aa5',
    ink: '#20242a',
    bg: '#f8f4ec'
  },
  {
    value: 'frontier',
    label: '05 · 艺文展墙',
    visual: 'frontier',
    mood: 'paper',
    accent: '#2f6f91',
    accent2: '#d28445',
    ink: '#1f2422',
    bg: '#f6f2ea'
  },
  {
    value: 'agent',
    label: '06 · 书桌圆谈',
    visual: 'agent',
    mood: 'paper',
    accent: '#936d4f',
    accent2: '#6f8f72',
    ink: '#241f1b',
    bg: '#f7f2e9'
  },
  {
    value: 'launch',
    label: '07 · 新闻封套',
    visual: 'launch',
    mood: 'paper',
    accent: '#2f6f91',
    accent2: '#c25743',
    ink: '#1f2422',
    bg: '#f8f5ee'
  },
  {
    value: 'command',
    label: '08 · 目录抽屉',
    visual: 'command',
    mood: 'paper',
    accent: '#6d6f9a',
    accent2: '#d7a44a',
    ink: '#202124',
    bg: '#f6f5ef'
  },
  {
    value: 'pulse',
    label: '09 · 朗读声纹',
    visual: 'pulse',
    mood: 'paper',
    accent: '#bd6334',
    accent2: '#6c8c94',
    ink: '#24201d',
    bg: '#faf3ea'
  },
  {
    value: 'canvas',
    label: '10 · 灵感拼贴',
    visual: 'canvas',
    mood: 'paper',
    accent: '#8b6a9f',
    accent2: '#d07b58',
    ink: '#211c24',
    bg: '#fbf6ef'
  },
  {
    value: 'vault',
    label: '11 · 木盒档案',
    visual: 'vault',
    mood: 'paper',
    accent: '#6b4f3f',
    accent2: '#c89b55',
    ink: '#241d18',
    bg: '#f5efe4'
  }
];

const RELEASE_TEMPLATE_SCENES = {
  orbit: { layout: 'radial-command', rhythm: 'orbital', stageHeight: '218svh' },
  ribbon: { layout: 'cinetic-ribbons', rhythm: 'lateral-sweep', stageHeight: '190svh' },
  stack: { layout: 'offset-deck', rhythm: 'card-parallax', stageHeight: '214svh' },
  console: { layout: 'terminal-board', rhythm: 'scanline', stageHeight: '196svh' },
  frontier: { layout: 'split-mosaic', rhythm: 'mosaic-morph', stageHeight: '230svh' },
  agent: { layout: 'agent-control', rhythm: 'workflow-advance', stageHeight: '226svh' },
  launch: { layout: 'stacked-infra', rhythm: 'product-stack', stageHeight: '232svh' },
  command: { layout: 'command-workbench', rhythm: 'palette-scan', stageHeight: '220svh' },
  pulse: { layout: 'network-cloud', rhythm: 'signal-pulse', stageHeight: '224svh' },
  canvas: { layout: 'creative-canvas', rhythm: 'frame-spread', stageHeight: '218svh' },
  vault: { layout: 'model-vault', rhythm: 'ledger-rise', stageHeight: '214svh' }
};

export const RELEASE_TEMPLATE_ALIASES = {
  mosaic: 'orbit',
  prism: 'frontier',
  aurora: 'pulse',
  editorial: 'vault',
  cinema: 'launch',
  atlas: 'pulse',
  lattice: 'command',
  nebula: 'pulse',
  glass: 'canvas',
  timeline: 'vault',
  spotlight: 'launch',
  monolith: 'vault',
  garden: 'canvas',
  blueprint: 'agent',
  liquid: 'canvas',
  constellation: 'pulse',
  gallery: 'canvas',
  horizon: 'frontier',
  capsule: 'command',
  origami: 'canvas',
  equation: 'vault'
};

export const RELEASE_TEMPLATES = RAW_RELEASE_TEMPLATES.map((template) => ({
  ...template,
  ...RELEASE_TEMPLATE_SCENES[template.value]
}));

export const RELEASE_TEMPLATE_VALUES = RELEASE_TEMPLATES.map((template) => template.value);

const templateMap = new Map(RELEASE_TEMPLATES.map((template) => [template.value, template]));

export function normalizeReleaseTemplateId(value) {
  const key = String(value || '').trim();
  return RELEASE_TEMPLATE_ALIASES[key] || key;
}

export function getReleaseTemplate(value, fallbackIndex = 0) {
  const normalized = normalizeReleaseTemplateId(value);
  return templateMap.get(normalized) || RELEASE_TEMPLATES[fallbackIndex % RELEASE_TEMPLATES.length];
}
