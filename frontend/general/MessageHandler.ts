let param = location.href.split('?')[1];
let query = new URLSearchParams(param);
const error = query.get("errorMessage");

function showError(message: string) {
    const elem = document.createElement("div");
    elem.classList.add("errorMessage");
    elem.textContent = message;
    if (message.startsWith("Baureihe") && message.includes("Trotzdem löschen?")) {
        const ubid = query.get("ubid");
        elem.innerHTML += `<form action="/api/removeBaureihe/" method="post" style="display: inline-block"><input name="ubid" value="${ubid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
    }
    if (message.startsWith("Account") && message.includes("Trotzdem löschen?")) {
        const uuid = query.get("uuid");
        elem.innerHTML += `<form action="/api/removeAccount/" method="post" style="display: inline-block"><input name="uuid" value="${uuid}" style="display: none" /><input name="force" value="true" style="display: none"/><button>Ja, wirklich löschen</button></form>`
    }
    if (message.includes("Zugbaureihentracker | Anmelden")) {
        document.location = "/login?errorMessage=" + encodeURIComponent("Bitte melde dich (erneut) an.");
        return;
    }
    document.body.appendChild(elem);
}
if (error) showError(error);

let paramS = location.href.split('?')[1];
let queryS = new URLSearchParams(paramS);
const success = queryS.get("successMessage");

function showSuccess(message: string) {
    const elem = document.createElement("div");
    elem.classList.add("errorMessage");
    elem.textContent = message;
    elem.style.setProperty("background-color", "lightgreen");
    document.body.appendChild(elem);
}
if (success) showSuccess(success);