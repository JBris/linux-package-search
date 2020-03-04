const providers = require("../../src/services/linux/providers");

exports.seed = function(knex) {
  return knex('distribution').del()
    .then(function () {
      let values = [];
      let i = 1;
      Object.keys(providers).forEach(provider => {
        const value = { id: i, name: provider };
        values.push(value);
        i++;
      });
      return knex('distribution').insert(values);
    });
};
