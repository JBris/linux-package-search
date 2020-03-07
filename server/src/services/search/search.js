const { Client } = require('@elastic/elasticsearch')

class Search {
    
    _client = {};

    constructor(config) {
        this._client = new Client({ 
            node: config.NODE_ELASTICSEARCH_HOST,
            maxRetries: 5,
            requestTimeout: 60000,
            sniffOnStart: true, 
        });
    }

    getClient() {
        return this._client;
    }

    async search(index, query) {
        let mustQuery = [];
        let shouldQuery = [];

        const mustQueryKeyCheck = (key) => {
            if (typeof query[key] !== 'undefined') {
                mustQuery.push({
                    match: { [key]: query[key] }
                });
                delete query[key];
            }
        };
        mustQueryKeyCheck('distribution');
        mustQueryKeyCheck('package');
        
        Object.keys(query).forEach(key => shouldQuery.push({
            match: { [key]: query[key] }
        }));

        return this.getClient().search({
            index: `${index}-*`,
            body: {
                query: { 
                    bool: {
                        must: mustQuery,
                        should: shouldQuery,
                    }
                }
            }
        })
    };

    async index(index, distribution, linuxPackage, results) {
        let body = [];
        results.forEach(result => {
            body.push({
                index: {
                  _index: `${index}-${distribution}`,
                  _id: result.displayName,
                }
            }); 
            result.distribution = distribution;
            result.package = linuxPackage;
            body.push(result);
        });
        return this.getClient().bulk({ refresh: true, body });
    };

    async delete(index, distribution, linuxPackage) {
        return this.getClient().deleteByQuery({
            index: `${index}-${distribution}`,
            body: {
                query: {
                  match: {
                    name: linuxPackage,
                  }
                }
            }
        });
    };
};

module.exports = Search;
