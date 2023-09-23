// Declaration of variables to be used in the gamemode
var players = [];
var totalSecs = 0;
var timer_id;

function StartGame(team) {
	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		SetTimer();
	}

	SpawnBots(team);

	// Spawn football
	if (football) {
		destroylist.push([football, easelfootball]);
	}

	football = CreateCircle(1.0, 0.2, 0.5, b2Body.b2_dynamicBody, (width / 2), (height - 300), 20, "football");
	easelfootball = CreateBitmap(loader.getResult("football"), 20, 20);

	var filter = football.GetFilterData();
	filter.categoryBits = 0x0004;
	filter.maskBits = 0x0002;
	filter.groupIndex = 2;
	football.SetFilterData(filter);

	stage.addChild(easelfootball);

	timer_id = setInterval(SetTimer, 1000);
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
	var score = document.getElementById("score");
	if (team == "Red") {
		score.firstChild.innerHTML++;
	} else {
		score.lastChild.innerHTML++;
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