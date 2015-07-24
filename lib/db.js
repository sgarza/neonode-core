if (CONFIG.database) {
  global.db = require('knex')(CONFIG.database[CONFIG.environment]);

  db.on('query', function(data) {
    if (CONFIG.database.logQueries) {
      logger.log('SQL: '.yellow + data.sql + ' Data: '.yellow + data.bindings);
    }
  });
}
