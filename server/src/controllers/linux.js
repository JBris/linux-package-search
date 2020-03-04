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

exports.archiveView = async (req, res) => {

};

exports.archiveSave = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const config = req.app.get('config');
    const db = req.app.get('db');
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');
    const cacheManager = req.app.get('cacheManager');

    try {
        const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
        const delCacheKey = `archive-${distribution}-${package}`;
        const searchInstance = linuxPackageSearchManager.getDistribution(distribution);

        const [result] = await Promise.all([
            searchInstance.view(package),
            cache.delete(delCacheKey)
        ]);

        const viewCacheKey = `view-${distribution}-${package}`;
        const model = new Linux(db);
        await Promise.all([
            modelSave = model.save(distribution, package, result),
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

};
