let uuid = "";
const fill2 = (data: any) => {
    if (typeof data == "string") messageHandler.showError(data);
    const eingehend = document.getElementById("eingehend");
    const ausgehend = document.getElementById("ausgehend");
    for (const user of data.eingehend) {
          const li = document.createElement("li");
          li.innerHTML = `<b>${user.eingehendeAnfragen.name}</b> <form action="/api/akzeptiereFreundschaftsanfrage" method="post" style="display:inline-block"><input name="uuid" value="${user.von}" style="display: none;"><button>Anfrage akzeptieren</button></form>`;
          eingehend?.appendChild(li);
    }
    for (const user of data.ausgehend) {
          const li = document.createElement("li");
          li.innerHTML = `<b>${user.ausgehendeAnfragen.name}</b>`
          ausgehend?.appendChild(li);
    }
}

const xhr2 = new XHR();
xhr2.get("/api/getUUID", (response: string) => {
  (document.getElementById("uuid") as HTMLElement).textContent = `UUID: ${response}`;
  uuid = response;
  const xhr = new XHR();
  xhr.get("/api/getAusstehendeFreundschaftsanfragen", fill2);
});
