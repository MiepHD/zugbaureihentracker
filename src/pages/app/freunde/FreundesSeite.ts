const fill = (data: any) => {
    if (typeof data == "string") messageHandler.showError(data);
    const list = document.querySelector("ul");
    for (const baureihe of data) {
        let users = "";
        for (const user of baureihe.Aktivitaets) {
            users += `<a href="/app/user?uuid=${encodeURIComponent(user.uuid)}">${user.Nutzer.name}</a>, `
        }
        users = users.slice(0, -2);
        const li = document.createElement("li");
        li.innerHTML = `<b><a href="/app/suchergebnis?ubid=${encodeURIComponent(baureihe.ubid)}">${baureihe.ubid}</a></b> <i style="font-size: smaller">durch ${users}</i>`
        list?.appendChild(li);
    }
}

const xhr = new XHR();
xhr.get("/api/freundesliste/json/baureihenvonfreundenabrufen", fill);
