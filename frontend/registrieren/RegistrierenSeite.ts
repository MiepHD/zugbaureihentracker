/* Tim */
document.getElementById('registerForm')?.addEventListener('submit', function (event) {
    const pass1 = (document.getElementById('password') as HTMLInputElement).value;
    const pass2 = (document.getElementById('passwordConfirm') as HTMLInputElement).value;
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage == null) return;
    if (pass1 !== pass2) {
        event.preventDefault();
        errorMessage.textContent = 'Die Passwörter stimmen nicht überein.';
    } else {
        errorMessage.textContent = '';
    }
});