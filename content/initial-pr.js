const md = require('./md');

module.exports = ({
  repo, branch
}) => md`
Let's start automating updates for ${repo}!

This pull request creates a sample <code>.releasehawk.yml</code> file that you should update to point to the targets you want to watch.

__Important: Releasehawk will only start watching for updates after you merge this initial pull request.__

---

<details><summary>How to update this pull request</summary>

\`\`\`bash
  # Change into your repository’s directory
  git fetch
  git checkout ${branch}
  # Update your config file
  git commit -m 'chore: update releasehawk config'
  git push origin ${branch}
\`\`\`
</details>

<details><summary>How do updates work with Releasehawk?</summary>

After you merge this pull request, Releasehawk will create a new pull request whenever a change is detected in any of the targets you have configured.
</details>

<details><summary>What can I watch?</summary>

GitHub releases, tags or commits and any file/API response on the internet.
</details>

<details><summary>What are the configuration options?</summary>

Add any number of targets to your configuration file. A target can be a GitHub
or file url.

For GitHub urls, you can watch for 3 type of updates: <code>commit, release, or tag</code>.
Put one of these as the <code>type</code>.

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
If those don’t help, you can always [ask the humans](https://releasehawk.com/contact) behind Releasehawk.
</details>

---

Good luck with your project!

Your [Releasehawk](https://releasehawk.com) bot
`;
