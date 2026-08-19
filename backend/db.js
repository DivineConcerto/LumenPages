import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'journal.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;\nPRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_name TEXT NOT NULL,
    site_tagline TEXT NOT NULL,
    site_description TEXT NOT NULL,
    hero_badge TEXT NOT NULL,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    about_title TEXT NOT NULL,
    about_body TEXT NOT NULL,
    game_badge TEXT NOT NULL DEFAULT 'Interactive project',
    game_title TEXT NOT NULL DEFAULT '我要造导弹',
    game_subtitle TEXT NOT NULL DEFAULT '一个可以直接进入的网页小游戏。',
    game_body TEXT NOT NULL DEFAULT '把它放在主页第二屏，像产品发布页一样介绍清楚：它是什么、为什么值得点进去，以及玩家进入之后会发生什么。',
    game_cta_label TEXT NOT NULL DEFAULT '进入游戏',
    footer_note TEXT NOT NULL,
    email TEXT,
    location TEXT,
    x_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    nav_items TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL DEFAULT '',
    cover_image TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    reading_time INTEGER NOT NULL DEFAULT 3,
    published INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS release_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eyebrow TEXT NOT NULL,
    title TEXT NOT NULL,
    introduction TEXT NOT NULL,
    target_url TEXT NOT NULL,
    cta_label TEXT NOT NULL DEFAULT '打开',
    visual_style TEXT NOT NULL DEFAULT 'orbit',
    published INTEGER NOT NULL DEFAULT 1,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((item) => item.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

ensureColumn('site_settings', 'game_badge', "TEXT NOT NULL DEFAULT 'Interactive project'");
ensureColumn('site_settings', 'game_title', "TEXT NOT NULL DEFAULT '我要造导弹'");
ensureColumn('site_settings', 'game_subtitle', "TEXT NOT NULL DEFAULT '一个可以直接进入的网页小游戏。'");
ensureColumn('site_settings', 'game_body', "TEXT NOT NULL DEFAULT '把它放在主页第二屏，像产品发布页一样介绍清楚：它是什么、为什么值得点进去，以及玩家进入之后会发生什么。'");
ensureColumn('site_settings', 'game_cta_label', "TEXT NOT NULL DEFAULT '进入游戏'");
ensureColumn('site_settings', 'nav_items', "TEXT NOT NULL DEFAULT '[]'");
ensureColumn('posts', 'content_html', "TEXT NOT NULL DEFAULT ''");

const nowIso = () => new Date().toISOString();

const defaultSite = {
  site_name: 'Aster Archive',
  site_tagline: 'Personal homepage · projects · releases',
  site_description: '一个简洁、高级、可持续更新的个人主页。首页介绍个人，第二屏展示游戏，后续页面按发布时间展示最新内容。',
  hero_badge: '个人主页',
  hero_title: '把项目、判断和长期关注放在一个自己的地方。',
  hero_subtitle: '这里保留一段简短介绍：你是谁，正在做什么，关心什么，以及希望别人如何找到你。所有文字都可以在后台直接修改。',
  about_title: '关于我',
  about_body: '这里可以写你的身份、正在推进的项目、长期关注的问题，以及你希望别人如何联系你。',
  game_badge: 'Interactive project',
  game_title: '我要造导弹',
  game_subtitle: '一局轻量、紧张、带一点荒诞感的网页策略游戏。',
  game_body: '它不是主页的附属品，而是一个独立产品入口。你可以把朋友拉进同一局，围绕身份、投票、任务和信息差做判断。',
  game_cta_label: '进入游戏',
  footer_note: '首页、游戏页和发布页内容都可以在后台维护。',
  email: 'hello@example.com',
  location: 'Taipei / Remote',
  x_url: '',
  github_url: '',
  linkedin_url: '',
  nav_items: JSON.stringify(Array.from({ length: 10 }, (_, index) => ({
    label: `测试${index + 1}`,
    href: index === 0 ? '#intro' : index === 1 ? '#latest' : '#'
  }))),
  updated_at: nowIso()
};

function siteSettingsParams(site) {
  return [
    site.site_name,
    site.site_tagline,
    site.site_description,
    site.hero_badge,
    site.hero_title,
    site.hero_subtitle,
    site.about_title,
    site.about_body,
    site.game_badge,
    site.game_title,
    site.game_subtitle,
    site.game_body,
    site.game_cta_label,
    site.footer_note,
    site.email,
    site.location,
    site.x_url,
    site.github_url,
    site.linkedin_url,
    site.nav_items,
    site.updated_at
  ];
}

const defaultArticles = [
  {
    title: '复杂世界里，个人主页为什么又开始变得重要',
    excerpt: '当所有平台都在催你更快，个人主页反而成了一种慢速反击。',
    content: `# 复杂世界里，个人主页为什么又开始变得重要

很多平台本质上都在做一件事：把人切成适合分发的碎片。

你写一句话，它希望你再短一点。你发一篇长文，它希望你先做个摘要，再做个封面，再给一个更适合被算法误解的标题。最后你会发现，自己像是在给一台饥饿的投喂机器切菜。

个人主页的逻辑完全不同。

它没有平台那种“来都来了，顺手再刷十分钟”的野心。它更像一个私人书房，门口没有喇叭，里面也没有“猜你喜欢”的小贩。你写东西的时候，不用为了流量拐弯，读者进来之后，也终于能完整地读一个人。

## 这类网站真正值钱的地方

第一，它把表达重新交还给作者。  
第二，它让文章按作者的秩序排队，不按平台的情绪排队。  
第三，它是一种公开的、可长期维护的个人资产。

说得朴素一点，社交平台像租来的铺面，今天热闹，明天可能改规则。个人主页像自己的房子，难免要自己擦玻璃，但风格归你，墙上挂什么也归你。

## 为什么现在更适合做

因为大家已经被平台训练得有点疲惫了。

短内容当然有用，可人脑也不是永动机。信息太碎，判断就会变成零售业。很多人开始重新想要那种更完整、更连贯、更带人格的内容。于是个人主页又有了位置。

这不是怀旧，这是需求反弹。  
人被切太碎了，就会想重新长回来。`,
    featured: 1,
    published: 1
  },
  {
    title: '好设计不是装饰，它是对用户时间的尊重',
    excerpt: '高级感从来不是多堆几层玻璃拟态，而是把每一步都打磨到毫不费劲。',
    content: `# 好设计不是装饰，它是对用户时间的尊重

很多网页的“高级感”其实很像婚庆舞台，灯很多，纱很多，风一吹全在晃。第一眼确实热闹，第二眼开始累。

真正耐看的设计，有点像很会做事的人。你跟它接触一会儿，几乎感觉不到它在努力，可每一步都顺手。

## 所谓高级感，常常来自三件事

### 1. 节制
颜色少一点，元素少一点，决定就更稳一点。  
不是做减法表演，是让真正重要的东西有呼吸空间。

### 2. 节奏
页面滚动的时候，信息应该像乐句，不该像仓库倒货。  
哪里该停，哪里该轻轻推进，哪里该留白，这些决定了浏览时的身体感受。

### 3. 质地
质地不是贴材质包。  
它来自边界、阴影、字号、动效速度、过渡曲线这些微小的地方。说白了，就是把“差不多就行”一寸一寸赶出去。

## 所以设计到底在解决什么

设计在解决摩擦。

表面上它在排版，在选字，在做动画。实际是在替用户清理路径，像提前把桌上杂物都收好，让人一坐下就能开始工作。

高级感，本质上是效率和审美在同一个地方握手。`,
    featured: 0,
    published: 1
  },
  {
    title: '长期内容，应该像慢慢建一个坐标系',
    excerpt: '一篇篇内容不只是观点，它们会慢慢暴露一个人的方法、偏好和判断结构。',
    content: `# 长期内容，应该像慢慢建一个坐标系

很多人以为内容是在输出观点。  
其实更深一层，它是在暴露自己的思维结构。

你反复写同类问题，时间一长，读者就会看见你怎么定义问题，怎么切分因果，怎么分辨主次，怎么判断轻重。这些东西比结论更重要。

## 好的个人主页，不只追求“这一篇”

它会慢慢积累出一种轨道感。

今天写技术，明天写商业，后天写日常，只要方法稳定，读者会发现这些文章之间有暗线。那条暗线，最后会长成一个人的坐标系。

## 所以后台为什么重要

因为长期内容不是“发出去就完事”。  
它需要维护，需要重写，需要下线，需要重新排序，需要把过时观点关进档案室。

管理员后台干的就是这个活。  
表面看是在增删改查，实质上是在帮作者给自己的思想修档案、建书架、贴索引。一个人长期更新下来，后台就像控制台，没有它，前台再漂亮也容易沦为样板间。`,
    featured: 0,
    published: 0
  }
];

function stripMarkdown(input = '') {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(input = '') {
  return String(input)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function autoExcerpt(content) {
  const plain = stripMarkdown(stripHtml(content));
  if (!plain) return '这是一篇尚未填写摘要的文章。';
  return plain.length > 120 ? `${plain.slice(0, 120)}…` : plain;
}

function estimateReadingTime(content) {
  const plain = stripMarkdown(stripHtml(content)).replace(/\s/g, '');
  return Math.max(3, Math.ceil(plain.length / 350));
}

function toSlug(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function ensureUniqueSlug(baseSlug, excludeId = null) {
  const base = baseSlug || `article-${Date.now()}`;
  let slug = base;
  let index = 2;

  while (true) {
    const row = excludeId
      ? db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(slug, excludeId)
      : db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);

    if (!row) return slug;
    slug = `${base}-${index}`;
    index += 1;
  }
}

function rowToPost(row) {
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    published: Boolean(row.published),
    featured: Boolean(row.featured)
  };
}

function normalizeNavItems(input) {
  const rawItems = (() => {
    if (Array.isArray(input)) return input;
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return input
          .split('\n')
          .map((line) => {
            const [label, href] = line.split('|');
            return { label, href };
          });
      }
    }
    return [];
  })();

  const items = rawItems
    .map((item) => ({
      label: String(item?.label || '').trim(),
      href: String(item?.href || '#').trim() || '#'
    }))
    .filter((item) => item.label)
    .slice(0, 12);

  if (items.length) return items;
  return Array.from({ length: 10 }, (_, index) => ({
    label: `测试${index + 1}`,
    href: index === 0 ? '#intro' : index === 1 ? '#latest' : '#'
  }));
}

