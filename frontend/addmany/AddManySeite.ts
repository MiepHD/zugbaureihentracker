document.querySelector("button")?.addEventListener("click", () => {
    try {
        const data: Array<{name: string, beschreibung: string, ubid: string}> = JSON.parse((document.querySelector("textarea") as HTMLTextAreaElement).value);
        const log: HTMLElement = document.getElementById("log") as HTMLElement;
        log.innerHTML = "";
        for (const baureihe of data) {
            new XHR().post("/api/baureihe/json/add", baureihe, (res: any) => {
                const errorMessage = res.errorMessage ? res.errorMessage : res.successMessage;
                if (errorMessage) log.innerHTML = log.innerHTML + baureihe.ubid + ": " + errorMessage + "<br/>"; else log.innerHTML = log.innerHTML + baureihe.ubid + ": Erfolgreich hinzugefügt.<br/>";
            });
        }
    } catch (e) {
        messageHandler.showError((e as Error).message);
    }
});
