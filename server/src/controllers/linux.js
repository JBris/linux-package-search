exports.search = (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;

    return res.send({works: 1});
};

exports.view = (req, res) => {
    const distribution = req.params.distribution;
    const package = req.params.package;

    return res.send({works: 1});
};

