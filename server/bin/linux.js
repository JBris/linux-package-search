const LinuxPackageSearchManager = require("../src/services/linux/LinuxPackageSearchManager"); 
const CacheManager = require("../src/services/cache/CacheManager"); 
const Linux = require("../src/models/Linux");
const db = require("../src/services/database/db");

exports.search = async(distribution, package, quantity, config) => {
  return await searchLinuxPackages('search', distribution, package, quantity, config);
};

exports.view = async(distribution, package, quantity, config) => {
  return await searchLinuxPackages('view', distribution, package, quantity, config);
};

searchLinuxPackages = async(callback, distribution, package, quantity, config) => {
  const linuxPackageSearchManager = new LinuxPackageSearchManager(config.LINUX_SEARCH_PROVIDERS);
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);

  try {
      const cacheKey = `${callback}-${distribution}-${package}`;
      const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
      const cacheResults = await cache.get(cacheKey);
      let result;
      if(cacheResults) { 
        result = cacheResults;
      } else {
        const instance = linuxPackageSearchManager.getDistribution(distribution);
        result = await instance[callback](package);
        await cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME);
      }
      await cache.close();

      if(result.length === 0) { return console.info(`No results found for ${distribution}:${package}`); }
      if(quantity > result.length) { quantity = result.length; }
      for (let i = 0; i < quantity; i++){
        console.info(result[i]);
      }
  } catch(e) {
      console.error(e);
  }
};

exports.archiveSearch = async (distribution, package, quantity, config) => {
  return await searchArchiveLinuxPackages('search', distribution, package, quantity, config);
};

exports.archiveView = async (distribution, package, quantity, config)  => {
  return await searchArchiveLinuxPackages('view', distribution, package, quantity, config);
};

searchArchiveLinuxPackages = async(callback, distribution, package, quantity, config) => {
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const connection = db.getClient(config);

  try {
      const cacheKey = `archive-${callback}-${distribution}-${package}`;
      const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
      const cacheResults = await cache.get(cacheKey);

      let result;
      if(cacheResults) { 
        result = cacheResults;
      } else {
        const model = new Linux(connection);
        result = await model[callback](distribution, package);
        await cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME);
      }

      await Promise.all([
        connection.destroy(),
        cache.close(),
      ]);

      if(result.length === 0) { return console.info(`No results found for ${distribution}:${package}`); }
      if(quantity > result.length) { quantity = result.length; }
      for (let i = 0; i < quantity; i++){
        console.info(result[i]);
      }
    } catch(e) {
      console.error(e);
  }
};

exports.archiveSave = async (distribution, package, quantity, config) => {
  const linuxPackageSearchManager = new LinuxPackageSearchManager(config.LINUX_SEARCH_PROVIDERS);
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const connection = db.getClient(config);

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
      const model = new Linux(connection);
      await Promise.all([
          model.save(distribution, package, result),
          cache.set(viewCacheKey, result, config.NODE_CACHE_LIFETIME),
      ]);

      await Promise.all([
        connection.destroy(),
        cache.close(),
      ]);

      if(result.length === 0) { return console.info(`No results found for ${distribution}:${package}`); }
      if(quantity > result.length) { quantity = result.length; }
      for (let i = 0; i < quantity; i++){
        console.info(result[i]);
      }
    } catch(e) {
      console.error(e);
  }
};

exports.archiveDelete = async (distribution, package, config) => {
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const connection = db.getClient(config);

  try {
      const delViewCacheKey = `archive-view-${distribution}-${package}`;
      const delSearchCacheKey = `archive-search-${distribution}-${package}`;
      const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
      const model = new Linux(connection);
      
      const [result] = await Promise.all([
          model.delete(distribution, package),
          cache.delete(delViewCacheKey),
          cache.delete(delSearchCacheKey),
      ]);

      await Promise.all([
        connection.destroy(),
        cache.close(),
      ]);
      
      console.info({status: "deleted", quantity: result});
    } catch(e) {
      console.error(e);
  }
};
