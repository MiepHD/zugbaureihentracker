new XHR().get("/api/getAccounts", (response: any) => {
  if (typeof response == "string") {
    showError(response);
    return;
  }
  const list = document.querySelector("ul") as HTMLUListElement;
  for (const baureihe of response) {
    const elem = document.createElement("li");
    elem.innerHTML = `<b>${baureihe.name}</b> <i>${baureihe.uuid}</i> <form action="/api/${baureihe.admin ? "removeAdmin" : "removeAccount"}" method="post" style="display: inline-block;"> <input name="uuid" value="${baureihe.uuid}" style="display: none"><button style="background-color: red">${baureihe.admin ? "Adminrechte entfernen" : "Löschen"}</button>${baureihe.admin ? "<input type='password' name='passwort' />" : ""}</form>`;
    list.appendChild(elem);
  }
});
