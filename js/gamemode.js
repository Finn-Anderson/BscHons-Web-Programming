// Declaration of variables to be used in the gamemode
var players = [];
var totalSecs = 0;
var timer_id;
var play;
var canScore;

function StartGame(team) {
	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		SetTimer();
	}

	SpawnBots(team);

	Reset();
}

function Reset() {
	for (var ply of players) {
		var x;
		var y = (height - 300) / scale;
		if (ply[2] == "team-red") {
			x = 200 / scale;
		} else {
			x = (width - 200) / scale;
		}
		ply[0].GetBody().SetLinearVelocity(new b2Vec2 (0, 0));
		ply[0].GetBody().SetPosition(new b2Vec2 (x, y));
		ply[0].GetBody().ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0));
	}

	play = false;

	document.getElementById("countdown").classList.remove("countdown-flash");
	document.getElementById("countdown").innerHTML = 3;

	timer_id = setInterval(Countdown, 1000);
	document.getElementById("countdown").classList.add("countdown-animation");

	if (football) {
		destroylist.push([football, easelfootball]);
	}
}

function Countdown() {
	var counter = document.getElementById("countdown");

	counter.innerHTML--;

	if (counter.innerHTML == 0) {
		document.getElementById("countdown").classList.remove("countdown-animation");

		SpawnFootball();
		
		clearInterval(timer_id);

		timer_id = setInterval(SetTimer, 1000);

		canScore = true
	}
}

function SpawnFootball() {
	football = CreateCircle(1.0, 0.2, 0.5, b2Body.b2_dynamicBody, (width / 2), (height - 300), 20, "football");
	easelfootball = CreateBitmap(loader.getResult("football"), 20, 20);

	var filter = football.GetFilterData();
	filter.categoryBits = 0x0004;
	filter.maskBits = 0x0002;
	filter.groupIndex = 2;
	football.SetFilterData(filter);

	stage.addChild(easelfootball);

	play = true;
}

function SpawnBots(team) {
	for (var i = (players.length - 1); i > -1; i--) {
		var id = players[i][0].GetBody().GetUserData().id;
		if (id == "bot") {
			destroylist.push(players[i]);

			players.splice(i, 1);

			localStorage.setItem("Index", localStorage.getItem("Index") - 1);
		}
	}

	var num = document.querySelector("input[name='bots']:checked").value;

	if (team == "team-red") {
		team = "team-blue";
	} else {
		team = "team-red";
	}

	for (var i = 0; i < num; i++) {
		SpawnEntity(team, "bot");
	}
}

function SpawnEntity(team, type) {
	var x;
	if (team == "team-red") {
		x = 200;
	} else {
		x = width - 200;
	}

	var player = CreateCircle(0.0, 0.2, 0.0, b2Body.b2_dynamicBody, x, (height - 300), 20, type);
	var filter = player.GetFilterData();
	filter.categoryBits = 0x0004;
	filter.maskBits = 0x0002;
	filter.groupIndex = 2;
	player.SetFilterData(filter);

	var easelPlayer = CreateBitmap(loader.getResult(team), 20, 20);

	stage.addChild(easelPlayer);

	players.push([player, easelPlayer, team]);

	SetTeamNum();

	return player;
}

function SetTeamNum() {
	var redNum = 0;
	var blueNum = 0;

	for (var ply of players) {
		if (ply[2] == "team-red") {
			redNum++;
		} else {
			blueNum++;
		}
	}

	document.getElementsByClassName("capacity")[0].innerHTML = redNum;

	document.getElementsByClassName("capacity")[1].innerHTML = blueNum;
}

function SetScore(team) {
	if (canScore) {
		var score = document.getElementById("score");
		if (team == "team-red") {
			score.children[0].innerHTML++;
		} else {
			score.children[1].innerHTML++;
		}
		canScore = false;

		document.getElementById("countdown").innerHTML = "GOAL!!!";
		document.getElementById("countdown").classList.add("countdown-flash");

		clearInterval(timer_id);

		setTimeout(Reset, 5000);
	}
}

function SetTimer() {
	totalSecs++;

	var seconds = totalSecs % 60;
	var minutes = parseInt(totalSecs / 60);

	if (seconds < 10) {
		var seconds = "0" + seconds;
	}
	if (minutes < 10) {
		var minutes = "0" + minutes;
	}

	document.getElementById("timer").innerHTML = minutes + ":" + seconds;
}