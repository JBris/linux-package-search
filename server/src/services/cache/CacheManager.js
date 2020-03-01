class CacheManager {
    
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

    getCacheIds() {
        return Object.keys(this.providers)
    }

    getCaches() {
        return Object.values(this.providers)
    }

    getCache(id) {
        const instance = this.providers[id];
        if (typeof instance === 'undefined') {
            throw `Cache backend '${id}' is unsupported.`;
        }
        return instance;
    }

    setCache(id, cache) {
        this.providers[id] = cache;
        return this;
    }
}

module.exports = CacheManager;