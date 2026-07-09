new XHR().get("/api/baureihe/json/getall", (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    return;
  }
  renderBaureihen(response, ' <a href="/editor?ubid=%s" aria-label="zurückziehen" class="icon pencil small"></a> <form action="/api/baureihe/web/remove" method="post" style="display: inline-block;"> <input name="ubid" value="%s" style="display: none"><button style="background-color: red" aria-label="löschen" class="icon small x"></button></form>');
});
