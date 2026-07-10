const fill3 = (data: any) => {
    const xhr2 = new XHR();
    xhr2.get("/api/nutzer/raw/getUUID", (response: string) => {
        if (typeof data == "string") messageHandler.showError(data);
        const table = document.getElementById("leaderboard");
        for (const user of data) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="/user?uuid=${encodeURIComponent(user.uuid)}">${user.name}</a> mit <i>${user.score}</i> Baureihen ${user.uuid == response ? "" : `<form action="/api/freundesliste/web/remove" method="post" style="display:inline-block"><input name="uuid" value="${user.uuid}" style="display: none;"><button aria-label="entfernen" class="icon userminus small"></button></form>`}`
            table?.appendChild(li);
        }
    });
}

const xhr4 = new XHR();
xhr4.get("/api/freundesliste/json/getranking", fill3);
