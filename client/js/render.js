'use strict'
//
// Easel definitions for use in the game.
//
let easelCan = document.getElementsByTagName("canvas")[0];
let easelctx = easelCan.getContext("2d");
let stage = new createjs.Stage(easelCan);
stage.snapPixelsEnabled = true;

let manifest = [
	{src:"background.png", id:"background"},
	{src:"ground.png", id:"ground"},
	{src:"football.png", id:"football"},
	{src:"post.png", id:"post"},
	{src:"crossbar.png", id:"crossbar"},
	{src:"team-red.png", id:"team-red"},
	{src:"team-blue.png", id:"team-blue"},
];

function CreateBitmap(img, b2x, b2y) {
	var bitmap = new createjs.Bitmap(img);

	var scalex = (b2x * 2) / bitmap.image.naturalWidth;
	var scaley = (b2y * 2) / bitmap.image.naturalHeight;

	bitmap.scaleX = scalex;
	bitmap.scaleY = scaley;
	bitmap.regX = bitmap.image.width / 2;
	bitmap.regY = bitmap.image.height / 2;

	return bitmap;
}

//
// Render display code
//

// Defining canvas and world
let width = 1280;
let height = 540;
let scale = 30;

let socket = io();

var idList = {};

document.getElementById("viewport").style.width = width + "px";
document.getElementById("viewport").style.height = height + "px";

document.getElementsByTagName("canvas")[0].width = width;
document.getElementsByTagName("canvas")[0].height = height;

// Load images
let loader;
socket.on("load", (callback) => {
	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", () => {
		let easelbg = CreateBitmap(loader.getResult("background"), width, height);
		easelbg.x = 0;
		easelbg.y = 0;

		stage.addChild(easelbg);

		callback({status: "complete"});
	});
	loader.loadManifest(manifest, true, "./assets/");
});

socket.on("tick", (DynamicBodiesList) => {
	for (var actor of DynamicBodiesList) {
		var element = idList[actor.count];
		
		if (element) {
			element.x = actor.position.x * scale;
			element.y = actor.position.y * scale;
			element.rotation = actor.angle * (180 / Math.PI);
		}
	}

	stage.update();
});

socket.on("add", (userdata, position, angle) => {
	var bitmapName = userdata.id;

	if (!loader.getResult(bitmapName)) return;

	if (bitmapName == "ground") {
		userdata.height = 5;
	}

	let easelObj = CreateBitmap(loader.getResult(bitmapName), userdata.width, userdata.height);
	easelObj.x = position.x * scale;
	easelObj.y = position.y * scale;
	easelObj.rotation = angle;
	easelObj.id = bitmapName;

	stage.addChild(easelObj);

	stage.update();

	if (userdata.count) {
		idList[userdata.count] = easelObj;
	}
});

socket.on("destroy", (index) => {
	stage.removeChild(idList[index]);

	delete idList[index];

	stage.update();
});

//
// HTML DOM actions and responses
//

// Decalring variables
let playAudio = true;

let showSubmit = false;

// Bots
function setDifficulty(value) {
	socket.emit("difficulty", value);

	populateLeaderboard(value);
}

socket.on("difficulty", (value) => {
	const btnList = document.querySelectorAll("input[name='difficulty']");

	for (var e of btnList) {
		if (e.id == value) {
			e.checked = true;

			break;
		}
	}

	populateLeaderboard(value);
});

function setBotsNum(team, value) {
	socket.emit("botNum", team, value);
}

socket.on("botNum", (team, value) => {
	const btnList = document.querySelectorAll("input[name='"+ team +"']");

	for (var e of btnList) {
		if (e.value == value) {
			e.checked = true;

			break;
		}
	}
});

// Player
function chooseTeam(team) {
	document.getElementById("pickside").style.display = "none";

	socket.emit("chooseTeam", team);
}

socket.on("setIndex", (index) => {
	localStorage.setItem("index", index);
});

document.addEventListener("keydown", movement);
document.addEventListener("keyup", movement);

