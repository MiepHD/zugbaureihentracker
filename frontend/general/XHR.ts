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
        // Teilt dem Server mit, dass wir JSON senden und erwarten
        this.xhr.setRequestHeader('Content-Type', 'application/json');
        this.xhr.setRequestHeader('Accept', 'application/json');
        
        this.handleAnswer(callback);

        if (data instanceof FormData) {
            const newdata: Record<string, any> = {};
            data.forEach((value, key) => {
                newdata[key] = value;
            });
            data = newdata;
        }
        
        this.xhr.send(JSON.stringify(data));
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

  