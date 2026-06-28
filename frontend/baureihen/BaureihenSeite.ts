new XHR().get("/api/getBaureihen", (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    return;
  }
  let list = document.querySelector("ul") as HTMLUListElement;
  let group = "ABC";
  for (const baureihe of response) {
    if (!(baureihe.ubid as string).startsWith(group)) {
      group = (baureihe.ubid as string).slice(0, 3);
      const details = document.createElement("details");
      details.innerHTML = `<summary>${group}</summary>`;
      list = document.createElement("ul");
      list.classList.add("baureihen");
      details.appendChild(list);
      (document.querySelector("main") as HTMLElement).appendChild(details);
    }
    const elem = document.createElement("li");
      elem.innerHTML = `<a href="/editor?ubid=${baureihe.ubid}">${baureihe.ubid}</a> <i>${baureihe.name}</i> <form action="/api/removeBaureihe" method="post" style="display: inline-block;"> <input name="ubid" value="${baureihe.ubid}" style="display: none"><button style="background-color: red">Löschen</button></form>`;
      list.appendChild(elem);
  }
});
