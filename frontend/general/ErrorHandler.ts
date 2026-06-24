let param = location.href.split('?')[1];
let query = new URLSearchParams(param);
const error = query.get("errorMessage");

if (error) {
    const elem = document.createElement("div");
    elem.classList.add("errorMessage");
    elem.textContent = error;
    document.body.appendChild(elem);
}