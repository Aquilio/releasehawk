# Services

/users
  - GitHub authentication
/watches
  - id
  - userId
  - repo 
  - lastCheckedAt
  - lastReleasedAt
  - active?

# config
// .releasehawkrc
// releasehawk.json
{
  baseBranch: '', //master or develop (whatever is default)
  dependencies: {
    '<url>': '<script>'
  ]
}

# Workflow

1) User logs in with Github
2) User picks repo
3) User picks
  - target
  - script/action
  - whether they want to run the scripts once
4) ReleaseHawk creates a PR with the config file and an explanation

# Jobs

- CRON scheduled to look at all /watches and check the release of any watch with lastCheck >= ${x} minutes
  - If true: create a RELEASE job
- AMPQ Queues
  - RELEASE:
    - Checks out repo locally with little history
    - Check for existence of a config file
    - Retrieve script specified in config and run it against the branch in config
    - Commit and create a PR as ${botName}
