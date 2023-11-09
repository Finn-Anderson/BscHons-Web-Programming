let io;
let physics;
class Player {}
class AI {}

// Declaration of variables to be used in the gamemode
let width;
let height;
let scale;

let difficulty;
let botNum = {blue: 0, red: 0};

let totalSecs = 0;
let timer_id;

let canScore;
let finalScore;

let showSubmit = false;

function setDifficulty(value) {
	difficulty = value;
}

function setBotNum(team, value) {
	if (team == "red-bots") {
		botNum.red = value;
	} else {
		botNum.blue = value;
	}
}

function chooseTeam(team) {
	new Player(team, "player");

	var count = 0;
	for (var actor of physics.dynamicList) {
		if (actor.GetBody().GetUserData().id == "player") count++;
	}

	if (count == 1) {
		startGame();
	}

	return (physics.dynamicList.length - 1);
}

function startGame() {
	// Spawn bots
	for (var i = 0; i < botNum.red; i++) {
		new AI("team-red", "bot", difficulty);
	}

	for (var i = 0; i < botNum.blue; i++) {
		new AI("team-blue", "bot", difficulty);
	}

	reset();
}

function reset() {
	for (var actor of physics.dynamicList) {
		var x;
		var y = (height - 300) / scale;
		if (actor.GetBody().GetUserData().id != "football") {
			if (actor.GetBody().GetUserData().team == "team-red") {
				x = 200 / scale;
			} else {
				x = (width - 200) / scale;
			}
		} else {
			x = width / 2 / scale;
		}

		actor.GetBody().SetLinearVelocity(new b2Vec2 (0, 0));
		actor.GetBody().SetPosition(new b2Vec2 (x, y));
		actor.GetBody().ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0));
		actor.GetBody().charge = 300;
	}

	var canvas = document.getElementsByTagName("canvas")[0];
	canvas.style.transform = "scale(1.0)";
	canvas.style.left = 0;
	canvas.style.top = 0;

	physics.play = false;

	document.getElementById("countdown").classList.remove("countdown-flash");
	document.getElementById("countdown").innerHTML = 3;

	timer_id = setInterval(Countdown, 1000);
	document.getElementById("countdown").classList.add("countdown-animation");
}

function restart() {
	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		SetTimer();
	}

	for (var actor of physics.dynamicList) {
		physics.destroy(actor);
	}
	physics.dynamicList.length = 0;

	setTeamNum();

	clearInterval(timer_id);
	clearTimeout(timer_id);
}

function countdown() {
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

	physics.play = true;
}

function setTeamNum() {
	var redNum = 0;
	var blueNum = 0;

	for (var actor of physics.dynamicList) {
		if (actor.GetBody().GetUserData().id == "football") continue;

		if (actor[2] == "team-red") {
			redNum++;
		} else {
			blueNum++;
		}
	}

	document.getElementsByClassName("capacity")[0].innerHTML = redNum;

	document.getElementsByClassName("capacity")[1].innerHTML = blueNum;
}

function setScore(goal) {
	if (canScore) {
		var score = document.getElementById("score");
		if (goal == "redGoal") {
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
			timer_id = setTimeout(reset, 5000);
		}
	}
}

function ZoomIntoScorer(data) {
	var canvas = document.getElementsByTagName("canvas")[0];
	canvas.style.transform = "scale(1.5)";
	canvas.style.left = -data.last.GetPosition().x * scale + (width / 2) + "px";
	canvas.style.top = -data.last.GetPosition().y * scale + (height / 2) + "px";
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
	if (showSubmit) {
		var button = document.createElement("button");
		button.classList.add("submitScoreButton"); 
		button.innerHTML = "Submit Score";
		button.style.marginTop = "24px";
		button.id = "submit";
		button.onclick = function() {submitScore(finalScore, difficulty)};

		document.querySelectorAll(".submitScoreButton").forEach(e => e.remove());

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

module.exports = function(ioIn, physicsIn, playerIn, AIIn) {
	io = ioIn;
	physics = physicsIn;
	Player = playerIn;
	AI = AIIn;

	width = physics.wdith;
	height = physics.height;
	scale = physics.scale;

	return {setDifficulty, setBotNum, chooseTeam, restart};
}