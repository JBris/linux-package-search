class Linux {

    _distributionTable = "distribution";
    _packageTable = "package";

    _db = {};

    constructor(db) {
        this._db = db;
    };

    getDb() {
        return this._db;
    };

    getDistributionTable() {
        return this._distributionTable;
    };

    getPackageTable() {
        return this._packageTable;
    };

    async view(distribution, linuxPackage) {
        const distributionTable = this.getDistributionTable();
        const packageTable = this.getPackageTable();

        return this.getDb().select().from(packageTable).where('search_query', linuxPackage).whereIn('distribution_id', function() {
            this.select('id')
                .from(distributionTable)
                .where('name', distribution);
        });  
    };

    async save(distribution, linuxPackage, results) {
        const distributionTable = this.getDistributionTable();
        const packageTable = this.getPackageTable();

        const [distributionRows] = await Promise.all([
            this.getDb().select('id').from(distributionTable).where('name', distribution),

            this.getDb()(packageTable).where('search_query', linuxPackage).whereIn('distribution_id', function() {
                this.select('id')
                    .from(distributionTable)
                    .where('name', distribution);
            }).del(),
        ]);

        if(distributionRows.length == 0) { throw `Distribution '${distribution}' is missing from the database.` };
        const distributionRow = distributionRows[0];

        let values = [];
        results.forEach(result => {
            let value = {};
            value.distribution_id = distributionRow.id;
            value.search_query = linuxPackage;
            value.name = result.name;
            value.displayName = result.displayName;
            value.version = result.version;
            value.additionalProperties = result.additionalProperties;
            values.push(value);
        });
        return this.getDb()(packageTable).insert(values);
    };

    async delete(distribution, linuxPackage) {
        const distributionTable = this.getDistributionTable();
        const packageTable = this.getPackageTable();
        return this.getDb()(packageTable).where('search_query', linuxPackage).whereIn('distribution_id', function() {
            this.select('id')
                .from(distributionTable)
                .where('name', distribution);
        }).del();
    };
};

module.exports = Linux;