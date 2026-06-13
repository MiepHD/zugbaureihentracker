
/**
 * Von Tim am 12. Juni
 */

const SESSION_COOKIE_NAME = 'sessiontoken';
const HIDDEN_INPUT_NAME = 'sessiontoken';

function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function getCookie(name: string): string | undefined {
  const cookiePairs = document.cookie.split(';').map((entry) => entry.trim());
  const match = cookiePairs.find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : undefined;
}

function parseServerResponseForSessionToken(): string | undefined {
  const bodyToken = document.body.dataset.sessiontoken;
  if (bodyToken) {
    return bodyToken;
  }

  const responseElement = document.getElementById('server-response');
  if (responseElement) {
    const dataToken = responseElement.getAttribute('data-sessiontoken');
    if (dataToken) {
      return dataToken;
    }

    try {
      const payload = JSON.parse(responseElement.textContent || 'null');
      if (payload && typeof payload.sessiontoken === 'string') {
        return payload.sessiontoken;
      }
    } catch {
      // ignore invalid JSON
    }
  }

  const hidden = document.querySelector<HTMLInputElement>(`input[type="hidden"][name="${HIDDEN_INPUT_NAME}"]`);
  if (hidden && hidden.value) {
    return hidden.value;
  }

  return undefined;
}

function getOrCreateHiddenSessionInput(): HTMLInputElement | null {
  const form = document.querySelector<HTMLFormElement>('form');
  if (!form) {
    return null;
  }

  let input = form.querySelector<HTMLInputElement>(`input[type="hidden"][name="${HIDDEN_INPUT_NAME}"]`);
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = HIDDEN_INPUT_NAME;
    input.id = HIDDEN_INPUT_NAME;
    form.appendChild(input);
  }

  return input;
}

function getBaureihenEndpoint(): string {
  const ul = document.querySelector<HTMLUListElement>('ul');
  return ul?.dataset.source ?? '/api/baureihen';
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

  const sessionToken = getCookie(SESSION_COOKIE_NAME);
  if (sessionToken) {
    xhr.setRequestHeader('X-Sessiontoken', sessionToken);
  }

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
  const tokenFromServer = parseServerResponseForSessionToken();
  if (tokenFromServer) {
    setCookie(SESSION_COOKIE_NAME, tokenFromServer);
  }

  const hiddenInput = getOrCreateHiddenSessionInput();
  const sessionToken = getCookie(SESSION_COOKIE_NAME);
  if (hiddenInput && sessionToken) {
    hiddenInput.value = sessionToken;
  }

  requestBaureihen();
});
