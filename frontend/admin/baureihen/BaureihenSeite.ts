class BaureihenSeite {
  constructor() {
    this.update();
  }
  update() {
    new XHR().get("/api/baureihe/json/getall", (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }
      renderBaureihen(response, `
        <a href="/admin/editor?ubid=%s" aria-label="zurückziehen" class="icon pencil small"></a>
        <form data-api="/api/baureihe/json/remove" style="display: inline-block;">
          <input name="ubid" value="%s" style="display: none">
          <button style="background-color: red" aria-label="löschen" class="icon small x"></button>
        </form>
      `);
      new FormHandler(this.update.bind(this));
    });
  }
}
new BaureihenSeite();
