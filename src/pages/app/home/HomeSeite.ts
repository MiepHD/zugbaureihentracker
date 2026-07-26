class HomeSeite {
  constructor() {
    this.update();
    window.addEventListener("pageshow", this.update)
    new XHR().get("/api/nutzer/json/isElevated", (response: any) => {
      if (typeof response == "string") {
        messageHandler.showError(response);
        return;
      }
      if (response && response.isElevated) (document.getElementById("admin") as HTMLElement).style.setProperty("display", "inline-block");
    });
  }
  update() {
    const endpoint = getBaureihenEndpoint();
    new XHR().get(endpoint, (response: any) => {
      if (Array.isArray(response)) {
        renderBaureihen(response);
      } else if (response && typeof response === 'object' && Array.isArray((response as Record<string, unknown>).items)) {
        renderBaureihen((response as Record<string, unknown>).items);
      } else {
        messageHandler.showError(response);
      }
    });
  }
}
new HomeSeite();
