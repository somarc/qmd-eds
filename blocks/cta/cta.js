/*
 * cta — closing call-to-action band
 * Authoring model (DA):
 *   optional row: picture (ambient background)
 *   row: heading, paragraph, button paragraphs
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    if (row.querySelector('picture')) {
      row.className = 'cta-image';
      const scrim = document.createElement('div');
      scrim.className = 'cta-scrim';
      row.append(scrim);
    } else {
      row.className = 'cta-content';
    }
  });

  const content = block.querySelector('.cta-content > div');
  if (!content) return;
  const actions = content.querySelectorAll('p.button-wrapper');
  if (actions.length) {
    const group = document.createElement('div');
    group.className = 'cta-actions';
    actions[0].before(group);
    actions.forEach((a) => group.append(a));
  }
}
