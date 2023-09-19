'use strict'
// Defining canvas and world
var width = 1280;
var height = 720;
var scale = 30;

document.getElementsByTagName("canvas")[0].width = width;
document.getElementsByTagName("canvas")[0].height = height;

var world = new b2World(
	new b2Vec2(0,9.81),
	true
);

// Create ground and walls
var ground = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), (height - 5), (width / 2), 5, "ground");
var ceiling = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), 5, (width / 2), 5, "ceiling");
var leftWall = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 5, height, 5, height, "leftWall");
var rightWall = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 5), height, 5, height, "rightWall");

// Create goal posts
var redPost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 100, height, 5, 200, "redPost");
var redCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 100, height, 5, 200, "redCrossbar");
console.log(redCrossbar);

var bluePost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 100), height, 5, 200, "bluePost");

// Create dynamic objects
var football = CreateCircle(1.0, 0.2, 0.8, b2Body.b2_dynamicBody, (width / 2 - 20), (height - 300), 20, "football");

// Allow football to go through posts
var filter = redPost.GetFilterData(); // Getting either posts or football would do.
filter.categoryBits = 0x0002;
filter.groupIndex = -8;
redPost.SetFilterData(filter);
bluePost.SetFilterData(filter);
football.SetFilterData(filter);

// Load images
var loader = new createjs.LoadQueue(false);
loader.addEventListener("complete", start);
loader.loadManifest(manifest, true, "./assets/");

var easelfootball;
function start() {
	var easelbg = CreateBitmap(loader.getResult("background"), width, height);
	easelbg.x = 0;
	easelbg.y = 0;

	var easelground = CreateBitmap(loader.getResult("ground"), width, 5);
	easelground.x = ground.GetBody().GetPosition().x * scale;
	easelground.y = ground.GetBody().GetPosition().y * scale;

	var easelRedPost = CreateBitmap(loader.getResult("post"), 5, 200);
	easelRedPost.x = redPost.GetBody().GetPosition().x * scale;
	easelRedPost.y = redPost.GetBody().GetPosition().y * scale;

	var easelBluePost = CreateBitmap(loader.getResult("post"), 5, 200);
	easelBluePost.x = bluePost.GetBody().GetPosition().x * scale;
	easelBluePost.y = bluePost.GetBody().GetPosition().y * scale;

	easelfootball = CreateBitmap(loader.getResult("football"), 20, 20);

	stage.addChild(easelbg, easelground, easelRedPost, easelBluePost, easelfootball);

	createjs.Ticker.framerate = 60;
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);
}

function tick(e) {
	world.Step(
		1/60, 	// FPS
		10,		// Velocity Iterations
		10		// Position Iterations
	);
	world.ClearForces();

	easelfootball.x = football.GetBody().GetPosition().x * scale;
	easelfootball.y = football.GetBody().GetPosition().y * scale;
	easelfootball.rotation = football.GetBody().GetAngle() * (180 / Math.PI);

	stage.update(e);
}