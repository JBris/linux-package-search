'use strict';

//Imports
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/config').get();
const routes = require("./routes");
const swagger = require("./services/doc/swagger");
const rateLimit = require("./middleware/rate-limit");
const LinuxPackageSearchManager = require("./services/linux/LinuxPackageSearchManager"); 
const CacheManager = require("./services/cache/CacheManager"); 
const db = require("./services/database/db").getClient(config);
const Search = require("./services/search/Search");
const search = new Search(config);

// App
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.set('trust proxy', 1);

//Middleware
const limiter = rateLimit.create({
    windowMs: config.NODE_RATE_LIMIT_RESET,
    max: config.NODE_RATE_LIMIT_REQUESTS
});
app.use(limiter);

//Routes
app.use('/api/v1/admin', routes.admin);
app.use('/api/v1/linux', routes.linux);

//Swagger
const swaggerSpec = swagger.createSpec();
const swaggerUi = swagger.getSwaggerUi();

app.get('/api/v1/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.send(swaggerSpec);
});
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    return res.status(404).send({
        error: 1, 
        message: 'Route not found. Visit /v1/api-docs for the most recent documentation.'
    });
});

const HOST = config.HOST;
const PORT = config.PORT;
const linuxPackageSearchManager = new LinuxPackageSearchManager(config.LINUX_SEARCH_PROVIDERS);
const cacheManager = new CacheManager(config.CACHE_BACKEND_PROVIDERS);
app.set('linuxPackageSearchManager', linuxPackageSearchManager); 
app.set('cacheManager', cacheManager); 
app.set('db', db);
app.set('search', search);
app.set('config', config); 
app.listen(PORT, HOST);  
console.log(`Running on ${HOST}:${PORT}`);