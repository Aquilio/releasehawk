const md = require('./md');

module.exports = ({
  type, target
}) => md`
A new ${type === 'file' ? 'update' : type} was just found for ${target}.

---

Your [ReleaseHawk](https://releasehawk.com) bot
`;
