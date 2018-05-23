module.exports = function () {
  return context => {
    const rollbar = context.app.get('rollbarInstance');

    if (context.error) {
      rollbar.error(context.error, context);
    }
  };
};
