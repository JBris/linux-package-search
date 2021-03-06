class LinuxPackageSearchManager {
    
    providers = {};

    constructor(providers) {
        this.providers = providers;
    }

    getProviders() {
        return this.providers;
    }

    setProviders(providers) {
        this.providers = providers;
        return this;
    }

    getDistributionIds() {
        return Object.keys(this.providers)
    }

    getDistributions() {
        return Object.values(this.providers)
    }

    getDistribution(id) {
        const instance = this.providers[id];
        if (typeof instance === 'undefined') {
            throw `Distribution '${id}' is unsupported.`;
        }
        return instance;
    }

    setDistribution(id, distribution) {
        this.providers[id] = distribution;
        return this;
    }
}

module.exports = LinuxPackageSearchManager;