exports.getClient = (config) => {
    const knex = require('knex')({
        client: config.NODE_DB_CLIENT,
        connection: {
          host : config.DB_HOST,
          port: config.DB_PORT,
          user : config.DB_USER,
          password : config.DB_PASSWORD,
          database : config.DB_NAME
        }
    });

    return knex;
};
