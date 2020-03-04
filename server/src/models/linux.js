class Linux {

    _db = {};

    constructor(db) {
        this._db = db;
    }

    getDb() {
        return this._db;
    }

    async save(distribution, linuxPackage, result) {
        console.log(distribution, linuxPackage);
    }
}

module.exports = Linux;