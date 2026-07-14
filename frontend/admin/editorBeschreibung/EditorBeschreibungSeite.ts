class EditorBeschreibungSeite {
  constructor() {
    this.update();
    new FormHandler(this.resetForm, this.resetForm);
  }
  update() {
    (document.getElementById("name") as HTMLInputElement).value = query.get("name") as string;

    new XHR().get("/api/beschreibung/json/get?" + query.param, (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }

      (document.getElementById("name") as HTMLInputElement).value = response.beschreibung.name;
      (document.getElementById("besitzer") as HTMLInputElement).value = response.beschreibung.besitzer;
      (document.getElementById("vmax") as HTMLInputElement).value = response.beschreibung.vmax;
      (document.getElementById("baujahre") as HTMLInputElement).value = response.beschreibung.baujahre;
      (document.getElementById("gewicht") as HTMLInputElement).value = response.beschreibung.gewicht;
    });

    (document.querySelector("form") as HTMLFormElement).addEventListener("submit", () => {
      (document.getElementById("name") as HTMLInputElement).removeAttribute("disabled");
    });
  }
  resetForm() {
    (document.getElementById("name") as HTMLInputElement).disabled = true;
  }
}
new EditorBeschreibungSeite();