function rowToSite(row) {
  if (!row) return null;
  return {
    ...row,
    nav_items: normalizeNavItems(row.nav_items)
  };
}


const releaseStyles = new Set([
  'orbit', 'ribbon', 'stack', 'console',
  'frontier', 'agent', 'launch', 'command', 'pulse', 'canvas', 'vault'
]);

const releaseStyleAliases = new Map([
  ['mosaic', 'orbit'],
  ['prism', 'frontier'],
  ['aurora', 'pulse'],
  ['editorial', 'vault'],
  ['cinema', 'launch'],
  ['atlas', 'pulse'],
  ['lattice', 'command'],
  ['nebula', 'pulse'],
  ['glass', 'canvas'],
  ['timeline', 'vault'],
  ['spotlight', 'launch'],
  ['monolith', 'vault'],
  ['garden', 'canvas'],
  ['blueprint', 'agent'],
  ['liquid', 'canvas'],
  ['constellation', 'pulse'],
  ['gallery', 'canvas'],
  ['horizon', 'frontier'],
  ['capsule', 'command'],
  ['origami', 'canvas'],
  ['equation', 'vault']
]);

function normalizeReleaseStyle(value = 'orbit') {
  const style = String(value || '').trim();
  const normalized = releaseStyleAliases.get(style) || style;
  return releaseStyles.has(normalized) ? normalized : 'orbit';
}

