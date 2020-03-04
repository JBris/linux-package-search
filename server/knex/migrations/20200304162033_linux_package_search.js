exports.up = function(knex) {
    return knex.schema
    .createTable('distribution', function (table) {
        table.increments('id');
        table.string('name', 255).notNullable();
    })
    .createTable('package', function (table) {
        table.increments('id');
        table.biginteger('distribution_id').unsigned().notNullable().references('id').inTable('distribution').onDelete('CASCADE')
        table.string('name', 255).notNullable();
        table.string('displayName', 255);
        table.string('version', 255);
        table.jsonb('additionalProperties');
        table.string('search_query', 255);
    })
};
exports.down = function(knex) {
    return knex.schema.dropTable("package").dropTable("distribution");
};
  