class MessageHandler {
    constructor() {
        const successMessage = query.get("successMessage");
        if (successMessage) this.showSuccess(successMessage);
        const errorMessage = query.get("errorMessage");
        if (errorMessage) this.showError(errorMessage)
    }

    showError(message: string) {
        const elem = document.createElement("div");
        elem.classList.add("errorMessage");
        elem.textContent = message;
        if (message.startsWith("409: Diese Baureihe") && message.includes("trotzdem löschen?")) {
            const ubid = query.get("ubid");
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;<form action="/api/baureihe/web/remove/" method="post" style="display: inline-block"><input name="ubid" value="${ubid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
        }
        if (message.startsWith("409: Dieser Account") && message.includes("trotzdem löschen?")) {
            const uuid = query.get("uuid");
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;<form action="/api/nutzer/web/removeAccount/" method="post" style="display: inline-block"><input name="uuid" value="${uuid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
        }
        if (message.includes("Zugbaureihentracker | Anmelden")) {
            document.location = "/login?errorMessage=" + encodeURIComponent("Bitte melde dich (erneut) an.");
            return;
        }
        document.body.appendChild(elem);
    }

    showSuccess(message: string) {
        const elem = document.createElement("div");
        elem.classList.add("errorMessage");
        elem.textContent = message;
        elem.style.setProperty("background-color", "lightgreen");
        document.body.appendChild(elem);
    }
}
const messageHandler = new MessageHandler();