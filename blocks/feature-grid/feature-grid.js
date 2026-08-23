/*
 * feature-grid — numbered feature cards
 * Authoring model (DA): each row = [title, description]
 */

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    const [titleCell, descCell] = row.children;

    const index = document.createElement('span');
    index.className = 'feature-grid-index';
    index.textContent = String(i + 1).padStart(2, '0');

    // move authored nodes intact (preserves da-live Canvas prose markers)
    const title = document.createElement('div');
    title.className = 'feature-grid-title';
    if (titleCell) title.append(...titleCell.childNodes);

    const desc = document.createElement('div');
    desc.className = 'feature-grid-desc';
    if (descCell) desc.append(...descCell.childNodes);

    li.append(index, title, desc);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
