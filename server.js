const fs = require("fs");
const host = "127.0.0.1";
const port = 8000;
const express = require("express");
const axios = require('axios');
const session = require('express-session');

const app = express(); // Use static files in ROOT/client folder

app.use(session({
	secret: "<W,Z6Y*XuJ~A/4V43'Y/wL]H/+idbvNwA)Ko_N_meIUYb9n6B3",
	resave: false,
	saveUninitialized: false,
}))

app.get("/", function(request, response) { // Root dir
	response.sendFile(__dirname + "/client/index.html");
});

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

		var leaderboardSelect = "SELECT name, score FROM leaderboard WHERE difficulty = ? ORDER BY score DESC limit 10";
		con.query(leaderboardSelect, [request.query.difficulty], function(error, result) {
			if (error) throw error;

			for (var i = 0; i < result.length; i++) {
				obj.name.push(result[i].name);
				obj.score.push(result[i].score);
			}

			send();
		});

		function send() {
			var json = JSON.stringify(obj);

			response.send(json);

			con.end();
		}
	});
});

app.get("/senddata", function(request, response) {
	var id = request.session.auth.id;
	var name = request.session.auth.name;
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

		var leaderboardSelect = "SELECT score FROM leaderboard WHERE id = ? AND difficulty = ?";
		con.query(leaderboardSelect, [id, difficulty], function(error, result) {
			if (error) throw error;

			if (result.length == 0) {
				var leaderboardInsert = "INSERT INTO leaderboard (id, name, score, difficulty) VALUES (?, ?, ?, ?)";
				con.query(leaderboardInsert, [id, name, score, difficulty], function(error, result) {
					if (error) throw error;

					send();
				});
			} else if (score > result[0].score) {
				var leaderboardUpdate = "UPDATE leaderboard SET score = ? WHERE id = ? AND difficulty = ?";
				con.query(leaderboardUpdate, [score, id, difficulty], function(error, result) {
					if (error) throw error;

					send();
				});
			} else {
				send();
			}
		});
	});

	function send() {
		response.send();

		con.end();
	}
});

app.get("/authorise", function(request, response) {
	if (request.session.auth && Math.floor(Date.now() / 1000) < request.session.auth.expire) {
		response.sendFile(__dirname + "/client/index.html");
	} else {
		let state = null;
		let authUrl = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.profile&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http%3A//localhost:8000/callback&client_id=927810064757-bbtcb0ee7uet4bh2p7uegrns2hfs6tjo.apps.googleusercontent.com";

		response.writeHead(302, { "Location": authUrl });
		response.end();
	}
});

app.get("/callback*", function(request, response) {
	if (!request.query.error) {
		const data = {
			client_id: "927810064757-bbtcb0ee7uet4bh2p7uegrns2hfs6tjo.apps.googleusercontent.com",
			client_secret: "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",
			code: request.query.code,
			grant_type: "authorization_code",
			redirect_uri: "http://localhost:8000/callback",
		};

		axios.post("https://oauth2.googleapis.com/token", data)
			.then((res) => {
				request.session.auth = {
					token: res.data.access_token,
					expire: Math.floor(Date.now() / 1000) + res.data.expires_in,
				};

				axios.get("https://www.googleapis.com/oauth2/v2/userinfo", { headers: {"Authorization" : `Bearer ${res.data.access_token}`} })
				.then((res) => {
					request.session.auth.id = res.data.id;
					request.session.auth.name = res.data.name;

					response.writeHead(302, { "Location": "/" });
					response.end();
				}).catch((error) => {
					console.error(error);

					response.status(400);
					response.send("User info error");
				});
			}).catch((error) => {
				console.error(error);

				response.status(400);
				response.send("Auth error");
			});
	}
});

app.get("/checkauth", function(request, response) {
	var obj = new Object();
	obj.auth = false;

	if (request.session.auth && Math.floor(Date.now() / 1000) < request.session.auth.expire) {
		obj.auth = true;
	}

	var json = JSON.stringify(obj);

	response.send(json);
});

app.use(express.static(__dirname + "/client"));

Error.stackTraceLimit = Infinity;

const server = app.listen(port, host);
const io = require("socket.io")(server);

const physics = require("./server/physics")(io);
let world = physics.init();

const player = require("./server/player");
const ai = require("./server/ai");

const gamemode = require("./server/gamemode.js")(io, physics, player, ai); 

io.on("connection", function(socket) {
	socket.emit("load", (response) => {
		if (response.status == "complete") {
			var node = world.GetBodyList();

			while (node.GetNext()) {
				socket.emit("add", node.GetUserData(), node.GetPosition(), node.GetAngle(), (response) => { physics.add(node, response); });

				node = node.GetNext();
			}
		}
	});

	//
	// HTML DOM broadcasting actions
	//
	socket.on("difficulty", (value) => {
		gamemode.setDifficulty(value);

		socket.broadcast.emit("difficulty", value);
	});

	socket.on("botNum", (team, value) => {
		gamemode.setBotNum(team, value);

		socket.broadcast.emit("botNum", team, value);
	});

	socket.on("chooseTeam", (team) => {
		var index = gamemode.chooseTeam(team);

		socket.emit("visualisePlayer", team, index);

		socket.broadcast.emit("chooseTeam", team);
	});

	socket.on("restart", () => {
		gamemode.restart();

		socket.emit("restart");
	});
});