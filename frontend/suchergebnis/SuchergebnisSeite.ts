/**
 * Christoph
 */

const ubid = query.get("ubid");

if (ubid) (document.querySelector("input") as HTMLInputElement).value = ubid;

if (ubid) (document.querySelector("b") as HTMLElement).textContent = ubid;

new XHR().get("/api/baureihe/json/get?" + query.param, (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    (document.querySelector("p") as HTMLElement).innerHTML = "";
    (document.querySelector("i") as HTMLElement).innerHTML = "Baureihe wurde nicht gefunden :(";
    (document.querySelector("button") as HTMLElement).style.setProperty("visibility", "hidden");
    return;
  }

  (document.querySelector("p") as HTMLElement).innerHTML = response.baureihe.beschreibung;
  (document.querySelector("i") as HTMLElement).innerHTML = response.baureihe.name;

  const elem = document.querySelector("button") as HTMLButtonElement;
  elem.style.setProperty("background-color", "lightgreen");
  if (response.gefunden !== null) {
    elem.textContent = `Baureihe nicht mehr als "Gefunden" markieren`;
    elem.style.setProperty("background-color", "lightcoral");
    (document.getElementById("gefundenAm") as HTMLElement).textContent = "Du hast diese Baureihe gefunden am " + new Date(response.gefunden).toLocaleString().replace(",", " um");
    (document.querySelector("form") as HTMLFormElement).action = "/api/aktivitaet/web/setnichtgefunden";
  }
});
