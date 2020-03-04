const app = require('express');
const router = app.Router();
const apiSecret = require("../middleware/api-secret");

/**
 * @swagger
 *
 * definitions:
 *   Configuration:
 *     type: object
 *     properties:
 *       configuration_property:
 *         type: string
 * 
 * /api/v1/admin/config:
 *   get:
 *     tags:
 *       - admin
 *     description: Returns the Linux package search API configuration object when the application is running in a development environment.
 *     produces:
 *       - application/json
 *     security:
 *       - ApiSecretAuth: []
 *     responses:
 *       200:
 *         description: Returns the Linux package search API configuration object when the application is running in a development environment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Configuration'
 *       403:
 *         description: Error message if environment is not set to development mode.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/config', apiSecret.authenticate, (req, res) => {
    const config = req.app.get('config');
    if (config.NODE_ENV === 'development') {
        const filteredConfig = config;
        delete filteredConfig.CACHE_BACKEND_PROVIDERS;
        return res.send(filteredConfig);
    } else {
        return res.status(403).send({
            error: 1,
            message: "Access denied."
        });
    }
});  

module.exports = router;
 