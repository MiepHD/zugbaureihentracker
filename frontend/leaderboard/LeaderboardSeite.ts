let uuid = "";
const fill2 = (data: any) => {
    if (typeof data == "string") showError(data);
    const table = document.getElementById("leaderboard");
    for (const user of data) {
          const li = document.createElement("li");
          li.innerHTML = `<a href="/user?uuid=${encodeURIComponent(user.uuid)}">${user.name}</a> mit <i>${user.score}</i> Baureihen ${user.uuid == uuid ? "" : `<form action="/api/entferneFreund" method="post" style="display:inline-block"><input name="uuid" value="${user.uuid}" style="display: none;"><button>Freund entfernen</button></form>`}`
          table?.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const xhr2 = new XHR();
  xhr2.get("/api/getUUID", (response: string) => {
    (document.getElementById("uuid") as HTMLElement).textContent = `UUID: ${response}`;
    uuid = response;
    const xhr = new XHR();
    xhr.get("/api/getFriendsLeaderboard", fill2);
  });
});
