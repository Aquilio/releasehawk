const md = require('./md');

module.exports = ({
  repo
}) => md`
Let's start automating GitHub and file updates for ${repo}!

It looks like you already have a <code>.releasehawk.yml</code> configuration 
file so we've started watching for updates.

Of course, you can change your configuration at any time and ReleaseHawk will 
handle them.

---

<details><summary>What can I watch?</summary>

GitHub releases, tags or commits and any file/API response on the internet.
</details>

<details><summary>What are the configuration options?</summary>

Add any number of targets to your configuration file. A target can be a GitHub 
repository or file url.

For GitHub urls, you can watch for 3 type of updates: <code>commit, release, or 
tag</code>. Put one of these as the <code>type</code>.

For commits, you can filter by a Regex using <code>commit_re</code>.

For a file url, the only type is <code>file</code>.

The change will be placed in the folder specififed by <code>destination</code>.

You can run a script after the update is downloaded with <code>script</code>.

Example:

\`\`\`yaml
  # GitHub Release
  facebook/create-react-app
    - type: release
    - destination: ./vendor/cra
    - script: ./bin/update-cra.sh
  # GitHub Commit with filter
  feathersjs/feathers
    - type: commit
    - commit_re: chaore(package)
    - destination: ./vendor/feathers
  # File or API endpoint
  https://sps-opendata.pilotsmartke.gov.hk/rest/getCarparkInfos
    - type: file
    - destination: ./data/carpark
    - script: ./bin/process-data.js
\`\`\`
</details>

<details><summary>Need more help?</summary>

We curate a list of [frequently asked questions](https://releasehawk.com/faq).
If those don’t help, you can always [ask the humans](https://releasehawk.com/contact) behind ReleaseHawk.
</details>

---

Good luck with your project!

Your [ReleaseHawk](https://releasehawk.com) bot
`;
