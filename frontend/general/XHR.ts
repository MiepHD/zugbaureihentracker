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

    post(endpoint: string, data: any, callback: Function) {
        this.xhr.open('POST', endpoint, true);
        // Teilt dem Server mit, dass wir JSON senden und erwarten
        this.xhr.setRequestHeader('Content-Type', 'application/json');
        this.xhr.setRequestHeader('Accept', 'application/json');
        
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            let response = null;
            response = this.xhr.responseURL;
            
            callback(response);
        };
        
        // Wandelt das Objekt in einen String um und sendet es im Request-Body
        this.xhr.send(JSON.stringify(data));
    }
}

  