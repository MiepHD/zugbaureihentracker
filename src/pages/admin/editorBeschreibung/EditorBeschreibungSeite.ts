class EditorBeschreibungSeite {
  constructor() {
    this.update();
    new FormHandler(this.update, this.update);
  }
  update() {
    (document.getElementById("name") as HTMLInputElement).value = query.get("name") as string;

    new XHR().get("/api/beschreibung/json/get?" + query.param, (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }

      (document.getElementById("name") as HTMLInputElement).value = response.beschreibung.name;
      (document.querySelector("img") as HTMLImageElement).src = "/data/fotos/" + response.beschreibung.name + `.webp?t=${Date.now()}`;
      (document.getElementById("remove-name") as HTMLInputElement).value = response.beschreibung.name;
      (document.getElementById("besitzer") as HTMLInputElement).value = response.beschreibung.besitzer;
      (document.getElementById("vmax") as HTMLInputElement).value = response.beschreibung.vmax;
      (document.getElementById("baujahre") as HTMLInputElement).value = response.beschreibung.baujahre;
      (document.getElementById("gewicht") as HTMLInputElement).value = response.beschreibung.gewicht;
    });
  }
}
new EditorBeschreibungSeite();