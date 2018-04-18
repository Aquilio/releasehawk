'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_watches_active()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        NOT LEAKPROOF
      AS $BODY$
      BEGIN
      IF NEW.active <> OLD.active THEN
        UPDATE watches SET active = NEW.active WHERE "watches"."repoId" = NEW.id;
      END IF;
      RETURN NEW;
      END;
      $BODY$;`)
      .then(() => {
        return queryInterface.sequelize.query(`
          CREATE TRIGGER keep_watches_active_updated
          AFTER UPDATE
          ON repos
          FOR EACH ROW
          EXECUTE PROCEDURE update_watches_active();`);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP TRIGGER keep_watches_active_updated ON repos')
      .then(() => {
        return queryInterface.sequelize.query('DROP FUNCTION update_watches_active()');
      });
  }
};
