/**
 * Christoph
 */

const ubid = query.get("ubid");

if (ubid) {
  (document.querySelector("#gefunden input") as HTMLInputElement).value = ubid;
  (document.querySelector("#gefahren input") as HTMLInputElement).value = ubid;
}

if (ubid) (document.querySelector("b") as HTMLElement).textContent = ubid;

new XHR().get("/api/baureihe/json/get?" + query.param, (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    (document.querySelector("p") as HTMLElement).innerHTML = "";
    (document.querySelector("i") as HTMLElement).innerHTML = "Baureihe wurde nicht gefunden :(";
    (document.getElementById("gefahren") as HTMLElement).style.setProperty("visibility", "hidden");
    (document.getElementById("gefunden") as HTMLElement).style.setProperty("visibility", "hidden");
    return;
  }

  (document.querySelector("p") as HTMLElement).innerHTML = response.baureihe.beschreibung;
  (document.querySelector("i") as HTMLElement).innerHTML = response.baureihe.name;

  const elem = document.querySelector("#gefunden button") as HTMLButtonElement;
  elem.style.setProperty("background-color", "var(--green)");
  if (response.gefunden !== null) {
    elem.textContent = `Baureihe nicht mehr als "Gefunden" markieren`;
    elem.style.setProperty("background-color", "var(--red)");
    (document.getElementById("gefundenAm") as HTMLElement).textContent = "Du hast diese Baureihe gefunden am " + new Date(response.gefunden).toLocaleString().replace(",", " um");
    (document.getElementById("gefunden") as HTMLFormElement).action = "/api/aktivitaet/web/setnichtgefunden";
  }

  const elem2 = document.querySelector("#gefahren button") as HTMLButtonElement;
  elem2.style.setProperty("background-color", "var(--green)");
  if (response.gefahren !== null) {
    elem2.textContent = `Baureihe nicht mehr als "Gefahren" markieren`;
    elem2.style.setProperty("background-color", "var(--red)");
    (document.getElementById("gefahrenAm") as HTMLElement).textContent = "Du hast diese Baureihe gefahren am " + new Date(response.gefahren).toLocaleString().replace(",", " um");
    (document.getElementById("gefahren") as HTMLFormElement).action = "/api/aktivitaet/web/setnichtgefahren";
  }
});
