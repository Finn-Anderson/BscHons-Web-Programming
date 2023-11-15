let io;
let physics;
class Player {}
class AI {}

// Declaration of variables to be used in the gamemode
let start = false;

let difficulty = "easy";
let botNum = {red: 0, blue: 0};

let countdownNum = 3;

let totalSecs = 0;
let timer_id;

let score = {red: 0, blue: 0};

function getDifficulty() {
	return difficulty;
}

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

function chooseTeam(team, name, sid) {
	var actor = new Player(team, name, sid, "player", physics);

	setTeamNum();

	if (!start) {
		startGame();
	}

	return actor;
}

function startGame() {
	// Spawn bots
	var reaction = 0;
	if (difficulty == "easy") {
		reaction = 600;
	} else if (difficulty == "normal") {
		reaction = 400;
	} else if (difficulty == "hard") {
		reaction = 200;
	}

	for (var i = 0; i < botNum.red; i++) {
		new AI("team-red", "bot", physics, reaction);
	}

	for (var i = 0; i < botNum.blue; i++) {
		new AI("team-blue", "bot", physics, reaction);
	}

	reset();

	start = true;
}

function restart() {
	if (timer_id) {
		clearInterval(timer_id);

		totalSecs = -1;
		setTimer();
	}

	for (var i = physics.dynamicList.length - 1; i >= 0; i--) {
		physics.destroy(physics.dynamicList[i]);
	}

	score = {red: 0, blue: 0};

	setTeamNum();

	clearInterval(timer_id);
	clearTimeout(timer_id);

	start = false;
}

function reset() {
	for (var i = physics.dynamicList.length - 1; i >= 0; i--) {
		const actor = physics.dynamicList[i];
		var x;
		var y = (physics.height - 300) / physics.scale;
		if (actor.GetBody().GetUserData().team == "team-red") {
			x = 200 / physics.scale;
		} else {
			x = (physics.width - 200) / physics.scale;
		}

		if (actor.GetBody().GetUserData().id == "football") {
			physics.destroy(actor);
		} else {
			physics.resetPhysics(actor.GetBody(), x, y);
			physics.wakeBody(actor.GetBody());
		}
	}

	physics.setPlay(false);

	countdownNum = 3;

	countdown();
	timer_id = setInterval(countdown, 1000);

	io.sockets.emit("reset");
}

function countdown() {
	io.sockets.emit("countdown", countdownNum);

	if (countdownNum == 0) {
		SpawnFootball();
	
		clearInterval(timer_id);

		timer_id = setInterval(setTimer, 1000);

		physics.setCanScore(true);
	}

	countdownNum--;
}

function SpawnFootball() {
	var football = physics.CreateCircle(1.0, 0.2, 0.5, true, (physics.width / 2), (physics.height - 300), 20, 0, "football");

	var filter = football.GetFilterData();
	filter.categoryBits = 0x0004;
	filter.maskBits = 0x0002;
	filter.groupIndex = 2;
	football.SetFilterData(filter);

	physics.dynamicList.push(football);

	physics.setPlay(true);
}

function getTeamNum() {
	var redNum = 0;
	var blueNum = 0;

	for (var actor of physics.dynamicList) {
		if (actor.GetBody().GetUserData().id == "football") continue;

		if (actor.GetBody().GetUserData().team == "team-red") {
			redNum++;
		} else {
			blueNum++;
		}
	}

	return [redNum, blueNum];
}

function setTeamNum() {
	var [redNum, blueNum] = getTeamNum();

	io.sockets.emit("setTeamNum", redNum, blueNum);
}

function getScore() {
	return score;
}

function setScore(goal, actor) {
	if (goal == "redGoal") {
		score.blue++;
	} else {
		score.red++;
	}

	physics.setCanScore(false);

	io.sockets.emit("audio", "goal");

	io.sockets.emit("setScore", score);

	io.sockets.emit("goal", actor.name);

	clearInterval(timer_id);

	if (score.red == 5 || score.blue == 5) {
		var team = "team-red";
		if (score.blue == 5) {
			team = "team=blue"
		}

		timer_id = setTimeout(gameover, 5000, team);
	} else {
		timer_id = setTimeout(reset, 5000);
	}
}

function getTimer() {
	return totalSecs;
}

function setTimer() {
	totalSecs++;

	var seconds = totalSecs % 60;
	var minutes = parseInt(totalSecs / 60);

	if (seconds < 10) {
		var seconds = "0" + seconds;
	}
	if (minutes < 10) {
		var minutes = "0" + minutes;
	}

	io.sockets.emit("setTimer", minutes, seconds);
}

function gameover(team) {
	io.sockets.emit("audio", "gameover");

	io.sockets.emit("gameover", team);
}

module.exports = function(ioIn, physicsIn, playerIn, AIIn) {
	io = ioIn;
	physics = physicsIn;
	Player = playerIn;
	AI = AIIn;

	physics.callback(setScore);

	return {setDifficulty, setBotNum, chooseTeam, getTeamNum, botNum, getScore, getTimer, restart, getDifficulty};
}