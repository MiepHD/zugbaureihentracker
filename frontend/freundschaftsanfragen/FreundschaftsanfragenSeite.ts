let uuid = "";
const fill2 = (data: any) => {
    if (typeof data == "string") messageHandler.showError(data);
    const eingehend = document.getElementById("eingehend");
    const ausgehend = document.getElementById("ausgehend");
    for (const user of data.eingehend) {
          const li = document.createElement("li");
          li.innerHTML = `<b>${user.eingehendeAnfragen.name}</b>&nbsp;&nbsp;&nbsp;<form action="/api/freundesliste/web/akzeptiereanfrage" method="post" style="display:inline-block"><input name="uuid" value="${user.von}" style="display: none;"><button><img class="icon" src="/assets/user-check-svgrepo-com.svg" alt="akzeptieren" /></button></form>&nbsp;&nbsp;&nbsp;<form action="/api/freundesliste/web/ablehnenanfrage" method="post" style="display:inline-block"><input name="uuid" value="${user.von}" style="display: none;"><button><img class="icon" src="/assets/user-x-svgrepo-com.svg" alt="ablehnen" /></button></form>`;
          eingehend?.appendChild(li);
    }
    for (const user of data.ausgehend) {
          const li = document.createElement("li");
          li.innerHTML = `<b>${user.ausgehendeAnfragen.name}</b>&nbsp;&nbsp;&nbsp;<form action="/api/freundesliste/web/abortanfrage" method="post" style="display:inline-block"><input name="uuid" value="${user.zu}" style="display: none;"><button><img class="icon" src="/assets/user-x-svgrepo-com.svg" alt="zurückziehen" /></button></form>`
          ausgehend?.appendChild(li);
    }
}

const xhr2 = new XHR();
xhr2.get("/api/nutzer/raw/getUUID", (response: string) => {
  (document.getElementById("uuid") as HTMLElement).textContent = `UUID: ${response}`;
  uuid = response;
  const xhr = new XHR();
  xhr.get("/api/freundesliste/web/getausstehend", fill2);
});
