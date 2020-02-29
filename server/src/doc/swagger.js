const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

exports.createSpec = () => {
    const options = {
        definition: {
        openapi: '3.0.0', 
        info: {
          title: 'Linux Package Search',  
          version: '1.0.0',  
        },
      },
      apis: ['./src/routes/*.js'],
    };
    return swaggerJSDoc(options);
}

exports.getSwaggerUi = () => {
    return swaggerUi;
}
