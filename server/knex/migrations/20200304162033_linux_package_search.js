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
    })
    .createTable('information', function (table) {
        table.increments('id');
        table.biginteger('package_id').unsigned().notNullable().references('id').inTable('package').onDelete('CASCADE')
        table.string('name', 255).notNullable();
        table.string('displayName', 255);
        table.string('version', 255);
        table.jsonb('additionalProperties');
    });
};
exports.down = function(knex) {
    return knex.schema.dropTable("information").dropTable("package").dropTable("distribution");
};
  