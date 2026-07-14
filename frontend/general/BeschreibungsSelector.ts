class BeschreibungsSelector {
    constructor() {
        window.addEventListener("pageshow", this.update);
        this.update();
    }
    update() {
        new XHR().get("/api/beschreibung/json/getAll", (response: any) => {
            if (response.errorMessage) { messageHandler.showError(response.errorMessage); return; }
            const select = document.querySelector("select") as HTMLElement;
            select.innerHTML = "";
            for (const beschreibung of response) {
                const name = beschreibung.name;
                select.innerHTML += `<option value="${name}">${name}</option>"`;
            }
        });
    }
}
new BeschreibungsSelector();