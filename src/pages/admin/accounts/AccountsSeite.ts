class AccountsSeite {
  constructor() {
    this.update();
  }
  update() {
    new XHR().get("/api/nutzer/json/getAccounts", (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }
      const list = document.querySelector("ul") as HTMLUListElement;
      list.innerHTML = "";
      for (const baureihe of response) {
        const elem = document.createElement("li");
        elem.innerHTML = `
        <b>
          <a href="/app/user?uuid=${encodeURIComponent(baureihe.uuid)}">${baureihe.name}</a>
        </b>
        <form
          data-api="/api/nutzer/json/${baureihe.admin ? "removeAdmin" : "removeAccount"}"
          style="display: inline-block;"
        >
          <input name="uuid" value="${baureihe.uuid}" style="display: none">
          <button style="background-color: red">
            ${baureihe.admin ? "Adminrechte entfernen" : "Löschen"}
          </button>
          ${baureihe.admin ? "<input type='password' name='passwort' />" : ""}
        </form>
        ${baureihe.admin ? "" : `
          <form
            data-api="/api/nutzer/json/addAdmin"
            style='display: inline-block;'
          >
            <input name='uuid' value='${baureihe.uuid}' style="display: none"/>
            <button>Adminrechte geben</button>
            <input type="password" name="passwort" />
          </form>
        `}`;
        list.appendChild(elem);
      }
      new FormHandler(this.update.bind(this));
    });
  }
}
new AccountsSeite();
