# ReleaseHawk

## Getting Started

- Install Node > 8.9
- Install [Postgres](https://www.postgresql.org/download/)
- Install [RabbitMQ](https://www.rabbitmq.com/download.html)
- Clone this repo
- Create `.env` file [details below](#environment-variables)

### Environment Variables

Create an `.env` file and populate it with the values for the following variables:

- __FEATHERS_AUTH_SECRET__: Secret for feathers-authentication
- __PORT__: port to start server on (local only)
- __GITHUB_CLIENT_SECRET__: secret from GitHub App
- __GITHUB_CLIENT_ID__: id from GitHub App
- __GITHUB_ISSUE_ID__: issue id from GitHub App
- __GITHUB_PRIVATE_KEY__: Private key generated via GitHub app
- __GITHUB_WEBHOOK_SECRET__: Private secret to verify event signatures
- __DATABASE_URL__: Postgres connection string
- __CLOUDAMQP_URL__: AMQP connection string
- __WORK_PATH__: Local directory where repos are cloned and worked on
- __CHECK_INTERVAL__: Time in ms before a check is considered out of date

## Running the Application Locally

- Start RabbitMQ server
- Run migrations `yarn run develop:sequelize db:migrate`
- Run `yarn run develop`

### Running a job

`yarn run develop:<job name>`

All __`develop:`__ scripts use the environment variables from your `.env` file so it is required
when running locally.

## Deploying

`git push heroku master`

---

## Data Structure

### Repositories (`repos`)

Stores each repo ReleaseHawk is installed on along with the `installationId`.

### Watches (`watches`)

Represents each entity that needs to be watched. `lastUpdated` is a checksum for
the current release, `lastCheckedAt` is the timestamp of the last time the `target`
was checked.

## Background Tasks

### check

This is a periodic task that checks if there is a newer or different release than
the current one recorded in the DB. This will also remove any watches not in the 
repo's config.

### check-settings

This is a periodic task that checks if there are changes in a watch's config.
New targets are added as watches.

## RabbitMQ Jobs

### setup

Clones the repo and creates a PR with a starter config file and instructions. If
any issues are encountered, an issue will be created instead.

### finalize

Parses a repo's config file creating an entry in `watches` for each target.

### update

Clones a repo, downloads the latest version of the target and (optionally) runs
a script before submitting a PR for the update.

## GitHub App Integration

### Events

ReleaseHawk listens to `installation`, `installation_repository`, `pull_request` and
`issue` events from each repository.

Incoming events are verified by matching the `X-Event-Signature` with a signature
created using ReleaseHawk's webhook secret.

## Changelog

__0.0.1__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
