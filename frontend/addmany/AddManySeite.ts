document.querySelector("button")?.addEventListener("click", (e: Event) => {
    try {
        const data: Array<{name: string, beschreibung: string, ubid: string}> = JSON.parse((document.querySelector("textarea") as HTMLTextAreaElement).value);
        const log: HTMLElement = document.getElementById("log") as HTMLElement;
        for (const baureihe of data) {
            new XHR().post("/api/addBaureihe", baureihe, (res: any) => {
                const urlObj = new URL(res);
                const errorMessage = urlObj.searchParams.get('errorMessage');
                if (errorMessage) log.innerHTML = log.innerHTML + baureihe.ubid + ": " + errorMessage + "<br/>"; else log.innerHTML = log.innerHTML + baureihe.ubid + ": Erfolgreich hinzugefügt.<br/>";
            });
        }
    } catch (e) {
        messageHandler.showError("JSON ungültig.");
    }
});