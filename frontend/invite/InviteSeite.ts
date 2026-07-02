new XHR().get("/api/nutzer/json/isElevated", (response: any) => {
  if (typeof response == "string" && !response.startsWith("401")) {
    messageHandler.showError(response);
    return;
  }
  if (response && response.isElevated) {
    (document.getElementById("passwort") as HTMLElement).style.setProperty("display", "none");
    (document.querySelector("label[for=passwort]") as HTMLElement).style.setProperty("display", "none");
  }
});