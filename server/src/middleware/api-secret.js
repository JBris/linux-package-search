exports.authenticate = (req, res, next) => {
    const config = req.app.get('config');
    const authorization = req.header('Authorization');
    
    if (typeof authorization === 'undefined' || (authorization === '')) {
        return res.status(403).send({
            error: 1,
            message: 'Missing "Authorization" header',
        });
    }

    if (authorization !== config.NODE_API_SECRET) {
        return res.status(403).send({
            error: 1,
            message: "Incorrect API secret."
        });
    }

    next();
}