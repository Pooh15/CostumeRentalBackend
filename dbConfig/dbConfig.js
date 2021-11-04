const mysql = require('mysql');

var connection = mysql.createConnection({
	host:"localhost",
	user: "root",
	password: "",
	database:"rentdb"
})

module.exports = connection;