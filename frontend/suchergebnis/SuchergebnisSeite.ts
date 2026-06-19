/**
 * Christoph
 */
let paramString = location.href.split('?')[1];
let queryString = new URLSearchParams(paramString);
const ubid = queryString.entries()[0].value;

(document.querySelector("input") as HTMLInputElement).value = ubid;

 const xhr = new XMLHttpRequest();
  xhr.open('GET', "/api/getGefundeneBaureihen", true);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status !== 200) {
      return;
    }

      const response = JSON.parse(xhr.responseText);
      response.beschreibung
      document.querySelector("p").innerHTML = response.beschreibung;
      document.querySelector("i").innerHTML = response.name;
     
  };

  xhr.send();
