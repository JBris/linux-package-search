const NodeCache = require("node-cache");
const CacheBase = require("./CacheBase");

class Memory extends CacheBase {
    constructor() {
        super();
        this._id = 'memory';
        this._cache = new NodeCache({ checkperiod: 1200 });
    }

    async get(key) {
        const value = this.getCache().get( key );
        return value;
    }

    async set(key, value, lifetime = 0) {
        this.getCache().set( key, value, lifetime );
        return this;
    }

}

const instance = new Memory();
module.exports = instance;