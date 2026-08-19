import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Sparkles,
  Strikethrough,
  Underline,
  Undo2
} from 'lucide-react';

const fontOptions = [
  { label: '宋体', value: 'SimSun, Songti SC, STSong, serif' },
  { label: '黑体', value: 'SimHei, Heiti SC, sans-serif' },
  { label: '楷体', value: 'KaiTi, Kaiti SC, serif' },
  { label: '苹方', value: 'PingFang SC, Microsoft YaHei, sans-serif' }
];

const sizeOptions = [
  { label: '小号', value: '3' },
  { label: '正文', value: '4' },
  { label: '大号', value: '5' },
  { label: '标题', value: '6' }
];

const PARAGRAPH_INDENT = '　　';

function cleanHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\son[a-z]+='[^']*'/gi, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitIntoBlocks(value = '') {
  return String(value || '')
    .trim()
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function paragraphWithIndent(text) {
  return `${PARAGRAPH_INDENT}${escapeHtml(text)}`;
}

function addParagraphIndent(root) {
  if (!root) return;
  const paragraphs = root.querySelectorAll('p');
  paragraphs.forEach((paragraph) => {
    if (!paragraph.textContent?.trim()) return;
    if (paragraph.innerText.startsWith(PARAGRAPH_INDENT)) return;
    paragraph.insertBefore(document.createTextNode(PARAGRAPH_INDENT), paragraph.firstChild);
  });
}

function normalizeEditorHtml(value = '') {
  const container = document.createElement('div');
  container.innerHTML = cleanHtml(value || '<p><br></p>');
  addParagraphIndent(container);
  return container.innerHTML || '<p><br></p>';
}

function getSelectionParagraph(root, selection) {
  if (!selection?.rangeCount) return null;
  let node = selection.getRangeAt(0).startContainer;
  while (node && node !== root) {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'P') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

export function htmlToPlainText(value = '') {
  const node = document.createElement('div');
  node.innerHTML = cleanHtml(value);
  return node.innerText.replace(/\s+\n/g, '\n');
}

export function markdownishToEditorHtml(value = '') {
  const lines = splitIntoBlocks(value);
  if (!lines.length) return '<p><br></p>';

  return lines
    .map((line) => {
      if (line.startsWith('### ')) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.startsWith('## ')) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith('# ')) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      return `<p>${paragraphWithIndent(line.replace(/\n/g, '<br>'))}</p>`;
    })
    .filter(Boolean)
    .join('');
}

