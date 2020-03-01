const LinuxPackageSearchBase = require('./LinuxPackageSearchBase');

class Ubuntu extends LinuxPackageSearchBase {
        
    constructor() {
        super();
        this._id = 'ubuntu';
        this._name = 'Ubuntu';
        this._url = 'https://api.launchpad.net/1.0/ubuntu/+archive/primary';
        this._rowsPerPage = 300;
    }

    async searchRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const rowsPerPage = this.getRowsPerPage();
        const searchParams = new URLSearchParams([
            ['ws.op', 'getPublishedSources'], 
            ['exact_match', 'false'],
            ['source_name', linuxPackage],
            ['ws.size', rowsPerPage],
            ['ordered', "false"],
            ['ws.start', "0"],
        ]); 

        const initialResponse = await this.get(url, searchParams);
        if(typeof initialResponse.total_size === 'undefined') { return [ initialResponse ]; }
        const remainingResults = initialResponse.total_size - rowsPerPage;
        if(remainingResults <= 0) { return [ initialResponse ]; }
        
        let promises = [];
        const index = Math.floor(remainingResults / rowsPerPage);

        let resultsPerResponse = rowsPerPage;
        for (let i = index; i >= 0; i--) {
            const searchParams = new URLSearchParams([
                ['ws.op', 'getPublishedSources'], 
                ['exact_match', 'false'],
                ['source_name', linuxPackage],
                ['ws.size', rowsPerPage],
                ['ordered', "false"],
                ['ws.start', resultsPerResponse],
                ['memo', resultsPerResponse],
            ]); 
            promises.push(this.get(url, searchParams));
            resultsPerResponse += rowsPerPage;
        }
        let results = await Promise.all(promises);
        results.unshift(initialResponse);
        return results;
    }

    async search(linuxPackage) {
        const packagesList = await this.searchRaw(linuxPackage);
        let results = {};
        if(!Array.isArray(packagesList)) { return results; }
        if(packagesList.length === 0) { return results; }

        for(let packages of packagesList) {
            if (!Array.isArray(packages.entries)) { continue; }
            const entries = packages.entries;
            entries.forEach(entry => results[entry.source_package_name] = true);
        }
        const uniqueEntries = Object.keys(results);
        return uniqueEntries;
    }

    async viewRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const rowsPerPage = this.getRowsPerPage();
        const searchParams = new URLSearchParams([
            ['ws.op', 'getPublishedSources'], 
            ['exact_match', 'true'],
            ['source_name', linuxPackage],
            ['ws.size', rowsPerPage],
            ['ordered', "false"],
            ['ws.start', "0"],
        ]); 

        const initialResponse = await this.get(url, searchParams);
        if(typeof initialResponse.total_size === 'undefined') { return [ initialResponse ]; }
        const remainingResults = initialResponse.total_size - rowsPerPage;
        if(remainingResults <= 0) { return [ initialResponse ]; }
        
        let promises = [];
        const index = Math.floor(remainingResults / rowsPerPage);

        let resultsPerResponse = rowsPerPage;
        for (let i = index; i >= 0; i--) {
            const searchParams = new URLSearchParams([
                ['ws.op', 'getPublishedSources'], 
                ['exact_match', 'false'],
                ['source_name', linuxPackage],
                ['ws.size', rowsPerPage],
                ['ordered', "false"],
                ['ws.start', resultsPerResponse],
                ['memo', resultsPerResponse],
            ]); 
            promises.push(this.get(url, searchParams));
            resultsPerResponse += rowsPerPage;
        }
        let results = await Promise.all(promises);
        results.unshift(initialResponse);
        return results;
    }

    async view(linuxPackage) {
        const infoList = await this.viewRaw(linuxPackage);
        let results = [];
        if(!Array.isArray(infoList)) { return results; }
        if(infoList.length === 0) { return results; } 
      
        for(let info of infoList) {
            if (!Array.isArray(info.entries)) { continue; }
            const entries = info.entries;
            entries.forEach(entry => {
                let result = {};
                result.name = entry.source_package_name;
                result.displayName = entry.display_name;
                result.version = entry.source_package_version;
                result.additionalProperties = {};
                result.additionalProperties.status = entry.status;
                result.additionalProperties.publishDate = entry.date_published;
                result.additionalProperties.dateRemoved = entry.date_removed;
                results.push(result);
            });
        }
        return results;
    }
}
 
const instance = new Ubuntu();
module.exports = instance;