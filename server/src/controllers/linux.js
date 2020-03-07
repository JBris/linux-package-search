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

    try {
        const cacheKey = `index-search-${req.url}`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const cacheResults = await cache.get(cacheKey);
        if(cacheResults) { return res.send(cacheResults); }

        if(Object.keys(query).length === 0) { return res.send([]); }
        const rawResults = await search.search(config.NODE_ELASTICSEARCH_INDEX, query);
        const hits = rawResults.body.hits.hits;
        result = [];
        hits.forEach(hit => result.push(hit._source));
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

exports.indexSave = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const search = req.app.get('search');
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');
    const cacheManager = req.app.get('cacheManager');

    try {
        const delSearchCacheKey = `index-search-*`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const searchInstance = linuxPackageSearchManager.getDistribution(distribution);

        const [result] = await Promise.all([
            searchInstance.view(package),
            cache.delete(delSearchCacheKey)
        ]);

        const viewCacheKey = `view-${distribution}-${package}`;
        await Promise.all([
            search.index(config.NODE_ELASTICSEARCH_INDEX, distribution, package, result),
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

exports.indexDelete = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const search = req.app.get('search');
    const cacheManager = req.app.get('cacheManager');

    try {
        const delSearchCacheKey = `index-search-*`;
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        
        const [result] = await Promise.all([
            search.delete(config.NODE_ELASTICSEARCH_INDEX, distribution, package),
            cache.delete(delSearchCacheKey),
        ]);
        return res.send({status: "deleted", quantity: result.body.deleted});
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });  
    }
};