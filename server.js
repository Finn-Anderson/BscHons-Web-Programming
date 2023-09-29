var fs = require("fs");
var host = "127.0.0.1";
var port = 8000;
var express = require("express");

var app = express();
app.use(express.static(__dirname + "/client")); //use static files in ROOT/src folder

app.get("/", function(request, response) { //root dir
	response.sendFile(__dirname + "/client/index.html");
})

app.get("/requestdata", function(request, response) {
	var obj = new Object();

	obj.name = [];
	obj.score = [];

	var mysql = require('mysql');

	var con = mysql.createConnection({
		host: "comp-server.uhi.ac.uk",
		user: "SH20002219",
		password: "20002219",
		database: "SH20002219"
	});

	con.connect(function(error) {
		if (error) throw error;

		var leaderboardSelect = "SELECT * FROM leaderboard WHERE difficulty = ? ORDER BY score DESC limit 10";
		con.query(leaderboardSelect, [request.query.difficulty], function(error, result) {
			if (error) throw error;

			for (var i = 0; i < result.length; i++) {
				obj.name.push(result[i].name);
				obj.score.push(result[i].score);
			}

			send();
		})

		function send() {
			var json = JSON.stringify(obj);

			response.send(json);

			con.end();
		}
	});
})

app.get("/senddata", function(request, response) {
	var name = request.query.name;
	var score = request.query.score;
	var difficulty = request.query.difficulty;

	var mysql = require('mysql');

	var con = mysql.createConnection({
		host: "comp-server.uhi.ac.uk",
		user: "SH20002219",
		password: "20002219",
		database: "SH20002219"
	});

	con.connect(function(error) {
		if (error) throw error;

		var leaderboardSelect = "INSERT INTO leaderboard (name, score, difficulty) VALUES ?";
		con.query(leaderboardSelect, [name, score, difficulty], function(error, result) {
			if (error) throw error;

			for (var i = 0; i < result.length; i++) {
				obj.name.push(result[i].name);
				obj.score.push(result[i].score);
			}
		})
	});
})

app.listen(port, host);