exports.search = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');

    try {
        const instance = linuxPackageSearchManager.getDistribution(distribution);
        const result = await instance.search(package);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.searchRaw = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');

    try {
        const instance = linuxPackageSearchManager.getDistribution(distribution);
        const result = await instance.searchRaw(package);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.view = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');

    try {
        const instance = linuxPackageSearchManager.getDistribution(distribution);
        const result = await instance.view(package);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};

exports.viewRaw = async (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;
    const linuxPackageSearchManager  = req.app.get('linuxPackageSearchManager');

    try {
        const instance = linuxPackageSearchManager.getDistribution(distribution);
        const result = await instance.viewRaw(package);
        return res.send(result);
    } catch(e) {
        console.error(e);
        return res.status(400).send({
            error: 1, 
            message: e,
        });
    }
};
