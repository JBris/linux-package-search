const app = require('express');
const router = app.Router();
const apiSecret = require("../middleware/api-secret");
const controller = require('../controllers/linux');

/**
 * @swagger
 *
 * parameters:
 *   distribution:
 *     in: path
 *     name: distribution
 *     schema:
 *       type: string
 *     required: true
 *     description: The Linux distribution.
 * 
 *   package:
 *     in: path
 *     name: package
 *     schema:
 *       type: string
 *     required: true
 *     description: The Linux distribution package name.
 * 
 * definitions:
 *   PackageSearchResults:
 *     type: array
 *     items:
 *       type: string
 *     description: An array of search results for the specified distribution and package.    
 * 
 *   RawSearchResults:
 *     type: object
 *     properties:
 *       properties:
 *          type: object
 *          description: Variable JSON results from the search request.
 *     description: The raw results retrived from a package search request.   
 * 
 *   PackageInformation:
 *     type: object
 *     properties:
 *       name:
 *          type: string
 *          description: The name of the package.
 *       displayName:
 *          type: string
 *          description: The full display name of the package, version, and additional tagging.         
 *       version:
 *          type: string
 *          description: The package version name.     
 *       additionalProperties:
 *         type: object
 *         description: An object with a variable structure to append additional properties.
 * 
 *   PackageInformationCollection:
 *     type: array
 *     items:
 *       $ref: '#/definitions/PackageInformation'
 */

/**
 * @swagger
 * 
 * /api/v1/linux/search/{distribution}/{package}:
 *   get:
 *     tags:
 *       - linux
 *     description: Return an array of search results for the specified distribution and package.
 *     parameters:
 *       - $ref: '#/parameters/distribution'
 *       - $ref: '#/parameters/package'
 *     security:
 *       - ApiSecretAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The array of search results for the specified distribution and package.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PackageSearchResults'
 *       400:
 *         description: Return an error message if the search request fails.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/search/:distribution/:package', apiSecret.authenticate, controller.search); 

/**
 * @swagger
 * 
 * /api/v1/linux/search-raw/{distribution}/{package}:
 *   get:
 *     tags:
 *       - linux
 *     description: Return the raw search results for the specified distribution and package.
 *     parameters:
 *       - $ref: '#/parameters/distribution'
 *       - $ref: '#/parameters/package'
 *     security:
 *       - ApiSecretAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The raw search results for the specified distribution and package.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/RawSearchResults'
 *       400:
 *         description: Return an error message if the search request fails.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/search-raw/:distribution/:package', apiSecret.authenticate, controller.searchRaw);  

/**
 * @swagger
 * 
 * /api/v1/linux/view/{distribution}/{package}:
 *   get:
 *     tags:
 *       - linux
 *     description: Return an array of package information for the specified distribution.
 *     parameters:
 *       - $ref: '#/parameters/distribution'
 *       - $ref: '#/parameters/package'
 *     security:
 *       - ApiSecretAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The array of package information for the specified distribution.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PackageInformationCollection'
 *       400:
 *         description: Return an error message if the search request fails.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/view/:distribution/:package', apiSecret.authenticate, controller.view);  

/**
 * @swagger
 * 
 * /api/v1/linux/view-raw/{distribution}/{package}:
 *   get:
 *     tags:
 *       - linux
 *     description: Return the raw package information results for the specified distribution.
 *     parameters:
 *       - $ref: '#/parameters/distribution'
 *       - $ref: '#/parameters/package'
 *     security:
 *       - ApiSecretAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The raw package information results for the specified distribution.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/RawSearchResults'
 *       400:
 *         description: Return an error message if the search request fails.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/view-raw/:distribution/:package', apiSecret.authenticate, controller.viewRaw);  

router.get('/archive/view/:distribution/:package', apiSecret.authenticate, controller.archiveView);  
router.get('/archive/save/:distribution/:package', apiSecret.authenticate, controller.archiveSave);  
router.get('/archive/delete/:distribution/:package', apiSecret.authenticate, controller.archiveDelete);  

module.exports = router;
 