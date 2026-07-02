
function getBaureihenEndpoint(): string {
  return '/api/aktivitaet/json/getgefunden';
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

  let list = ul;
  let group = "ABC";
  for (const baureihe of items) {
    if (!(baureihe.ubid as string).startsWith(group)) {
      group = (baureihe.ubid as string).slice(0, 3);
      const details = document.createElement("details");
      details.innerHTML = `<summary>${group}</summary>`;
      list = document.createElement("ul");
      list.classList.add("baureihen");
      details.appendChild(list);
      (document.getElementById("liste") as HTMLElement).appendChild(details);
    }
    const li = document.createElement('li');
    li.innerHTML = `<a href="/suchergebnis?ubid=${baureihe.ubid}">${baureihe.ubid}</a>`;
    list.prepend(li);
  }
}
