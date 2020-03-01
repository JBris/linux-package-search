const LinuxPackageSearchBase = require('./LinuxPackageSearchBase');

class Fedora extends LinuxPackageSearchBase {
    _rowsPerPage = 500;
    
    constructor() {
        super();
        this._id = 'fedora';
        this._name = 'Fedora';
        this._url = 'https://apps.fedoraproject.org/packages/fcomm_connector';
    }

    getRowsPerPage(){
        return this._rowsPerPage;
    }

    setRowsPerPage(rowsPerPage){
        this._rowsPerPage = rowsPerPage;
        return this;
    }

    async searchRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const search = {
            filters: {
                search: linuxPackage,
            },
            rows_per_page: this.getRowsPerPage(),
            start_row: 0,
        };
        const searchString = JSON.stringify(search);
        const results = await this.get(`${url}/xapian/query/search_packages/${searchString}`);
        return results;
    }

    async search(linuxPackage) {
        const packages = await this.searchRaw(linuxPackage);
        let results = [];
        if(!Array.isArray(packages.rows)) { return results; }
        const rows = packages.rows ;
        rows.forEach(row => results.push(row.name));
        return results;
    }

    async viewRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const search = {
            filters: {
                package: linuxPackage,
            },
            rows_per_page: this.getRowsPerPage(),
            start_row: 0,
        };         
        const searchString = JSON.stringify(search);
        const results = await this.get(`${url}/koji/query/query_builds/${searchString}`);
        return results;
    }

    async view(linuxPackage) {
        const info = await this.viewRaw(linuxPackage);
        let results = []; 
        if(!Array.isArray(info.rows)) { return results; }
        const rows = info.rows;
        rows.forEach(row => {
            let result = {};
            result.name = row.package_name;
            result.displayName = row.nvr;
            result.version = row.version;
            result.additionalProperties = {};
            result.additionalProperties.source = row.source;
            result.additionalProperties.release = row.release;
            result.additionalProperties.owner = row.owner_name;
            result.additionalProperties.creationTime = row.creation_ts;
            results.push(result)
        });
        return results;
     }
}

const instance = new Fedora();
module.exports = instance;