function movement(event) {
	var index = localStorage.getItem("index");

	var keyBanList = [32, 65, 68];

	for (const key of keyBanList) {
		if (event.keyCode == key) {
			event.preventDefault();
		}
	}

	if (index) {
		socket.emit("movement", index, {type: event.type, key: event.key});
	}
}

// Display menu button actions
function displayMenu() {
	if (document.getElementById("menu").style.display == "flex") {
		document.getElementById("menu").style.display = "none";
	} else {
		document.getElementById("menu").style.display = "flex";
	}
}

function restart() {
	socket.emit("restart");
}

socket.on("restart", () => {
	document.getElementById("gameover").style.display = "none";
	
	document.getElementById("displaymenu").style.display = "block";
	
	document.getElementById("pickside").style.display = "block";

	document.getElementById("countdown").classList.remove("countdown-flash");
	document.getElementById("countdown").classList.remove("countdown-animation");

	document.getElementById("score").children[0].innerHTML = 0;
	document.getElementById("score").children[1].innerHTML = 0;

	localStorage.clear();
});

function setAudio() {
	playAudio = !playAudio;

	const button = document.getElementById("audioBtn");
	if (playAudio) {
		button.innerHTML = "Mute";
	} else {
		button.innerHTML = "Unmute";
	}
}

socket.on("audio", (type) => {
	if (!playAudio) return;

	if (type == "kick") {
		document.getElementById("audioKick").play();
	} else if (type == "goal") {
		var audio = document.getElementById("audioGoal");
		audio.volume = 0.5;
		audio.play();
	} else {
		var audio = document.getElementById("audioGameOver");
		audio.volume = 0.7;
		audio.play();
	}
});

// Gamemode
socket.on("reset", () => {
	var canvas = document.getElementsByTagName("canvas")[0];
	canvas.style.transform = "scale(1.0)";
	canvas.style.left = 0;
	canvas.style.top = 0;

	document.getElementById("countdown").classList.remove("countdown-flash");
	document.getElementById("countdown").innerHTML = 3;

	document.getElementById("countdown").classList.add("countdown-animation");
});

socket.on("countdown", (countdownNum) => {
	if (countdownNum == 0) {
		document.getElementById("countdown").classList.remove("countdown-animation");
	} else {
		var counter = document.getElementById("countdown");

		counter.innerHTML = countdownNum;
	}
});

socket.on("setTeamNum", (redNum, blueNum) => {
	document.getElementsByClassName("capacity")[0].innerHTML = redNum;

	document.getElementsByClassName("capacity")[1].innerHTML = blueNum;
});

socket.on("setScore", (score) => {
	var s = document.getElementById("score");
	s.children[0].innerHTML = score.red;
	s.children[1].innerHTML = score.blue;
});

socket.on("goal", (score) => {
	document.getElementById("countdown").innerHTML = "GOAL!!!";
	document.getElementById("countdown").classList.add("countdown-flash");
});

socket.on("zoomIntoScorer", (pos) => {
	var canvas = document.getElementsByTagName("canvas")[0];
	canvas.style.transform = "scale(1.5)";
	canvas.style.left = -pos.x * scale + (width / 2) + "px";
	canvas.style.top = -pos.y * scale + (height / 2) + "px";
});

socket.on("setTimer", (minutes, seconds) => {
	document.getElementById("timer").innerHTML = minutes + ":" + seconds;
});

socket.on("gameover", (team) => {
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

	socket.emit("gameover", localStorage.getItem("index"));
});

socket.on("displaySubmitScore", (score, difficulty) => {
	if (showSubmit) {
		var button = document.createElement("button");
		button.classList.add("submitScoreButton"); 
		button.innerHTML = "Submit Score";
		button.style.marginTop = "24px";
		button.id = "submit";
		button.onclick = function() {submitScore(score, difficulty)};

		document.querySelectorAll(".submitScoreButton").forEach(e => e.remove());

		document.getElementById("gameover").appendChild(button);

		document.getElementById("gameover").children[1].innerHTML = "Score: " + score;
	}
})

//
// Clears local storage in case of page refresh.
//
localStorage.clear();