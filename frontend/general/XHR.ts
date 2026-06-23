class XHR {
    private xhr: XMLHttpRequest;
    constructor() {
        this.xhr = new XMLHttpRequest();
    }
    
    get(endpoint: string, callback: Function) {
        this.xhr.open('GET', endpoint, true);
        this.xhr.setRequestHeader('Accept', 'application/json');
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (this.xhr.status !== 200) {
            return;
            }
            let response = null;
            try {
                response = JSON.parse(this.xhr.responseText);
            } catch {
                response = this.xhr.responseText;
            }
            
            callback(response);
        };
        this.xhr.send();
    }
}

  