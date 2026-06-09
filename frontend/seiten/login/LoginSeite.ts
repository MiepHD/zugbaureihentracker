// LoginSeite.ts
// Wird in login/index.html und registrieren/index.html eingebunden.
// Hört auf das submit-Event und ersetzt das Passwortfeld durch den SHA-256-Hash.

async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function handleFormSubmit(event: Event) {
  const form = event.currentTarget as HTMLFormElement | null;
  if (!form) return;
  const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement | null;
  if (!passwordInput) return; // kein Passwortfeld

  // Verhindere sofortiges Abschicken, bis Hash berechnet ist
  event.preventDefault();

  const original = passwordInput.value;
  // Falls leer, einfach normal abschicken
  if (!original) {
    form.submit();
    return;
  }

  sha256Hex(original).then(hash => {
    passwordInput.value = hash;
    form.submit();
  }).catch(() => {
    // Bei Fehlern: normales Abschicken mit unmodifiziertem Passwort
    form.submit();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Auf allen Formularen hören (sowohl login als auch registrieren)
  const forms = document.querySelectorAll('form');
  forms.forEach(f => f.addEventListener('submit', handleFormSubmit));
});

export {};