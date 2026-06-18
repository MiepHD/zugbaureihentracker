// Testdatenbank von Christoph
const users = [
    {
        email: "max@example.com",
        password: "Max123"
    },
    {
        email: "anna@example.com",
        password: "Anna456"
    },
    {
        email: "tom@example.com",
        password: "Tom789"
    },
    {
        email: "lisa@example.com",
        password: "Lisa321"
    },
    {
        email: "paul@example.com",
        password: "Paul654"
    }
];

// Login-Funktion
function login() {

    const email = (document.getElementById("e-mail(account-search)") as HTMLInputElement).value;
    const password = (document.getElementById("password(account-search)") as HTMLInputElement).value;

    const user = users.find(
        u => u.email === email &&
            u.password === password
    );

    if (user) {
        alert("Login erfolgreich! Willkommen " + user.email);
    } else {
        alert("E-Mail oder Passwort falsch.");
    }
}