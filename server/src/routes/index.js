exports.admin  = require("./admin");
exports.linux  = require("./linux");

/**
 * @swagger
 *
 * definitions:
 * 
 *   Message:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *
 *   Error:
 *     allOf:
 *       - type: object
 *         properties:
 *           error:
 *             type: integer
 *             description: A flag determining if an error has occurred.
 *       - $ref: '#/definitions/Message'
 * 
 * components:
 *   securitySchemes:
 *     ApiSecretAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 * 
 */