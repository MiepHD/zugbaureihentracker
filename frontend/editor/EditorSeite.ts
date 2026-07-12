class EditorSeite {
  constructor() {
    this.update();
    new FormHandler(this.resetForm, this.resetForm);
  }
  update() {
    (document.getElementById("ubid") as HTMLInputElement).value = query.get("ubid") as string;

    new XHR().get("/api/baureihe/json/get?" + query.param, (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }

      (document.getElementById("beschreibung") as HTMLInputElement).value = response.baureihe.beschreibung;
      (document.getElementById("name") as HTMLInputElement).value = response.baureihe.name;
    });

    (document.querySelector("form") as HTMLFormElement).addEventListener("submit", () => {
      (document.getElementById("ubid") as HTMLInputElement).removeAttribute("disabled");
    });
  }
  resetForm() {
    (document.getElementById("ubid") as HTMLInputElement).disabled = true;
  }
}
new EditorSeite();