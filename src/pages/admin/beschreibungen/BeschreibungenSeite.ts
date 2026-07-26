class BeschreibungenSeite {
  constructor() {
    window.addEventListener("pageshow", this.update.bind(this));
    this.update();
  }
  update() {
    new XHR().get("/api/beschreibung/json/getAll", (response: any) => {
      if (response.errorMessage) { messageHandler.showError(response.errorMessage); return; }
      const select = document.getElementById("liste") as HTMLElement;
      select.innerHTML = "";
      for (const beschreibung of response) {
        const name = beschreibung.name;
        const li = document.createElement("li");
        li.innerHTML += `
          ${name}
          <a href="/admin/editorBeschreibung?name=${name}" aria-label="ändern" class="icon pencil small"></a>
          <form data-api="/api/beschreibung/json/remove" style="display: inline-block;">
            <input name="name" value="${name}" style="display: none" />
            <button style="background-color: red" aria-label="löschen" class="icon small x"></button>
          </form>
        `;
        select.prepend(li);
      }
      new FormHandler(this.update.bind(this));
    });
  }
}
new BeschreibungenSeite();
