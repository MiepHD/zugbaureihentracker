class SuchergebnisSeite {
  constructor() {
    const ubid = query.get("ubid");

    if (ubid) {
      (document.querySelector("#gefunden input") as HTMLInputElement).value = ubid;
      (document.querySelector("#gefahren input") as HTMLInputElement).value = ubid;
    }

    if (ubid) (document.querySelector("b") as HTMLElement).textContent = ubid;
    new FormHandler(this.update, this.update);
    this.update();
  }
  update() {
    new XHR().get("/api/baureihe/json/get?" + query.param, (response: any) => {
    if (response && response.errorMessage) {
      messageHandler.showError(response.errorMessage);
      (document.getElementById("beschreibung") as HTMLElement).innerHTML = "";
      (document.querySelector("i") as HTMLElement).innerHTML = "Baureihe wurde nicht gefunden :(";
      (document.getElementById("gefahren") as HTMLElement).style.setProperty("visibility", "hidden");
      (document.getElementById("gefunden") as HTMLElement).style.setProperty("visibility", "hidden");
      return;
    }

    if (response.baureihe.Beschreibung == null || response.baureihe.Beschreibung.length == 0) {
      (document.getElementById("beschreibung") as HTMLElement).innerHTML = response.baureihe.beschreibung == null ? "" : response.baureihe.beschreibung;
    } else {
      for (const key of Object.keys(response.baureihe.Beschreibung)) {
        const elem = document.getElementById(key);
        if (elem) elem.textContent = response.baureihe.Beschreibung[key];
      }
    }
    
    (document.querySelector("i") as HTMLElement).innerHTML = response.baureihe.name;

    const elem = document.querySelector("#gefunden button") as HTMLButtonElement;
    elem.textContent = "Gefunden";
    (document.getElementById("gefundenAm") as HTMLElement).textContent = "";
    elem.style.setProperty("background-color", "var(--green)");
    (document.getElementById("gefunden") as HTMLFormElement).setAttribute("data-api", "/api/aktivitaet/json/setgefunden");
    if (response.gefunden !== null) {
      elem.textContent = `Baureihe nicht mehr als "Gefunden" markieren`;
      elem.style.setProperty("background-color", "var(--red)");
      (document.getElementById("gefundenAm") as HTMLElement).textContent = "Du hast diese Baureihe gefunden am " + new Date(response.gefunden).toLocaleString().replace(",", " um");
      (document.getElementById("gefunden") as HTMLFormElement).setAttribute("data-api", "/api/aktivitaet/json/setnichtgefunden");
    }

    const elem2 = document.querySelector("#gefahren button") as HTMLButtonElement;
    elem2.textContent = "Gefahren";
    elem2.style.setProperty("background-color", "var(--green)");
    (document.getElementById("gefahren") as HTMLFormElement).setAttribute("data-api", "/api/aktivitaet/json/setgefahren");
    (document.getElementById("gefahrenAm") as HTMLElement).textContent = "";
    if (response.gefahren !== null) {
      elem2.textContent = `Baureihe nicht mehr als "Gefahren" markieren`;
      elem2.style.setProperty("background-color", "var(--red)");
      (document.getElementById("gefahrenAm") as HTMLElement).textContent = "Du hast diese Baureihe gefahren am " + new Date(response.gefahren).toLocaleString().replace(",", " um");
      (document.getElementById("gefahren") as HTMLFormElement).setAttribute("data-api", "/api/aktivitaet/json/setnichtgefahren");
    }
  });
  }
}
new SuchergebnisSeite();
