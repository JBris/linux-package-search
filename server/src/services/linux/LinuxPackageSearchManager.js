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

    getDistribution(distribution) {
        const instance = this.providers[distribution];
        if (typeof instance === 'undefined') {
            throw `Distribution '${distribution}' is unsupported.`;
        }
        return instance;
    }

    setDistribution(id, distribution) {
        this.providers[id] = distribution;
        return this;
    }
}

module.exports = LinuxPackageSearchManager;