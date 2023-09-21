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
var redPost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 60, height, 60, 200, "redPost");
var redCrossbar = CreateTriangle(1.0, 0.5, 0.2, b2Body.b2_staticBody, 58, (height - 250), 62, 50, "redCrossbar", "bottomLeft");

var bluePost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 60), height, 60, 200, "bluePost");
var blueCrossbar = CreateTriangle(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 58), (height - 250), 62, 50, "blueCrossbar", "bottomRight");

// Create dynamic objects
var football = CreateCircle(1.0, 0.2, 0.8, b2Body.b2_dynamicBody, (width / 2), (height - 300), 20, "football");

// Allow football to go through posts
var filter = redPost.GetFilterData(); // Getting either posts or football would do.
filter.categoryBits = 0x0002;
filter.groupIndex = -8;
redPost.SetFilterData(filter);
bluePost.SetFilterData(filter);
football.SetFilterData(filter);

// Destroy list
var destroylist = [];

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

	var easelRedPost = CreateBitmap(loader.getResult("post"), 60, 200);
	easelRedPost.x = redPost.GetBody().GetPosition().x * scale;
	easelRedPost.y = redPost.GetBody().GetPosition().y * scale;

	var easelRedCrossbar = CreateBitmap(loader.getResult("crossbar"), 62, 50);
	easelRedCrossbar.x = redCrossbar.GetBody().GetPosition().x * scale;
	easelRedCrossbar.y = redCrossbar.GetBody().GetPosition().y * scale;

	var easelBluePost = CreateBitmap(loader.getResult("post"), 60, 200);
	easelBluePost.x = bluePost.GetBody().GetPosition().x * scale;
	easelBluePost.y = bluePost.GetBody().GetPosition().y * scale;
	easelBluePost.rotation = 180;

	var easelBlueCrossbar = CreateBitmap(loader.getResult("crossbar"), 62, 50);
	easelBlueCrossbar.x = blueCrossbar.GetBody().GetPosition().x * scale;
	easelBlueCrossbar.y = blueCrossbar.GetBody().GetPosition().y * scale;
	easelBlueCrossbar.scaleX = -easelBlueCrossbar.scaleX;

	easelfootball = CreateBitmap(loader.getResult("football"), 20, 20);

	stage.addChild(easelbg, easelground, easelRedPost, easelRedCrossbar, easelBluePost, easelBlueCrossbar, easelfootball);

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

	for(var ply of destroylist) {
		stage.removeChild(ply[1]);

		world.DestroyBody(ply[0].GetBody());
	}
	destroylist.length = 0;


	easelfootball.x = football.GetBody().GetPosition().x * scale;
	easelfootball.y = football.GetBody().GetPosition().y * scale;
	easelfootball.rotation = football.GetBody().GetAngle() * (180 / Math.PI);

	for (var i in players) {
		players[i][1].x = players[i][0].GetBody().GetPosition().x * scale;
		players[i][1].y = players[i][0].GetBody().GetPosition().y * scale;
		players[i][1].rotation = players[i][0].GetBody().GetAngle() * (180 / Math.PI);
	}

	stage.update(e);
}