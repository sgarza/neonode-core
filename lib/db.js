global.db = require('knex')({
  client: CONFIG.database.client,
  connection: CONFIG.database[CONFIG.environment]
});

db.on('query', function(data) {
  if (CONFIG.database.logQueries) {
    logger.log('SQL: '.yellow + data.sql + ' Data: '.yellow + data.bindings);
  }
});
