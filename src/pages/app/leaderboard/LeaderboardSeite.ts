class LeaderboardSeite {
    private uuid: string = "";
    constructor() {
        new XHR().get("/api/nutzer/raw/getUUID", (response: string) => {
            this.uuid = response;
            this.update();
        });
    }
    update() {
        new XHR().get("/api/freundesliste/json/getranking", this.fill.bind(this));
    }
    fill(data: any) {
        if (typeof data == "string") messageHandler.showError(data);
        const table = document.getElementById("leaderboard") as HTMLElement;
        table.innerHTML = "";
        for (const user of data) {
            const li = document.createElement("li");
            li.innerHTML = `
                <a href="/app/user?uuid=${encodeURIComponent(user.uuid)}">${user.name}</a> mit <i>${user.score}</i> Baureihen
                ${user.uuid == this.uuid ? "" : `
                    <form data-api="/api/freundesliste/json/remove" style="display:inline-block">
                        <input name="uuid" value="${user.uuid}" style="display: none;">
                        <button aria-label="entfernen" class="icon userminus small"></button>
                    </form>
                `}
            `;
            table?.appendChild(li);
        }
        new FormHandler(this.update.bind(this), this.update.bind(this), document.querySelectorAll("#leaderboard form"));
    }
}
new LeaderboardSeite();
