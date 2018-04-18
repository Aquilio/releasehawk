const settingDefaults = {
  type: 'JobError',
  message: 'An error occurred',
  detail: '',
  extendedInfo: {},
  retry: false
};

/**
 * Custom error class for queue jobs.
 *
 * @param {Object} settings
 * @param {Object} settings.type the type of error
 * @param {Object} settings.message the reason for the error
 * @param {Object} settings.detail explanation of the error
 * @param {Object} settings.extendedInfo additional information
 * @param {Object} settings.code custom code associated with the error
 * @param {Object} settings.retry whether the job should be retried
 * @param {Function} constructorOpt optional constructor
 */
class JobError extends Error {
  constructor( userSettings, constructorOpt ) {
    super();
    const settings = Object.assign({}, settingDefaults, userSettings);
    Object.assign(this, settings);
    // See: https://github.com/v8/v8/wiki/Stack-Trace-API#stack-trace-collection-for-custom-exceptions
    Error.captureStackTrace( this, ( constructorOpt || JobError ) );
  }
}

/**
 * Factory function to create a JobError.
 *
 * @param {string|Object} settingsOrMessage description of the error or a settings object
 * @param {JobError} error
 */
function createJobError( settingsOrMessage, error ) {
  const settings = {};
  if(typeof settingsOrMessage === 'string') {
    settings.message = settingsOrMessage;
  }

  if(error) {
    settings.detail = error.message;
    settings.code = error.code;
  }

  return( new JobError( settings, createJobError ) );
}

module.exports = {
  JobError,
  createJobError
};
