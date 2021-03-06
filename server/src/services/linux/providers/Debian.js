const LinuxPackageSearchBase = require('./LinuxPackageSearchBase');

class Debian extends LinuxPackageSearchBase {
        
    constructor() {
        super();
        this._id = 'debian';
        this._name = 'Debian';
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
        const versions = info.versions;
        versions.forEach(version => {
            let result = {};
            result.name = info.package;
            result.displayName = `${result.name}-${version.version}`;
            result.version = version.version;
            result.additionalProperties = {};
            result.additionalProperties.area = version.area;
            result.additionalProperties.suites = version.suites;
            results.push(result)
        });
        return results;
    }
}
 
const instance = new Debian();
module.exports = instance;