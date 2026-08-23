/*
 * terminal — a shell/code window with title bar and copy button
 * Authoring model (DA):
 *   optional row 1: title text (single cell, no <pre>)
 *   row: a cell containing <pre><code>…</code></pre>
 */

const COMMANDS = ['qmd', 'npm', 'bun', 'npx', 'bunx', 'git', 'cd', 'brew', 'claude', 'node', 'curl'];

function tintLine(line) {
  const frag = document.createDocumentFragment();
  const trimmed = line.trimStart();
  if (trimmed.startsWith('#')) {
    const span = document.createElement('span');
    span.className = 'term-comment';
    span.textContent = line;
    frag.append(span);
    return frag;
  }
  const match = trimmed.match(/^([a-z-]+)/);
  const first = match && COMMANDS.includes(match[1]) ? match[1] : null;
  if (first) {
    const indent = line.slice(0, line.length - trimmed.length);
    const cmd = document.createElement('span');
    cmd.className = 'term-cmd';
    cmd.textContent = indent + first;
    frag.append(cmd, document.createTextNode(trimmed.slice(first.length)));
  } else {
    frag.append(document.createTextNode(line));
  }
  return frag;
}

function tint(code) {
  const text = code.textContent;
  code.textContent = '';
  text.split('\n').forEach((line, i) => {
    if (i > 0) code.append(document.createTextNode('\n'));
    code.append(tintLine(line));
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  let titleRow = null;
  let pre = null;

  rows.forEach((row) => {
    const rowPre = row.querySelector('pre');
    if (rowPre) {
      pre = rowPre;
    } else if (row.textContent.trim()) {
      titleRow = row;
    }
  });
  const title = titleRow ? titleRow.textContent.trim() : '';

  if (!pre) return;
  const code = pre.querySelector('code') || pre;
  if (!block.classList.contains('plain')) tint(code);

  const bar = document.createElement('div');
  bar.className = 'terminal-bar';
  const dots = document.createElement('span');
  dots.className = 'terminal-dots';
  dots.append(...[0, 1, 2].map(() => document.createElement('i')));
  // move the authored title node intact (preserves da-live Canvas prose markers)
  const titleEl = document.createElement('div');
  titleEl.className = 'terminal-title';
  if (titleRow) {
    const cell = titleRow.firstElementChild;
    titleEl.append(...(cell || titleRow).childNodes);
  }
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'terminal-copy';
  copy.setAttribute('aria-label', `Copy ${title || 'code'}`);
  copy.textContent = 'copy';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.textContent = 'copied';
      copy.classList.add('copied');
      setTimeout(() => {
        copy.textContent = 'copy';
        copy.classList.remove('copied');
      }, 1600);
    } catch (e) {
      // clipboard unavailable
    }
  });
  bar.append(dots, titleEl, copy);

  const body = document.createElement('div');
  body.className = 'terminal-body';
  body.append(pre);

  block.replaceChildren(bar, body);
}
