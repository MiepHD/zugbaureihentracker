class XHR {
    private xhr: XMLHttpRequest;
    constructor() {
        this.xhr = new XMLHttpRequest();
    }
    
    get(endpoint: string, callback: (response: any) => void) {
        this.xhr.open('GET', endpoint, true);
        this.xhr.setRequestHeader('Accept', 'application/json');
        this.handleAnswer(callback);
        this.xhr.send();
    }

    post(endpoint: string, data: any, callback: (response: any) => void) {
        this.xhr.open('POST', endpoint, true);
        this.xhr.setRequestHeader('Accept', 'application/json');
        
        this.handleAnswer(callback);
        
        this.xhr.send(data instanceof FormData ? data : JSON.stringify(data));
    }

    private handleAnswer(callback: (response: any) => void) {
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            let response = null;
            if (this.xhr.status == 0) {
                response = "0: Der Server ist nicht erreichbar.";
            } else {
                try {
                    response = JSON.parse(this.xhr.responseText);
                } catch {
                    response = this.xhr.responseText;
                }
            }
            callback(response);
        };
    }
}

  