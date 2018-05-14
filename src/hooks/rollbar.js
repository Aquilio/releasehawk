module.exports = function () {
  return context => {
    const rollbar = context.app.get('rollbar');

    if (context.error) {
      rollbar.error(context.error, context);
    }
  };
};
