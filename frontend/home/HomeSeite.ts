
/**
 * Von Tim am 12. Juni
 */

function getBaureihenEndpoint(): string {
  const ul = document.querySelector<HTMLUListElement>('ul');
  return ul?.dataset.source ?? '/api/getGefundeneBaureihen';
}

function renderBaureihen(items: unknown): void {
  const ul = document.querySelector<HTMLUListElement>('ul');
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
      if (typeof value.name === 'string') {
        li.textContent = value.name;
      } else if (typeof value.bezeichnung === 'string') {
        li.textContent = value.bezeichnung;
      } else {
        li.textContent = JSON.stringify(value);
      }
    } else {
      li.textContent = String(item);
    }
    ul.appendChild(li);
  });
}

function requestBaureihen(): void {
  const endpoint = getBaureihenEndpoint();
  const xhr = new XMLHttpRequest();
  xhr.open('GET', endpoint, true);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status !== 200) {
      return;
    }

    try {
      const response = JSON.parse(xhr.responseText);
      if (Array.isArray(response)) {
        renderBaureihen(response);
      } else if (response && typeof response === 'object' && Array.isArray((response as Record<string, unknown>).items)) {
        renderBaureihen((response as Record<string, unknown>).items);
      }
    } catch {
      // ignore parse errors
    }
  };

  xhr.send();
}

document.addEventListener('DOMContentLoaded', () => {
  requestBaureihen();
});
