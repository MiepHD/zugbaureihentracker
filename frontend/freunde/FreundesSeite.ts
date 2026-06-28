const fill = (data: any) => {
    if (typeof data == "string") showError(data);
    const list = document.querySelector("ul");
    for (const baureihe of data) {
        let users = "";
        for (const user of baureihe.Aktivitaets) {
            users += `${user.Nutzer.name}, `
        }
        users = users.slice(0, -2);
        const li = document.createElement("li");
        li.innerHTML = `<b>${baureihe.ubid}</b> <i style="font-size: smaller">durch ${users}</i>`
        list?.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const xhr = new XHR();
  xhr.get("/api/baureihenVonFreundenAbrufen", fill);
});
