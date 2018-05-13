const md = require('./md');

module.exports = ({
  repo, branch
}) => md`
Let's start automating GitHub and file updates for ${repo}!

This pull request creates a sample <code>.releasehawk.yml</code> file that you should update to point to the targets you want to watch.

__Important: ReleaseHawk will only start watching for updates after you merge this initial pull request.__

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

<details><summary>How do updates work with ReleaseHawk?</summary>

After you merge this pull request, ReleaseHawk will create a new pull request whenever a change is detected in any of the targets you have configured.
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

For a file, the only type is <code>file</code>. <code>url</code> is the full URL to the file.

The change will be placed in the folder specififed by <code>destination</code>.

You can run a script after the update is downloaded with <code>script</code>.

Example:

\`\`\`yaml
  # GitHub Release
  facebook/create-react-app
    type: release
    destination: ./vendor/cra
    script: ./bin/update-cra.sh
  # GitHub Commit with filter
  feathersjs/feathers
    type: commit
    commit_re: chore(package)
    destination: ./vendor/feathers
  # File or API endpoint
  carParkInfo
    type: file
    url: https://sps-opendata.pilotsmartke.gov.hk/rest/getCarparkInfos
    destination: ./data/carpark
    script: ./bin/process-data.js
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
