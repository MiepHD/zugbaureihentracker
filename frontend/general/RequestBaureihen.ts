function getBaureihenEndpoint(): string {
  return '/api/aktivitaet/json/getgefunden';
}

function renderBaureihen(items: unknown, additionalContent = ""): void {
  const ul = document.getElementById('liste');
  if (!ul) {
    return;
  }

  ul.innerHTML = '';
  if (!Array.isArray(items)) {
    return;
  }

  let list = ul;
  const input = document.createElement("input");
  (input as HTMLInputElement).placeholder = "Suchen...";
  (input as HTMLInputElement).type = "search";
  input.addEventListener("input", () => {
    for (const group of document.querySelectorAll('#liste > details')) {
      for (const elem of group.children[1].children) {
        if (elem.textContent?.startsWith(input.value)) {
          (elem as HTMLElement).style.removeProperty("display");
        } else {
          (elem as HTMLElement).style.setProperty("display", "none");
        }
      }
    }
  });
  list.appendChild(input);
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
    const anfang = `<span class="anfang">&nbsp;&nbsp;&nbsp;</span>`;
    const ende = `<span class="ende">${baureihe.gefahren ? "<span class='icon user small'></span>" : "&nbsp;&nbsp;&nbsp;"}</span>`;
    const verbindungen: Array<number> = [];
    let ubid: Array<string> = Array.from(baureihe.ubid);
    ubid.forEach((value: unknown, index: number, arr: unknown[]) => {
        if ((value as string).includes(" ")) {
          arr[index] = `<span class="verbindung">&nbsp;&nbsp;&nbsp;</span>`;
          verbindungen.push(index);
        } else {
          arr[index] = `<span class="fenster">${value}</span>`;
        }
    });

    ubid.unshift(anfang);
    ubid.push(ende);

    let min = 0;
    for (let i = 0; i < ubid.length; i++) {
      if (ubid[i] == `<span class="verbindung">&nbsp;&nbsp;&nbsp;</span>` || ubid[i].includes(ende)) {
        ubid[i - 1] = `<span class="door">&nbsp;&nbsp;&nbsp;</span>` + ubid[i - 1];

        let count = 0;
        let curr = i - 2;
        while (curr > min + 1) {
          count += 1;
          if (count == 2) {
            ubid[curr] = `<span class="door">&nbsp;&nbsp;&nbsp;</span>` + ubid[curr];
            count = 0;
          }
          curr -= 1;
        }
        min = i;
      }
    }

    let ubidstring = "";
    for (const str of ubid) {
      ubidstring += str;
    }

    li.innerHTML = `<a class="zug" href="/app/suchergebnis?ubid=${baureihe.ubid}">${ubidstring}</a>${additionalContent.replaceAll("%s", baureihe.ubid)}`;
    list.prepend(li);
  }
}
