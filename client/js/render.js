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

document.getElementById("viewport").width = width;
document.getElementById("viewport").height = height;

document.getElementsByTagName("canvas")[0].width = width;
document.getElementsByTagName("canvas")[0].height = height;

// Define football to use later
let easelfootball;

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

	createjs.Ticker.framerate = 60;
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);
});

socket.on("tick", (DynamicBodiesList) => {
	stage.update();

	for (var actor of DynamicBodiesList) {
		actor[1].x = actor.GetPosition().x * scale;
		actor[1].y = actor.GetPosition().y * scale;
		actor[1].rotation = actor.GetAngle() * (180 / Math.PI);
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
});

//
// Sets local storage in case of page refresh.
//
localStorage.clear();