const bcrypt = require('bcrypt');
const password = 'password123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) console.error(err);
  console.log(hash);
});
