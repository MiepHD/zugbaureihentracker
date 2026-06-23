const fill = (data: any) => {
    const list = document.querySelector("ul");
    for (const user of data) {
        for (const baureihe of user.Aktivitaets) {
            const li = document.createElement("li");
            li.innerHTML = `<b>${baureihe.ubid}</b> <i style="font-size: smaller">durch ${user.name}</i> <form action="/api/entferneFreund" method="post" style="display:inline-block"><input name="uuid" value="${user.uuid}" style="display: none;"><button>Freund entfernen</button></form>`
            list?.appendChild(li);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const xhr = new XHR();
  xhr.get("/api/baureihenVonFreundenAbrufen", fill);
  const xhr2 = new XHR();
  xhr2.get("/api/getUUID", (response: { uuid: string}) => {
    (document.getElementById("uuid") as HTMLElement).textContent = `UUID: ${response}`;
  });
});
