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
	stage.update();

	var list = stage.children;

	for (var actor of DynamicBodiesList) {
		for (var element of list) {
			if (actor.GetUserData().render == element.id) {
				element.x = actor.GetPosition().x * scale;
				element.y = actor.GetPosition().y * scale;
				element.rotation = actor.GetAngle() * (180 / Math.PI);

				list.splice(list.indexOf(element), 1);

				break;
			}
		}
	}
});

socket.on("add", (userdata, position, angle, callback) => {
	var bitmapName;
	if (userdata.team) {
		bitmapName = userdata.team;
	} else {
		bitmapName = userdata.id;
	}

	if (!loader.getResult(bitmapName)) return;

	if (bitmapName == "ground") {
		userdata.height = 5;
	}

	let easelObj = CreateBitmap(loader.getResult(bitmapName), userdata.width, userdata.height);
	easelObj.x = position.x * scale;
	easelObj.y = position.y * scale;
	easelObj.rotation = angle;

	stage.addChild(easelObj);

	stage.update();

	callback({render: easelObj.id, data: userdata});
});

socket.on("remove", (obj) => {
	stage.removeChild(obj);

	stage.update();
});

//
// HTML DOM actions and responses
//

// Declaration of variables
let playAudio = true;

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

function chooseTeam(team) {
	document.getElementById("pickside").style.display = "none";

	socket.emit("chooseTeam", team);
}

socket.on("visualisePlayer", (team, index) => {
	var easelPlayer = CreateBitmap(loader.getResult(team), 20, 20);

	localStorage.setItem("Index", index);
});

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

//
// Clears local storage in case of page refresh.
//
localStorage.clear();