function valueFromPayload(payload, existing, key, fallback = '') {
  return Object.prototype.hasOwnProperty.call(payload, key)
    ? payload[key]
    : (existing?.[key] ?? fallback);
}

function rowToRelease(row) {
  if (!row) return null;
  return {
    ...row,
    visual_style: normalizeReleaseStyle(row.visual_style),
    published: Boolean(row.published)
  };
}

function seedDatabase() {
  const siteRow = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();
  if (!siteRow) {
    db.prepare(`
      INSERT INTO site_settings (
        id, site_name, site_tagline, site_description, hero_badge, hero_title, hero_subtitle,
        about_title, about_body, game_badge, game_title, game_subtitle, game_body, game_cta_label,
        footer_note, email, location, x_url, github_url, linkedin_url, nav_items, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(...siteSettingsParams(defaultSite));
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'change-me-now');
    if (!password) {
      throw new Error('ADMIN_PASSWORD is required when NODE_ENV=production.');
    }
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)')
      .run(username, passwordHash, nowIso());

    console.log(`\n管理员账号已初始化: ${username}`);
    console.log('初始密码来自环境变量 ADMIN_PASSWORD，或本地默认值。请尽快在后台修改，不要把密码写进仓库。\n');
  }

  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  if (postCount === 0) {
    const insert = db.prepare(`
      INSERT INTO posts (
        title, slug, excerpt, content, content_html, cover_image, tags, reading_time, published,
        featured, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const article of defaultArticles) {
      const createdAt = nowIso();
      insert.run(
        article.title,
        ensureUniqueSlug(toSlug(article.title)),
        article.excerpt || autoExcerpt(article.content),
        article.content,
        '',
        '',
        JSON.stringify(['观察', '设计', '项目'].slice(0, article.featured ? 3 : 2)),
        estimateReadingTime(article.content),
        article.published ? 1 : 0,
        article.featured ? 1 : 0,
        article.published ? createdAt : null,
        createdAt,
        createdAt
      );
    }
  }

  const releaseCount = db.prepare('SELECT COUNT(*) as count FROM release_items').get().count;
  if (releaseCount === 0) {
    const insertRelease = db.prepare(`
      INSERT INTO release_items (
        eyebrow, title, introduction, target_url, cta_label, visual_style,
        published, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const createdAt = nowIso();

    insertRelease.run(
      defaultSite.game_badge,
      defaultSite.game_title,
      `${defaultSite.game_subtitle} ${defaultSite.game_body}`,
      '/game/',
      defaultSite.game_cta_label,
      'orbit',
      1,
      createdAt,
      createdAt,
      createdAt
    );

    const publishedPosts = db.prepare(`
      SELECT title, slug, excerpt, published_at, updated_at
      FROM posts
      WHERE published = 1
      ORDER BY datetime(COALESCE(published_at, updated_at)) DESC, id DESC
    `).all();
    const styles = ['ribbon', 'stack', 'console', 'frontier', 'agent', 'launch', 'command'];

    publishedPosts.forEach((post, index) => {
      const publishedAt = post.published_at || post.updated_at || createdAt;
      insertRelease.run(
        `最新发布 ${String(index + 1).padStart(2, '0')}`,
        post.title,
        post.excerpt,
        `/release/${post.slug}`,
        '阅读全文',
        styles[index % styles.length],
        1,
        publishedAt,
        publishedAt,
        publishedAt
      );
    });
  }
}

seedDatabase();

export function getSiteSettings() {
  return rowToSite(db.prepare('SELECT * FROM site_settings WHERE id = 1').get());
}

export function updateSiteSettings(payload) {
  const next = {
    ...getSiteSettings(),
    ...payload,
    nav_items: JSON.stringify(normalizeNavItems(payload.nav_items)),
    updated_at: nowIso()
  };

  db.prepare(`
    UPDATE site_settings SET
      site_name = ?,
      site_tagline = ?,
      site_description = ?,
      hero_badge = ?,
      hero_title = ?,
      hero_subtitle = ?,
      about_title = ?,
      about_body = ?,
      game_badge = ?,
      game_title = ?,
      game_subtitle = ?,
      game_body = ?,
      game_cta_label = ?,
      footer_note = ?,
      email = ?,
      location = ?,
      x_url = ?,
      github_url = ?,
      linkedin_url = ?,
      nav_items = ?,
      updated_at = ?
    WHERE id = 1
  `).run(...siteSettingsParams(next));

  return getSiteSettings();
}

export function listPublishedPosts() {
  const rows = db.prepare(`
    SELECT * FROM posts
    WHERE published = 1
    ORDER BY datetime(COALESCE(published_at, updated_at)) DESC, id DESC
  `).all();

  return rows.map(rowToPost);
}

export function getPublishedPostBySlug(slug) {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').get(slug);
  return rowToPost(row);
}

export function listAllPosts() {
  const rows = db.prepare(`
    SELECT * FROM posts
    ORDER BY datetime(updated_at) DESC
  `).all();

  return rows.map(rowToPost);
}

export function listPublishedReleases() {
  const rows = db.prepare(`
    SELECT * FROM release_items
    WHERE published = 1
    ORDER BY datetime(COALESCE(published_at, updated_at)) DESC, id DESC
  `).all();

  return rows.map(rowToRelease);
}

export function listAllReleases() {
  const rows = db.prepare(`
    SELECT * FROM release_items
    ORDER BY datetime(updated_at) DESC, id DESC
  `).all();

  return rows.map(rowToRelease);
}

function normalizeReleaseInput(payload, existing = null) {
  const title = String(valueFromPayload(payload, existing, 'title')).trim();
  if (!title) {
    throw new Error('发布项标题不能为空。');
  }

  const introduction = String(valueFromPayload(payload, existing, 'introduction')).trim();
  if (!introduction) {
    throw new Error('发布项介绍不能为空。');
  }

  const targetUrl = String(valueFromPayload(payload, existing, 'target_url')).trim();
  if (!targetUrl) {
    throw new Error('跳转 URL 不能为空。');
  }

  const style = normalizeReleaseStyle(valueFromPayload(payload, existing, 'visual_style', 'orbit'));
  const published = payload.published === undefined
    ? (existing ? Boolean(existing.published) : true)
    : Boolean(payload.published);
  const createdAt = existing?.created_at || nowIso();
  const updatedAt = nowIso();
  const publishedAt = published
    ? (existing?.published_at || payload.published_at || nowIso())
    : null;

  return {
    eyebrow: String(valueFromPayload(payload, existing, 'eyebrow', 'Release')).trim() || 'Release',
    title,
    introduction,
    target_url: targetUrl,
    cta_label: String(valueFromPayload(payload, existing, 'cta_label', '打开')).trim() || '打开',
    visual_style: style,
    published: published ? 1 : 0,
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function releaseInsertParams(release) {
  return [
    release.eyebrow,
    release.title,
    release.introduction,
    release.target_url,
    release.cta_label,
    release.visual_style,
    release.published,
    release.published_at,
    release.created_at,
    release.updated_at
  ];
}

function releaseUpdateParams(id, release) {
  return [
    release.eyebrow,
    release.title,
    release.introduction,
    release.target_url,
    release.cta_label,
    release.visual_style,
    release.published,
    release.published_at,
    release.updated_at,
    Number(id)
  ];
}

export function createRelease(payload) {
  const normalized = normalizeReleaseInput(payload);
  const statement = db.prepare(`
    INSERT INTO release_items (
      eyebrow, title, introduction, target_url, cta_label, visual_style,
      published, published_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const result = statement.run(...releaseInsertParams(normalized));
  return rowToRelease(db.prepare('SELECT * FROM release_items WHERE id = ?').get(result.lastInsertRowid));
}

export function updateRelease(id, payload) {
  const existing = rowToRelease(db.prepare('SELECT * FROM release_items WHERE id = ?').get(id));
  if (!existing) {
    throw new Error('发布项不存在。');
  }

  const normalized = normalizeReleaseInput(payload, existing);

  db.prepare(`
    UPDATE release_items SET
      eyebrow = ?,
      title = ?,
      introduction = ?,
      target_url = ?,
      cta_label = ?,
      visual_style = ?,
      published = ?,
      published_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(...releaseUpdateParams(id, normalized));

  return rowToRelease(db.prepare('SELECT * FROM release_items WHERE id = ?').get(id));
}

export function deleteRelease(id) {
  const result = db.prepare('DELETE FROM release_items WHERE id = ?').run(id);
  return result.changes > 0;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
}

function normalizePostInput(payload, existing = null) {
  const title = String(payload.title || existing?.title || '').trim();
  if (!title) {
    throw new Error('文章标题不能为空。');
  }

  const contentHtml = String(payload.content_html ?? existing?.content_html ?? '').trim();
  const content = String(payload.content || existing?.content || stripHtml(contentHtml)).trim();
  if (!content) {
    throw new Error('文章正文不能为空。');
  }

  const slugSource = String(payload.slug || title);
  const slug = ensureUniqueSlug(toSlug(slugSource), existing?.id ?? null);
  const tags = normalizeTags(payload.tags ?? existing?.tags ?? []);
  const published = payload.published === undefined ? Boolean(existing?.published) : Boolean(payload.published);
  const featured = payload.featured === undefined ? Boolean(existing?.featured) : Boolean(payload.featured);
  const contentForMeta = contentHtml || content;
  const excerpt = String(payload.excerpt || '').trim() || autoExcerpt(contentForMeta);
  const readingTime = payload.reading_time
    ? Math.max(1, Number(payload.reading_time))
    : estimateReadingTime(contentForMeta);
  const coverImage = String(payload.cover_image || existing?.cover_image || '').trim();
  const createdAt = existing?.created_at || nowIso();
  const updatedAt = nowIso();
  const publishedAt = published
    ? (existing?.published_at || payload.published_at || nowIso())
    : null;

  return {
    title,
    slug,
    excerpt,
    content,
    content_html: contentHtml,
    cover_image: coverImage,
    tags: JSON.stringify(tags),
    reading_time: readingTime,
    published: published ? 1 : 0,
    featured: featured ? 1 : 0,
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function postInsertParams(post) {
  return [
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.content_html,
    post.cover_image,
    post.tags,
    post.reading_time,
    post.published,
    post.featured,
    post.published_at,
    post.created_at,
    post.updated_at
  ];
}

function postUpdateParams(id, post) {
  return [
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.content_html,
    post.cover_image,
    post.tags,
    post.reading_time,
    post.published,
    post.featured,
    post.published_at,
    post.updated_at,
    Number(id)
  ];
}

export function createPost(payload) {
  const normalized = normalizePostInput(payload);
  const statement = db.prepare(`
    INSERT INTO posts (
      title, slug, excerpt, content, content_html, cover_image, tags, reading_time,
      published, featured, published_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const result = statement.run(...postInsertParams(normalized));
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  return rowToPost(row);
}

export function updatePost(id, payload) {
  const existing = rowToPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
  if (!existing) {
    throw new Error('文章不存在。');
  }

  const normalized = normalizePostInput(payload, existing);

  db.prepare(`
    UPDATE posts SET
      title = ?,
      slug = ?,
      excerpt = ?,
      content = ?,
      content_html = ?,
      cover_image = ?,
      tags = ?,
      reading_time = ?,
      published = ?,
      featured = ?,
      published_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(...postUpdateParams(id, normalized));

  return rowToPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
}

export function deletePost(id) {
  const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function verifyAdmin(username, password) {
  const row = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!row) return null;
  const isValid = bcrypt.compareSync(password, row.password_hash);
  if (!isValid) return null;
  return { id: row.id, username: row.username };
}

export function changePassword(adminId, currentPassword, newPassword) {
  const row = db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
  if (!row) {
    throw new Error('管理员不存在。');
  }

  const matched = bcrypt.compareSync(currentPassword, row.password_hash);
  if (!matched) {
    throw new Error('当前密码不正确。');
  }

  const nextHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(nextHash, adminId);

  return true;
}
