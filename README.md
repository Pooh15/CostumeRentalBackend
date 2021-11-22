# Costume Rental Backend code includes NodeJs with MySql
To run on local system follow the steps below
1) npm install
2) nodemon app.js
3) If you are unable to establish connection with the mysql workbench from nodejs please run the following the query 
--> alter user 'root'@'localhost' identified with mysql_native_password by 'password'
This will set up connection with nodejs. 
And make connection in dbconfig file like below

var config = {
	database: {
		host:	  'localhost', 	// database host
		user: 	  'root', 		// your database username
		password: 'password', 		// password which we set in earlier step
		port: 	  3307, 		// your database server port 
		db: 	  'rentdb'	// your database name

	}
}
