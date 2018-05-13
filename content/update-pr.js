const md = require('./md');

module.exports = ({
  type, target
}) => md`
A new ${type === 'file' ? 'update' : type} was just found for ${target}.

---

<details><summary>Need more help?</summary>

We curate a list of [frequently asked questions](https://releasehawk.com/faq).
If those don’t help, you can always [ask the humans](https://releasehawk.com/contact) behind ReleaseHawk.
</details>

---

Your [ReleaseHawk](https://releasehawk.com) bot
`;
