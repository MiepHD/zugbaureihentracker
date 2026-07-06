new XHR().get("/api/baureihe/json/getall", (response: any) => {
  if (typeof response == "string") {
    messageHandler.showError(response);
    return;
  }
  renderBaureihen(response, ' <a href="/editor?ubid=%s"><img class="icon" src="/assets/pencil-svgrepo-com.svg" alt="zurückziehen" /></a> <form action="/api/baureihe/web/remove" method="post" style="display: inline-block;"> <input name="ubid" value="%s" style="display: none"><button style="background-color: red"><img class="icon" src="/assets/x-alt-svgrepo-com.svg" alt="löschen" /></button></form>');
});
