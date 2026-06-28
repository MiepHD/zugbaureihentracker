const fill = (data: any) => {
    if (typeof data == "string") showError(data);
    const list = document.querySelector("ul");
    for (const user of data) {
        for (const baureihe of user.Aktivitaets) {
            const li = document.createElement("li");
            li.innerHTML = `<b>${baureihe.ubid}</b> <i style="font-size: smaller">durch ${user.name}</i>`
            list?.appendChild(li);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const xhr = new XHR();
  xhr.get("/api/baureihenVonFreundenAbrufen", fill);
});
