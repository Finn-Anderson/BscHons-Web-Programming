// Declaration of variables to be used in the gamemode
var players = [];
var totalSecs = 0;
var timer_id;
var play;
var canScore;

function StartGame() {
	document.getElementById("displaymenu").style.display = "block";

	SpawnBots();

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

function Restart() {
	document.getElementById("gameover").style.display = "none";
	
	document.getElementById("pickside").style.display = "block";

	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		SetTimer();
	}

	for (var ply of players) {
		destroylist.push(ply);
	}

	if (football) {
		destroylist.push([football, easelfootball]);
	}

	players.length = 0;

	SetTeamNum();

	clearInterval(timer_id);
	clearTimeout(timer_id);

	document.getElementById("countdown").classList.remove("countdown-flash");
	document.getElementById("countdown").classList.remove("countdown-animation");

	document.getElementById("score").children[0].innerHTML = 0;
	document.getElementById("score").children[1].innerHTML = 0;

	localStorage.clear();
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

function SpawnBots() {
	var num;

	num = document.querySelector("input[name='red-bots']:checked").value;
	for (var i = 0; i < num; i++) {
		SpawnEntity("team-red", "bot");
	}

	num = document.querySelector("input[name='blue-bots']:checked").value;
	for (var i = 0; i < num; i++) {
		SpawnEntity("team-blue", "bot");
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

		if (score.children[0].innerHTML == 5 || score.children[1].innerHTML == 5) {
			timer_id = setTimeout(GameOver, 5000, team);
		} else {
			timer_id = setTimeout(Reset, 5000);
		}
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

function GameOver(team) {
	document.getElementById("countdown").classList.remove("countdown-flash");

	document.getElementById("displaymenu").style.display = "none";

	document.getElementById("gameover").style.display = "block";

	var text;
	if (team == "team-red") {
		text = "RED WINS";
	} else {
		text = "BLUE WINS";
	}

	document.getElementById("gameover").children[0].innerHTML = text;

	var localTeam = localStorage.getItem("Team");

	var goals = document.getElementById("score").children;
	var teamNum = document.getElementsByClassName("capacity");

	var score = 0;
	if (localTeam == "team-red") {
		score = (1000 * goals[0].innerHTML / teamNum[0].innerHTML / (goals[1].innerHTML + 1) - totalSecs) * teamNum[1].innerHTML;
	} else {
		score = (1000 * goals[1].innerHTML / teamNum[1].innerHTML / (goals[0].innerHTML + 1) - totalSecs) * teamNum[0].innerHTML;
	}

	document.getElementById("gameover").children[1].innerHTML = "Score: " + Math.trunc(score);
}