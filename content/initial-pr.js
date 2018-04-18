Let’s get started with automating GitHub release dependency for ${ghRepo.name}

This pull request creates a sample `.releasehawk.yml` file that you should
update to point to the repositories you want to watch with the actions you want
to perform.

__Important: Releasehawk will only start watching for release updates after you
merge this initial pull request.

---

<summary>How to update this pull request</summary>
\`\`\`bash
  # Change into your repository’s directory
  git fetch
  git checkout ${newBranch}
  # Update your config file
  git commit -m 'chore: update releasehawk config'
  git push origin ${newBranch}
\`\`\`

<summary>How do release updates work with Releasehawk?</summary>
After you merge this pull request, Releasehawk will create a new pull request
whenever a new release is created in any of the repositories you have configured.
If we ever run into a problem we'll open an issue.

<summary>How to update your configuration</summary>
The only required key is `destination` which is where you want the release placed.
`script` allows you to run a custom script after the release has been placed in
`destination`.
You can add as many releases to your configuration

<summary>Need more help?</summary>
We curate a list of [frequently asked questions](https://releasehawk.com/faq).
If those don’t help, you can always [ask the humans](https://releasehawk.com/contact) behind Releasehawk.

