const LinuxPackageSearchManager = require("../src/services/linux/LinuxPackageSearchManager"); 
const CacheManager = require("../src/services/cache/CacheManager"); 

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
      if(cacheResults) { 
        for (let i = 0; i < quantity; i++){
          console.info(cacheResults[i]);
        }
        return;
      }

      const instance = linuxPackageSearchManager.getDistribution(distribution);
      const result = await instance[callback](package);
      await cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME);
      for (let i = 0; i < quantity; i++){
        console.info(result[i]);
      }
  } catch(e) {
      console.error(e);
  }
};