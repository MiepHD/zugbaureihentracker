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