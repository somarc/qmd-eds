/*
 * spec — semantic data table
 * Authoring model (DA): first row = column headers, remaining rows = data
 */

export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const el = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) el.setAttribute('scope', 'col');
      el.append(...cell.childNodes);
      tr.append(el);
    });
    (i === 0 ? thead : tbody).append(tr);
  });

  table.append(thead, tbody);
  const wrapper = document.createElement('div');
  wrapper.className = 'spec-scroll';
  wrapper.append(table);
  block.replaceChildren(wrapper);
}
