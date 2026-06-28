/**
 * Christoph
 */
let paramE = location.href.split('?')[1];
let queryE = new URLSearchParams(paramE);

if (ubid) (document.getElementById("ubid") as HTMLInputElement).value = queryE.get("ubid") as string;

new XHR().get("/api/getBaureihe?" + paramE, (response: any) => {
  if (typeof response == "string") {
    showError(response);
    return;
  }

  (document.getElementById("beschreibung") as HTMLInputElement).value = response.baureihe.beschreibung;
  (document.getElementById("name") as HTMLInputElement).value = response.baureihe.name;
});

(document.querySelector("form") as HTMLFormElement).addEventListener("submit", () => {
  (document.getElementById("ubid") as HTMLInputElement).removeAttribute("disabled");
});
