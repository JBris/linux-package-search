const LinuxPackageSearchManager = require("../src/services/linux/LinuxPackageSearchManager"); 
const CacheManager = require("../src/services/cache/CacheManager"); 
const Linux = require("../src/models/Linux");
const db = require("../src/services/database/db");
const Search = require("../src/services/search/Search");

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

exports.indexSearch = async (rawQuery, config, quantity)  => {
  if (rawQuery.length === 0) { return console.error("Must provide query arguments. Use the format (key=value key=value...)."); }

  let query = {};
  let queryString = '';

  rawQuery.forEach(rawQuery => {
    const splitRawQuery = rawQuery.split(/=(.+)/);
    if(splitRawQuery.length < 2) { return; }
    query[splitRawQuery[0]] = splitRawQuery[1];
    queryString += encodeURIComponent(splitRawQuery[0]) + '=' + encodeURIComponent(splitRawQuery[1]) + '&';
  });

  if(Object.keys(query).length === 0) { return console.error("Must provide valid query arguments. Use the format (key=value key=value...)."); }
  queryString = queryString.slice(0, -1);
  
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const search = new Search(config);

  try {
      const cacheKey = `index-search-query-${queryString}`;
      const cache = cacheManager.getCache(config.NODE_CACHE_BACKEND);
      const cacheResults = await cache.get(cacheKey);

      const closeAll = async() => {
         Promise.all([
          search.close(),
          cache.close(),
        ]);
      };

      if(cacheResults) { 
        if(cacheResults.length === 0) { 
          await closeAll();
          return console.info(`No results found for search.`);
        }

        if(quantity > cacheResults.length) { quantity = cacheResults.length; }
        for (let i = 0; i < quantity; i++){
          console.info(cacheResults[i]);
        }
        await closeAll();
        return;
      } 

      const indexSearchCacheKey = "index-search-history-map";
      const [rawResults, indexSearchQueryCache ] = await Promise.all([
          search.search(config.NODE_ELASTICSEARCH_INDEX, query),
          cache.get(indexSearchCacheKey),
      ]); 

      const hits = rawResults.body.hits.hits;
      let result = [];
      hits.forEach(hit => result.push(hit._source));

      let indexSearchQueryMap;
      if(indexSearchQueryCache) {
          indexSearchQueryMap = JSON.parse(indexSearchQueryCache);
      } else {
          indexSearchQueryMap = {};
      }
      indexSearchQueryMap[cacheKey] = true;

      await Promise.all([
        cache.set(cacheKey, result, config.NODE_CACHE_LIFETIME),
        cache.set(indexSearchCacheKey, JSON.stringify(indexSearchQueryMap), config.NODE_CACHE_LIFETIME)
      ]);
      
      await closeAll();
      if(result.length === 0) { return console.info(`No results found for search.`); }
      if(quantity > result.length) { quantity = result.length; }
      for (let i = 0; i < quantity; i++){
        console.info(result[i]);
      }
  } catch(e) {
      console.error(e);
  }
};

exports.indexSave = async (distribution, package, quantity, config) => {
  const linuxPackageSearchManager = new LinuxPackageSearchManager(config.LINUX_SEARCH_PROVIDERS);
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const search = new Search(config);

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

    await Promise.all([
      search.close(),
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

exports.indexDelete = async (distribution, package, config) => {
  const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
  const search = new Search(config);

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
    await Promise.all([
      search.close(),
      cache.close(),
    ]);

    return console.info({status: "deleted", quantity: result.body.deleted});
  } catch(e) {
    console.error(e);
  }
};
