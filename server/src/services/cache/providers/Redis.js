const redis = require("redis");
const { promisify } = require("util");
const CacheBase = require("./CacheBase");

class Redis extends CacheBase {
    constructor() {
        super();
        this._id = 'redis';
        redis.addCommand("json.get");
        redis.addCommand("json.set");
        this._cache = redis.createClient({
            host:  process.env.NODE_REDIS_HOST || "127.0.0.1",
            port:  process.env.NODE_REDIS_PORT || "6379",
        });
        this._cache.getAsync = promisify(this._cache.get).bind(this._cache);
        this._cache.setAsync = promisify(this._cache.set).bind(this._cache);
    }

    async get(key) {
        const value = await this.getCache().getAsync(key);
        const deserializedValue = JSON.parse(value);
        return deserializedValue;
    }

    async set(key, value, lifetime = 0) {
        const serializedValue = JSON.stringify(value, null);
        await this.getCache().setAsync(key, serializedValue, 'EX', lifetime);
        return this;
    }
}

const instance = new Redis();
module.exports = instance;