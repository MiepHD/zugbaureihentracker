new XHR().get("/api/nutzer/json/getAccounts", (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    return;
  }
  const list = document.querySelector("ul") as HTMLUListElement;
  for (const baureihe of response) {
    const elem = document.createElement("li");
    elem.innerHTML = `
    <b>
      <a href="/user?uuid=${encodeURIComponent(baureihe.uuid)}">${baureihe.name}</a>
    </b>
    <form
      data-api="/api/nutzer/json/${baureihe.admin ? "removeAdmin" : "removeAccount"}"
      method="post"
      style="display: inline-block;"
    >
      <input name="uuid" value="${baureihe.uuid}" style="display: none">
      <button style="background-color: red">
        ${baureihe.admin ? "Adminrechte entfernen" : "Löschen"}
      </button>
      ${baureihe.admin ? "<input type='password' name='passwort' />" : ""}
    </form>
    ${baureihe.admin ? "" : `
      <form
        data-api="/api/nutzer/json/addAdmin"
        method='post'
        style='display: inline-block;'
      >
        <input name='uuid' value='${baureihe.uuid}' style="display: none"/>
        <button>Adminrechte geben</button>
        <input type="password" name="passwort" />
      </form>
    `}`;
    list.appendChild(elem);
    for (const elem of document.querySelectorAll("form")) {
      elem.addEventListener("submit", accountsForm);
    }
  }
});

function accountsForm(e: Event) {
  e.preventDefault();
  new XHR().post((e.target as HTMLFormElement).getAttribute("data-api") as string, new FormData(e.target as HTMLFormElement), (response: any) => {
    if (response && response.errorMessage) {
      messageHandler.showError(response.errorMessage);
    } else if (response && response.successMessage) {
      messageHandler.showSuccess(response.successMessage);
    } else {
      messageHandler.showError(response);
    }
  });
}