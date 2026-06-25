new XHR().get("/api/getBaureihen", (response: any) => {
  if (typeof response == "string") {
    showError(response);
    return;
  }
  const list = document.querySelector("ul") as HTMLUListElement;
  for (const baureihe of response) {
    const elem = document.createElement("li");
    elem.innerHTML = `<a href="/suchergebnis?ubid=${baureihe.ubid}">${baureihe.ubid}</a> <i>${baureihe.name}</i> <form action="/api/removeBaureihe" method="post" style="display: inline-block;"> <input name="ubid" value="${baureihe.ubid}" style="display: none"><button style="background-color: red">Löschen</button></form>`;
    list.appendChild(elem);
  }
});
