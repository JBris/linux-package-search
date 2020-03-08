const Linux = require("../models/Linux");

exports.search = async (req, res) => {
    return await searchLinuxPackages(req, res, 'search');
};

exports.searchRaw = async (req, res) => {
    return await searchLinuxPackages(req, res, 'searchRaw');

};

exports.view = async (req, res) => {
    return await searchLinuxPackages(req, res, 'view');
};

exports.viewRaw = async (req, res) => {
    return await searchLinuxPackages(req, res, 'viewRaw');
};

searchLinuxPackages = async(req, res, callback) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');
    const cacheManager = req.app.get('cacheManager');

    try {
        const cacheKey = `${callback}-${distribution}-${package}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const cacheResults = await cache.get(cacheKey);
        if(cacheResults) { return res.send(cacheResults); }

        const instance = linuxPackageSearchManager.getDistribution(distribution);
        const result = await instance[callback](package);
        await cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.archiveSearch = async (req, res) => {
    return await searchArchiveLinuxPackages(req, res, 'search');
};

exports.archiveView = async (req, res) => {
    return await searchArchiveLinuxPackages(req, res, 'view');
};

searchArchiveLinuxPackages = async(req, res, callback) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const db = req.app.get('db');
    const cacheManager = req.app.get('cacheManager');

    try {
        const cacheKey = `archive-${callback}-${distribution}-${package}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const cacheResults = await cache.get(cacheKey);
        if(cacheResults) { return res.send(cacheResults); }

        const model = new Linux(db);
        const result = await model[callback](distribution, package);
        await cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.archiveSave = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const db = req.app.get('db');
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');
    const cacheManager = req.app.get('cacheManager');

    try {
        const delViewCacheKey = `archive-view-${distribution}-${package}`;
        const delSearchCacheKey = `archive-search-${distribution}-${package}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const searchInstance = linuxPackageSearchManager.getDistribution(distribution);

        const [result] = await Promise.all([
            searchInstance.view(package),
            cache.delete(delViewCacheKey),
            cache.delete(delSearchCacheKey)
        ]);

        const viewCacheKey = `view-${distribution}-${package}`;
        const model = new Linux(db);
        await Promise.all([
            model.save(distribution, package, result),
            cache.set(viewCacheKey, result, config.NODE_CACHE_LIFETIME),
        ]);

        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.archiveDelete = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const db = req.app.get('db');
    const cacheManager = req.app.get('cacheManager');

    try {
        const delViewCacheKey = `archive-view-${distribution}-${package}`;
        const delSearchCacheKey = `archive-search-${distribution}-${package}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const model = new Linux(db);
        
        const [result] = await Promise.all([
            model.delete(distribution, package),
            cache.delete(delViewCacheKey),
            cache.delete(delSearchCacheKey),
        ]);
        return res.send({status: "deleted", quantity: result});
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });  
    }
};

exports.indexSearch = async (req, res) => {
    const config = req.app.get('config');
    const search = req.app.get('search');
    const cacheManager = req.app.get('cacheManager');
    const query = req.query;
    if(Object.keys(query).length === 0) { return res.send([]); }

    try {
        const queryString = require('url').parse(req.url).query;
        const cacheKey = `index-search-query-${queryString}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const cacheResults = await cache.get(cacheKey);
        if(cacheResults) { return res.send(cacheResults); }

        const indexSearchCacheKey = "index-search-history-map";
        const [rawResults, indexSearchQueryCache ] = await Promise.all([
            search.search(config.NODE_ELASTICSEARCH_INDEX, query),
            cache.get(indexSearchCacheKey),
        ]); 

        const hits = rawResults.body.hits.hits;
        result = [];
        hits.forEach(hit => result.push(hit._source));

        let indexSearchQueryMap;
        if(indexSearchQueryCache) {
            indexSearchQueryMap = JSON.parse(indexSearchQueryCache);
            indexSearchQueryMap[cacheKey] = true;
        } else {
            indexSearchQueryMap = {};
            indexSearchQueryMap[cacheKey] = true;
        }
        
        await Promise.all([
            cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME),
            cache.set(indexSearchCacheKey, JSON.stringify(indexSearchQueryMap), config.NODE_CACHE_LIFETIME)
        ]); 
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.indexSave = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const search = req.app.get('search');
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');
    const cacheManager = req.app.get('cacheManager');

    try {
        const indexSearchCacheKey = "index-search-history-map";
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const searchInstance = linuxPackageSearchManager.getDistribution(distribution);

        const [result, indexSearchQueryCache] = await Promise.all([
            searchInstance.view(package),
            cache.get(indexSearchCacheKey),
        ]);

        const viewCacheKey = `view-${distribution}-${package}`;
        let promises = [
            search.index(config.NODE_ELASTICSEARCH_INDEX, distribution, package, result),
            cache.set(viewCacheKey, result, config.NODE_CACHE_LIFETIME),
            cache.delete(indexSearchCacheKey),
        ];

        if(indexSearchQueryCache) {
            const indexSearchQueryMap = JSON.parse(indexSearchQueryCache);
            Object.keys(indexSearchQueryMap).forEach(key => promises.push(cache.delete(key)));
        } 

        await Promise.all(promises);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.indexDelete = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const search = req.app.get('search');
    const cacheManager = req.app.get('cacheManager');

    try {
        const indexSearchCacheKey = "index-search-history-map";
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        
        const [result, indexSearchQueryCache] = await Promise.all([
            search.delete(config.NODE_ELASTICSEARCH_INDEX, distribution, package),
            cache.get(indexSearchCacheKey),
        ]);

        let promises = [ cache.delete(indexSearchCacheKey) ];
        if(indexSearchQueryCache) {
            const indexSearchQueryMap = JSON.parse(indexSearchQueryCache);
            Object.keys(indexSearchQueryMap).forEach(key => promises.push(cache.delete(key)));
        } 
        await Promise.all(promises);
        
        return res.send({status: "deleted", quantity: result.body.deleted});
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });  
    }
};