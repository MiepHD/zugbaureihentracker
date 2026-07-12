class FreundschaftsanfragenSeite {  
      constructor() {
            new FormHandler(() => {
                  (document.querySelector("main > form > input") as HTMLInputElement).value = "";
                  this.update();
            });
            new XHR().get("/api/nutzer/raw/getUUID", (response: string) => {
                  (document.getElementById("uuid") as HTMLElement).textContent = `UUID: ${response}`;
                  this.update();
            });
      }
      update() {
            new XHR().get("/api/freundesliste/json/getausstehend", this.fill.bind(this));
      }

      fill(data: any) {
            if (typeof data == "string") messageHandler.showError(data);
            const eingehend = document.getElementById("eingehend") as HTMLElement;
            const ausgehend = document.getElementById("ausgehend") as HTMLElement;
            eingehend.innerHTML = "";
            for (const user of data.eingehend) {
                  const li = document.createElement("li");
                  li.innerHTML = `
                        <b>${user.eingehendeAnfragen.name}</b>&nbsp;&nbsp;&nbsp;
                        <form data-api="/api/freundesliste/json/akzeptiereanfrage" style="display:inline-block">
                              <input name="uuid" value="${user.von}" style="display: none;">
                              <button aria-label="akzeptieren" class="icon small usercheck"></button>
                        </form>&nbsp;&nbsp;&nbsp;
                        <form data-api="/api/freundesliste/json/ablehnenanfrage" style="display:inline-block">
                              <input name="uuid" value="${user.von}" style="display: none;">
                              <button aria-label="ablehnen" class="icon small userx"></button>
                        </form>
                  `;
                  eingehend?.appendChild(li);
            }
            new FormHandler(this.update.bind(this), this.update.bind(this), document.querySelectorAll("#eingehend form"));
            ausgehend.innerHTML = "";
            for (const user of data.ausgehend) {
                  const li = document.createElement("li");
                  li.innerHTML = `
                        <b>${user.ausgehendeAnfragen.name}</b>&nbsp;&nbsp;&nbsp;
                        <form data-api="/api/freundesliste/json/abortanfrage" style="display:inline-block">
                              <input name="uuid" value="${user.zu}" style="display: none;">
                              <button aria-label="zurückziehen" class="icon small userx"></button>
                        </form>
                  `;
                  ausgehend?.appendChild(li);
            }
            new FormHandler(this.update.bind(this), this.update.bind(this), document.querySelectorAll("#ausgehend form"));
      }
}
new FreundschaftsanfragenSeite();
