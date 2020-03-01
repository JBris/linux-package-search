const LinuxPackageSearchBase = require('./LinuxPackageSearchBase');

class Debian extends LinuxPackageSearchBase {
        
    constructor() {
        super();
        this._id = 'debian';
        this._url = 'https://sources.debian.org/api';
    }

    async searchRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const results = await this.get(`${url}/search/${linuxPackage}`);
        return results;
    }

    async search(linuxPackage) {
        const packages = await this.searchRaw(linuxPackage);
        let results = [];
        if(typeof packages.results === 'undefined') { return results; }
        const packageResults = packages.results ;

        if(packageResults.exact && packageResults.exact.name) {
            results.push(packageResults.exact.name);
        }
        if(!Array.isArray(packageResults.other)) { return results; }
        packageResults.other.forEach(packageResult => results.push(packageResult.name));
        return results;
    }

    async viewRaw(linuxPackage) {
        if (linuxPackage === '') { return {}; }
        const url = this.getUrl();
        const results = await this.get(`${url}/src/${linuxPackage}`);
        return results;
    }

    async view(linuxPackage) {
        const info = await this.viewRaw(linuxPackage);
        let results = [];
        if(!Array.isArray(info.versions)) { return results; }
        const versions = info.versions ;
        versions.forEach(version => {
            version.name = info.package;
            version.displayName = `${version.name}-${version.version}`;
            results.push(version); 
        });
        return results;
    }
}

const instance = new Debian();
module.exports = instance;