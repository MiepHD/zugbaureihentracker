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
        elem.textContent = message.includes("|") ? message.split("|")[0] : message;
        elem.innerHTML += '<button style="position: absolute; right:1ch; background-color: var(--secondary)" class="icon small x" type="button" onclick="this.parentElement.remove();"></button>'
        let formhandling = false;
        if (message.startsWith("409: Diese Baureihe") && message.includes("trotzdem löschen?")) {
            const ubid = message.split("|")[1];
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;<form data-api="/api/baureihe/json/remove/" style="display: inline-block"><input name="ubid" value="${ubid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`;
            formhandling = true;
        }
        if (message.startsWith("409: Dieser Account") && message.includes("trotzdem löschen?")) {
            const uuid = message.split("|")[1];
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;<form data-api="/api/nutzer/json/removeAccount/" style="display: inline-block"><input name="uuid" value="${uuid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
            formhandling = true;
        }
        if (message.startsWith("409: Diese Beschreibung") && message.includes("trotzdem löschen?")) {
            const name = message.split("|")[1];
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;<form data-api="/api/beschreibung/json/remove/" style="display: inline-block"><input name="name" value="${name}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
            formhandling = true;
        }
        if (message.includes("Zugbaureihentracker | Anmelden")) {
            document.location = "/public/login?errorMessage=" + encodeURIComponent("Bitte melde dich (erneut) an.");
            return;
        }
        document.body.appendChild(elem);
        setTimeout(() => {
            elem.remove();
        }, 5000);
        if (formhandling) new FormHandler(() => { location.reload(); }, null, document.querySelectorAll(".errorMessage form"));
        
    }

    showSuccess(message: string) {
        const elem = document.createElement("div");
        elem.classList.add("errorMessage");
        elem.textContent = message;
        elem.innerHTML += '<button style="position: absolute; right:1ch; background-color: var(--secondary)" class="icon small x" type="button" onclick="this.parentElement.remove();"></button>'
        elem.style.setProperty("background-color", "var(--green)");
        document.body.appendChild(elem);
        setTimeout(() => {
            elem.remove();
        }, 5000);
    }
}
const messageHandler = new MessageHandler();