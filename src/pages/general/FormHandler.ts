class FormHandler {
    private onsuccess: Function | null;
    private onerror: Function | null;
    constructor(onsuccess: Function | null = null, onerror: Function | null = null, forms: NodeListOf<HTMLFormElement> | null = null) {
        this.onsuccess = onsuccess;
        this.onerror = onerror;
        for (const elem of forms ? forms : document.querySelectorAll("form"))
            elem.addEventListener("submit", this.accountsForm.bind(this));
    }

    private accountsForm(e: Event) {
    e.preventDefault();
    new XHR().post((e.target as HTMLFormElement).getAttribute("data-api") as string, new FormData(e.target as HTMLFormElement), (response: any) => {    
        if (response && response.errorMessage) {
            if (this.onerror) this.onerror();
            messageHandler.showError(response.errorMessage);
        } else if (response && response.successMessage) {
            if (this.onsuccess) this.onsuccess();
            messageHandler.showSuccess(response.successMessage);
        } else {
            if (this.onerror) this.onerror();
            messageHandler.showError(response);
        }
    });
    }
}