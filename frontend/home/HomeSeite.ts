
/**
 * Von Tim am 12. Juni
 */

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

new XHR().get("/api/nutzer/json/isElevated", (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    return;
  }
  if (response && response.isElevated) (document.getElementById("admin") as HTMLElement).style.setProperty("display", "inline-block");
});


