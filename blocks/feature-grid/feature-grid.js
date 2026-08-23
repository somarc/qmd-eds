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

    const title = document.createElement('h3');
    title.textContent = titleCell ? titleCell.textContent.trim() : '';

    const desc = document.createElement('p');
    if (descCell) desc.append(...descCell.childNodes);

    li.append(index, title, desc);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
