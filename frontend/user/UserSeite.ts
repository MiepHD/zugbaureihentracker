/**
 * Christoph
 */

const uuidU = query.get("uuid");

if (uuidU) (document.getElementById("uuid") as HTMLInputElement).value = uuidU;

if (uuidU) (document.querySelector("i") as HTMLElement).textContent = uuidU;

function requestBaureihen2(): void {
  const endpoint = getBaureihenEndpoint();
  new XHR().get(endpoint + "?uuid=" + encodeURIComponent(uuidU as string), (response: any) => {
    if (Array.isArray(response)) {
      renderBaureihen(response);
      const h2 = document.querySelector("h2") as HTMLElement;
      h2.textContent = (h2.textContent as string).replace("?", ((document.getElementById("liste") as HTMLElement).children.length).toString());
    } else {
      messageHandler.showError(response);
    }
  });
}

requestBaureihen2();
const xhr3 = new XHR();
xhr3.get("/api/getNutzername?uuid=" + encodeURIComponent(uuidU as string), (response: string) => {
  (document.querySelector("b") as HTMLElement).textContent = response;
  document.title += " " + response;
  const h2 = document.querySelector("h2") as HTMLElement;
  h2.textContent = response + h2.textContent;
});


