## Environment Variables

Create an `.env` file and populate it with the values for the following variables:

- __FEATHERS_AUTH_SECRET__: Sewcret for feathers-authentication
- __GITHUB_CLIENT_SECRET__: secret from GitHub
- __GITHUB_CLIENT_ID:__: id from GitHub
- __DATABASE_URL__: Postgres connection string
- __CLOUDAMQP_URL__: AMQP connection string
- __PORT__: port to start server on (local only)
- __GITHUB_PRIVATE_KEY__: Private key generated via GitHub for a GitHub app

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/release; npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
