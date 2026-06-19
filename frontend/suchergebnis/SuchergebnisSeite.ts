/**
 * Christoph
 */
let paramString = location.href.split('?')[1];
let queryString = new URLSearchParams(paramString);
const ubid = queryString.get("ubid");

if (ubid) (document.querySelector("input") as HTMLInputElement).value = ubid;

 const xhr = new XMLHttpRequest();
  xhr.open('GET', "/api/getBaureihe?" + paramString, true);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status !== 200) {
      return;
    }

      const response = JSON.parse(xhr.responseText);

      if (response == null) {
        (document.querySelector("p") as HTMLElement).innerHTML = "";
        (document.querySelector("i") as HTMLElement).innerHTML = "Baureihe wurde nicht gefunden :(";
        (document.querySelector("button") as HTMLElement).style.setProperty("visibility", "hidden");
      }

      (document.querySelector("p") as HTMLElement).innerHTML = response.beschreibung;
      (document.querySelector("i") as HTMLElement).innerHTML = response.name;
     
  };

  xhr.send();
