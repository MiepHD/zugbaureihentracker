/**
 * Christoph
 */
let paramString = urlString.split('?')[1];
let queryString = new URLSearchParams(paramString);
const ubid = queryString.entries()[0][1];