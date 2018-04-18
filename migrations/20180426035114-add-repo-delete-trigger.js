'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION remove_watches()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        NOT LEAKPROOF
      AS $BODY$
      BEGIN
      DELETE FROM watches WHERE "watches"."repoId" = NEW.id;
      RETURN NEW;
      END;
      $BODY$;`)
      .then(() => {
        return queryInterface.sequelize.query(`
          CREATE TRIGGER remove_watches_on_delete
          AFTER DELETE
          ON repos
          FOR EACH ROW
          EXECUTE PROCEDURE remove_watches();`);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP TRIGGER remove_watches_on_delete ON repos')
      .then(() => {
        return queryInterface.sequelize.query('DROP FUNCTION remove_watches()');
      });
  }
};
