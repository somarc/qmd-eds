/*
 * hero — full-bleed ember archive hero
 * Authoring model (DA):
 *   row 1: picture (background image)
 *   row 2: eyebrow (em-only paragraph), h1, subhead, ul (proof chips),
 *          paragraph containing only <code> (install line), button paragraphs
 */

function buildInstallLine(p) {
  const code = p.querySelector('code');
  p.classList.add('hero-install');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-copy';
  button.setAttribute('aria-label', 'Copy install command');
  button.textContent = 'copy';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'copied';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = 'copy';
        button.classList.remove('copied');
      }, 1600);
    } catch (e) {
      // clipboard unavailable; leave the text selectable
    }
  });
  p.append(button);
}

export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    if (row.querySelector('picture')) {
      row.className = 'hero-image';
      const scrim = document.createElement('div');
      scrim.className = 'hero-scrim';
      row.append(scrim);
    } else {
      row.className = 'hero-content';
    }
  });

  const content = block.querySelector('.hero-content > div');
  if (!content) return;

  const chips = content.querySelector('ul');
  if (chips) chips.classList.add('hero-chips');

  content.querySelectorAll('p').forEach((p) => {
    const code = p.querySelector('code');
    if (code && p.textContent.trim() === code.textContent.trim()) {
      buildInstallLine(p);
    }
  });

  const actions = content.querySelectorAll('p.button-wrapper');
  if (actions.length) {
    const group = document.createElement('div');
    group.className = 'hero-actions';
    actions[0].before(group);
    actions.forEach((a) => group.append(a));
  }
}