export default function RichTextEditor({ value, onChange, placeholder = '从这里开始写。' }) {
  const editorRef = useRef(null);
  const [font, setFont] = useState(fontOptions[0].value);
  const [size, setSize] = useState('4');
  const [autoIndent, setAutoIndent] = useState(true);
  const [stats, setStats] = useState({ chars: 0, paragraphs: 0 });

  useEffect(() => {
    if (!editorRef.current) return;
    if (document.activeElement === editorRef.current) return;
    editorRef.current.innerHTML = normalizeEditorHtml(value);
    updateStats(editorRef.current.innerHTML);
  }, [value]);

  function updateStats(html = '') {
    const container = document.createElement('div');
    container.innerHTML = cleanHtml(html);
    const blockCount = Array.from(container.querySelectorAll('p, h1, h2, h3, blockquote, li'))
      .filter((node) => node.textContent?.trim()).length;
    const text = htmlToPlainText(html);
    setStats({
      chars: text.replace(/\s/g, '').length,
      paragraphs: blockCount || splitIntoBlocks(text).length
    });
  }

  function emitChange() {
    const html = cleanHtml(editorRef.current?.innerHTML || '');
    updateStats(html);
    onChange?.({
      html,
      text: htmlToPlainText(html)
    });
  }

  function runCommand(command, commandValue = null) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, commandValue);
    if (autoIndent) {
      addParagraphIndent(editorRef.current);
    }
    emitChange();
  }

  function setBlock(tagName) {
    runCommand('formatBlock', tagName);
  }

  function normalizeCurrentContent() {
    if (autoIndent) {
      addParagraphIndent(editorRef.current);
    }
    emitChange();
  }

  function insertHyperlink() {
    const link = window.prompt('请输入链接（留空可清除当前链接）');
    if (link === null) return;
    if (link.trim()) {
      runCommand('createLink', link.trim());
    } else {
      runCommand('unlink');
    }
  }

  function autoFormat() {
    const paragraphs = splitIntoBlocks(htmlToPlainText(editorRef.current?.innerHTML || ''));
    if (!paragraphs.length) {
      editorRef.current.innerHTML = '<p><br></p>';
      return emitChange();
    }

    editorRef.current.innerHTML = paragraphs.map((line) => `<p>${paragraphWithIndent(line.replace(/\n/g, '<br>'))}</p>`).join('');
    normalizeCurrentContent();
  }

  function handleInput(event) {
    const inputType = event?.nativeEvent?.inputType || '';
    if (autoIndent && inputType === 'insertParagraph') {
      window.setTimeout(() => {
        addParagraphIndent(editorRef.current);
        emitChange();
      }, 0);
      return;
    }
    emitChange();
  }

  function handleKeyDown(event) {
    const isMod = event.metaKey || event.ctrlKey;
    if (!isMod || !editorRef.current) return;

    if (event.key === 'b' || event.key === 'B') {
      event.preventDefault();
      runCommand('bold');
      return;
    }
    if (event.key === 'i' || event.key === 'I') {
      event.preventDefault();
      runCommand('italic');
      return;
    }
    if (event.key === 'u' || event.key === 'U') {
      event.preventDefault();
      runCommand('underline');
      return;
    }
    if (event.key === 'k' || event.key === 'K') {
      event.preventDefault();
      insertHyperlink();
      return;
    }
    if (event.key === 'z' || event.key === 'Z') {
      event.preventDefault();
      runCommand('undo');
      return;
    }
    if (event.key === 'y' || event.key === 'Y') {
      event.preventDefault();
      runCommand('redo');
      return;
    }
  }

  function handleBlur() {
    const selection = window.getSelection();
    const currentParagraph = getSelectionParagraph(editorRef.current, selection);
    if (autoIndent && currentParagraph && currentParagraph.textContent?.trim() && !currentParagraph.innerText.startsWith(PARAGRAPH_INDENT)) {
      currentParagraph.insertBefore(document.createTextNode(PARAGRAPH_INDENT), currentParagraph.firstChild);
    }
    normalizeCurrentContent();
  }

  function handlePaste(event) {
    const plainText = event.clipboardData?.getData('text/plain');
    if (!plainText) {
      window.setTimeout(normalizeCurrentContent, 0);
      return;
    }

    event.preventDefault();
    const blocks = splitIntoBlocks(plainText);
    const html = blocks.length
      ? blocks.map((line) => `<p>${autoIndent ? paragraphWithIndent(line) : escapeHtml(line)}</p>`).join('')
      : escapeHtml(plainText);

    document.execCommand('insertHTML', false, html);
    window.setTimeout(normalizeCurrentContent, 0);
  }

  return (
    <div className="rich-editor-shell">
      <div className="rich-editor-topline">
        <div>
          <strong>中文写作</strong>
          <span>{autoIndent ? '宋体 · 段首空两字' : '宋体'}</span>
        </div>
        <div className="rich-editor-stats">
          <span>{stats.chars} 字</span>
          <span>{stats.paragraphs} 段</span>
        </div>
      </div>

      <div className="rich-toolbar" aria-label="富文本编辑工具栏">
        <select
          value={font}
          onChange={(event) => {
            setFont(event.target.value);
            runCommand('fontName', event.target.value);
          }}
          aria-label="字体"
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={size}
          onChange={(event) => {
            setSize(event.target.value);
            runCommand('fontSize', event.target.value);
          }}
          aria-label="字号"
        >
          {sizeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button type="button" onClick={() => runCommand('undo')} title="撤销（Ctrl/Cmd+Z）"><Undo2 size={16} /></button>
        <button type="button" onClick={() => runCommand('redo')} title="重做（Ctrl/Cmd+Y）"><Redo2 size={16} /></button>
        <button type="button" onClick={() => runCommand('bold')} title="加粗（Ctrl/Cmd+B）"><Bold size={16} /></button>
        <button type="button" onClick={() => runCommand('italic')} title="斜体（Ctrl/Cmd+I）"><Italic size={16} /></button>
        <button type="button" onClick={() => runCommand('underline')} title="下划线（Ctrl/Cmd+U）"><Underline size={16} /></button>
        <button type="button" onClick={() => runCommand('strikeThrough')} title="删除线"><Strikethrough size={16} /></button>
        <button type="button" onClick={insertHyperlink} title="插入链接（Ctrl/Cmd+K）"><Link2 size={16} /></button>

        <button type="button" onClick={() => setBlock('h1')} title="一级标题"><Heading1 size={17} /></button>
        <button type="button" onClick={() => setBlock('h2')} title="二级标题"><Heading2 size={17} /></button>
        <button type="button" onClick={() => setBlock('p')} title="正文"><Pilcrow size={16} /></button>

        <button type="button" onClick={() => runCommand('insertUnorderedList')} title="项目列表"><List size={16} /></button>
        <button type="button" onClick={() => runCommand('insertOrderedList')} title="编号列表"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => setBlock('blockquote')} title="引用"><Quote size={16} /></button>
        <button type="button" onClick={() => runCommand('justifyLeft')} title="左对齐"><AlignLeft size={16} /></button>
        <button type="button" onClick={() => runCommand('justifyCenter')} title="居中"><AlignCenter size={16} /></button>
        <button
          type="button"
          className="rich-toolbar-toggle"
          aria-pressed={autoIndent}
          title="段首自动空两个字"
          onClick={() => setAutoIndent((previous) => !previous)}
        >
          自动空两字
        </button>
        <button type="button" onClick={() => runCommand('removeFormat')} title="清除格式"><Eraser size={16} /></button>
        <button type="button" className="rich-toolbar-wide" onClick={autoFormat}>
          <Sparkles size={16} />
          自动整理
        </button>
      </div>

      <div className="rich-editor-canvas">
        <div
          ref={editorRef}
          className="rich-editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
}
