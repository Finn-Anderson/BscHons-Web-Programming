// Declaration of variables to be used in the gamemode
var actors = [];
var totalSecs = 0;
var timer_id;
var play;
var canScore;
var finalDifficulty;
var finalScore;
var showSubmit = false;
var playAudio = true;

function StartGame() {
	document.getElementById("displaymenu").style.display = "block";

	SpawnBots();

	Reset();

	finalDifficulty = document.querySelector("input[name='difficulty']:checked").id;
}

function Reset() {
	for (var actor of actors) {
		var x;
		var y = (height - 300) / scale;
		if (actor[2] == "team-red") {
			x = 200 / scale;
		} else {
			x = (width - 200) / scale;
		}
		actor[0].body.SetLinearVelocity(new b2Vec2 (0, 0));
		actor[0].body.SetPosition(new b2Vec2 (x, y));
		actor[0].body.ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0));
		actor[0].charge = 300;
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

	for (var actor of actors) {
		destroylist.push(actor);
	}

	if (football) {
		destroylist.push([football, easelfootball]);
	}

	actors.length = 0;

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

function ChooseTeam(team) {
	document.getElementById("pickside").style.display = "none";

	if (actors[localStorage.getItem("Index")]) {
		var ply = actors[localStorage.getItem("Index")];

		destroylist.push(ply);

		actors.splice(localStorage.getItem("Index"), 1);
	}

	var player = new Player(team, "player");

	localStorage.setItem("Index", actors.length - 1);

	localStorage.setItem("Team", team);

	var count = 0;
	for (var actor of actors) {
		var id = actor[0].body.GetUserData().id;
		if (id == "player") count++;
	}

	if (count == 1) {
		StartGame();
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
		new AI("team-red", "bot");
	}

	num = document.querySelector("input[name='blue-bots']:checked").value;
	for (var i = 0; i < num; i++) {
		new AI("team-blue", "bot");
	}
}

function SetTeamNum() {
	var redNum = 0;
	var blueNum = 0;

	for (var actor of actors) {
		if (actor[2] == "team-red") {
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

		if (playAudio) {
			var audio = document.getElementById("audioGoal");
			audio.volume = 0.5;
			audio.play();
		}

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

function DisplayMenu() {
	if (document.getElementById("menu").style.display == "flex") {
		document.getElementById("menu").style.display = "none";
	} else {
		document.getElementById("menu").style.display = "flex";
	}
}

function SetAudio() {
	playAudio = !playAudio;

	const button = document.getElementById("audioBtn");
	if (playAudio) {
		button.innerHTML = "Mute";
	} else {
		button.innerHTML = "Unmute";
	}
}

function GameOver(team) {
	if (showSubmit) {
		var button = document.createElement("button");
		button.innerHTML = "Submit Score";
		button.style.marginTop = "24px";
		button.id = "submit";
		button.onclick = function() {submitScore(finalScore, finalDifficulty)};

		document.getElementById("gameover").appendChild(button);
	}

	document.getElementById("countdown").classList.remove("countdown-flash");

	document.getElementById("displaymenu").style.display = "none";

	document.getElementById("gameover").style.display = "block";

	if (playAudio) {
		var audio = document.getElementById("audioGameOver");
		audio.volume = 0.7;
		audio.play();
	}

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

	var positive = 0;
	var negative = 1;
	if (localTeam == "team-red") {
		positive = 1000 * goals[0].innerHTML * teamNum[1].innerHTML;
		negative = teamNum[0].innerHTML * (Number(goals[1].innerHTML) + 1);
	} else {
		positive = 1000 * goals[1].innerHTML * teamNum[0].innerHTML;
		negative = teamNum[1].innerHTML * (goals[0].innerHTML + 1);
	}

	finalScore = Math.trunc(positive / negative - totalSecs);

	document.getElementById("gameover").children[1].innerHTML = "Score: " + finalScore;
}