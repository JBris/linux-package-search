const httpClient = require("../../http/client");

class LinuxPackageSearchBase {
    _id = '';    
    _name = '';    
    _url = '';
    _httpClient = {};
    _rowsPerPage = 0;

    constructor() {
        this._httpClient = httpClient;

        if (new.target === LinuxPackageSearchBase) {
            throw new TypeError("Type 'LinuxPackageSearchBase' cannot be instantiated directly.");
        }
    }

    getId() {
        return this._id;
    }

    getName() {
        return this._name
    }

    getUrl() {
        return this._url;
    }

    getClient() {
        return this._httpClient;
    }

    getRowsPerPage(){
        return this._rowsPerPage;
    }

    setRowsPerPage(rowsPerPage){
        this._rowsPerPage = rowsPerPage;
        return this;
    }

    async get(url, searchParams = {}) {
        return this.getClient().get(url, searchParams);
    }

    async searchRaw(linuxPackage) {
        throw new TypeError("Method 'searchRaw()' has not been implemented.");
    }

    async search(linuxPackage) {
        throw new TypeError("Method 'search()' has not been implemented.");
    }

    async viewRaw(linuxPackage) {
        throw new TypeError("Method 'viewRaw()' has not been implemented.");
    }

    async view(linuxPackage) {
        throw new TypeError("Method 'view()' has not been implemented.");
    }
}

module.exports = LinuxPackageSearchBase;