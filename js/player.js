// Declaration of variables
var players = [];
var totalSecs = 0;
var timer_id;

function StartGame() {
	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		SetTimer();
	}

	timer_id = setInterval(SetTimer, 1000);
}

function DisplayPicking() {
	document.getElementById("pickside").style.display = "block";
}

function ChooseTeam(team) {
	document.getElementById("pickside").style.display = "none";

	if (players[localStorage.getItem("Index")]) {
		var ply = players[localStorage.getItem("Index")];

		destroylist.push(ply);

		players.splice(localStorage.getItem("Index"), 1);
	}

	if (players.length == 0) {
		StartGame();
	}

	var x;
	if (team == "team-red") {
		x = 200;

	} else {
		x = width - 200;
	}

	var player = CreateCircle(1.0, 0.2, 0.0, b2Body.b2_dynamicBody, x, (height - 300), 20, "player");
	var easelPlayer = CreateBitmap(loader.getResult(team), 20, 20);

	stage.addChild(easelPlayer);

	players.push([player, easelPlayer, team]);

	localStorage.setItem("Team", team);

	for (var i in players) {
		if (players[i][0] == player) {
			localStorage.setItem("Index", i);
			break;
		}
	}

	SetTeamNum()
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

// Increment Timer
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