
function getBaureihenEndpoint(): string {
  return '/api/getGefundeneBaureihen';
}

function renderBaureihen(items: unknown): void {
  const ul = document.getElementById('liste');
  if (!ul) {
    return;
  }

  ul.innerHTML = '';
  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    if (typeof item === 'string') {
      li.textContent = item;
    } else if (item && typeof item === 'object') {
      const value = (item as Record<string, unknown>);
      if (typeof value.ubid === 'string') {
        li.innerHTML = `<a href="/suchergebnis?ubid=${value.ubid}">${value.ubid}</a>`;
      } else if (typeof value.name === 'string') {
        li.textContent = value.name;
      } else if (typeof value.bezeichnung === 'string') {
        li.textContent = value.bezeichnung;
      } else {
        li.textContent = JSON.stringify(value);
      }
    } else {
      li.textContent = String(item);
    }
    ul.prepend(li);
  });
}
