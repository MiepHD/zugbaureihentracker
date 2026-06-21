/**
 * Christoph
 */
let paramString = location.href.split('?')[1];
let queryString = new URLSearchParams(paramString);
const ubid = queryString.get("ubid");

if (ubid) (document.querySelector("input") as HTMLInputElement).value = ubid;

if (ubid) (document.querySelector("b") as HTMLElement).textContent = ubid;

const found = queryString.get("found");

if (found) (document.querySelector("button") as HTMLElement).style.setProperty("display", "none");

new XHR().get("/api/getBaureihe?" + paramString, (response: any) => {
  if (response == null) {
    (document.querySelector("p") as HTMLElement).innerHTML = "";
    (document.querySelector("i") as HTMLElement).innerHTML = "Baureihe wurde nicht gefunden :(";
    (document.querySelector("button") as HTMLElement).style.setProperty("visibility", "hidden");
  }

  (document.querySelector("p") as HTMLElement).innerHTML = response.beschreibung;
  (document.querySelector("i") as HTMLElement).innerHTML = response.name;
});
