class CacheBase {
    _id = '';    
    _cache = {};

    constructor() {
        if (new.target === CacheBase) {
            throw new TypeError("Type 'CacheBase' cannot be instantiated directly.");
        }
    }

    getId() {
        return this._id;
    }

    getCache(){
        return this._cache;
    }

    async get(key) {
        throw new TypeError("Method 'get()' has not been implemented.");
    }

    async set(key, value, lifetime = 0) {
        throw new TypeError("Method 'set()' has not been implemented.");
    }

    async close() {}
}

module.exports = CacheBase;