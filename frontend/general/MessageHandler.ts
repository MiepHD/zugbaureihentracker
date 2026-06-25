let param = location.href.split('?')[1];
let query = new URLSearchParams(param);
const error = query.get("errorMessage");

function showError(message: string) {
    const elem = document.createElement("div");
    elem.classList.add("errorMessage");
    elem.textContent = message;
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