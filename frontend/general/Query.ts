class Query {
    param: string;
    private query: URLSearchParams;
    constructor() {
        this.param = location.href.split('?')[1];
        this.query = new URLSearchParams(this.param);
    }

    get(key: string): string | null {
        return this.query.get(key);
    }
}
const query = new Query();