var mysql = require('mysql');

var con = mysql.createConnection({
	host: "comp-server.uhi.ac.uk",
	user: "SH20002219",
	password: "20002219",
	database: "SH20002219"
});

// Create tables for database
con.connect(function(error) {
	if (error) throw error;

	var leaderboard = "CREATE TABLE IF NOT EXISTS leaderboard (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), score SMALLINT, difficulty ENUM('easy', 'normal', 'hard', 'very-hard'))";
	con.query(leaderboard, function(error, result) {
		if (error) throw error;

		console.log("Leaderboard table created!");

		con.end();
	})
});