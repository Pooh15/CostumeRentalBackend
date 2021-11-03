var bcrypt = require('bcryptjs');

exports.cryptPassword = (password) => {
	const hash = bcrypt.hashSync(password, 10);
   	return hash;
}

exports.comparePassword =(password, hashPassword) => {
	const verified = bcrypt.compareSync(password, hashPassword);
	return verified;
}
