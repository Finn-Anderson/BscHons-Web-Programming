'use strict'
// Defining canvas and world
var width = 1280;
var height = 540;
var scale = 30;

document.getElementsByTagName("canvas")[0].width = width;
document.getElementsByTagName("canvas")[0].height = height;

var world = new b2World(
	new b2Vec2(0,9.81),
	true
);

// Create ground and walls
var ground = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), (height - 5), (width / 2), 1, "ground");
var ceiling = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width / 2), 1, (width / 2), 1, "ceiling");
var leftWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, 1, height, 1, height, "leftWall");
var rightWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width - 1), height, 1, height, "rightWall");

// Create goal posts
var redPost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 60, height, 60, 200, "redPost");
var redCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 58, (height - 200), 62, 6, "redCrossbar");

var bluePost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 60), height, 60, 200, "bluePost");
var blueCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 58), (height - 200), 62, 6, "blueCrossbar");

// Define football to use later
var easelfootball;
var football;

// Allow football to go through posts
var filter = ground.GetFilterData(); // Getting any object that must collide with the player and football would do.
filter.categoryBits = 0x0002;
filter.maskBits = 0x0004;
ground.SetFilterData(filter);
ceiling.SetFilterData(filter);
leftWall.SetFilterData(filter);
rightWall.SetFilterData(filter);
redCrossbar.SetFilterData(filter);
blueCrossbar.SetFilterData(filter);

// Destroy list
var destroylist = [];

// Load images
var loader = new createjs.LoadQueue(false);
loader.addEventListener("complete", start);
loader.loadManifest(manifest, true, "./assets/");

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

	var easelRedCrossbar = CreateBitmap(loader.getResult("crossbar"), 62, 6);
	easelRedCrossbar.x = redCrossbar.GetBody().GetPosition().x * scale;
	easelRedCrossbar.y = redCrossbar.GetBody().GetPosition().y * scale;

	var easelBluePost = CreateBitmap(loader.getResult("post"), 60, 200);
	easelBluePost.x = bluePost.GetBody().GetPosition().x * scale;
	easelBluePost.y = bluePost.GetBody().GetPosition().y * scale;
	easelBluePost.rotation = 180;

	var easelBlueCrossbar = CreateBitmap(loader.getResult("crossbar"), 62, 6);
	easelBlueCrossbar.x = blueCrossbar.GetBody().GetPosition().x * scale;
	easelBlueCrossbar.y = blueCrossbar.GetBody().GetPosition().y * scale;
	easelBlueCrossbar.scaleX = -easelBlueCrossbar.scaleX;

	stage.addChild(easelbg, easelground, easelRedPost, easelRedCrossbar, easelBluePost, easelBlueCrossbar);

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

	for(var obj of destroylist) {
		stage.removeChild(obj[1]);

		world.DestroyBody(obj[0].GetBody());
	}
	destroylist.length = 0;

	if (football) {
		easelfootball.x = football.GetBody().GetPosition().x * scale;
		easelfootball.y = football.GetBody().GetPosition().y * scale;
		easelfootball.rotation = football.GetBody().GetAngle() * (180 / Math.PI);

		// Gives ball friction so that it gradually slows down
		var ballVelocity = football.GetBody().GetLinearVelocity();
		if (Math.sign(ballVelocity.x) == -1) {
			ballVelocity.x += 0.01;
		} else if (Math.sign(ballVelocity.x) == 1)  {
			ballVelocity.x -= 0.01; 
		}
	}

	for (var i in players) {
		players[i][1].x = players[i][0].GetBody().GetPosition().x * scale;
		players[i][1].y = players[i][0].GetBody().GetPosition().y * scale;
		players[i][1].rotation = players[i][0].GetBody().GetAngle() * (180 / Math.PI);

		if (players[i][1].x < -20 || players[i][1].x > (width + 20)) {
			players[i][0].GetBody().SetPosition(new b2Vec2(200, (height - 300)));
			players[i][1].x = players[i][0].GetBody().GetPosition().x * scale;
		}
	}

	stage.update(e);

	Movement();
}

var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function(contact) {
	if ((contact.GetFixtureA().GetBody().GetUserData().id == "player" || contact.GetFixtureA().GetBody().GetUserData().id == "bot") && contact.GetFixtureB().GetBody().GetUserData().id == "football") {
		var ply = contact.GetFixtureA().GetBody();
		var ball = contact.GetFixtureB().GetBody();

		var pV = contact.GetFixtureA().GetBody().GetLinearVelocity();
		var bV = contact.GetFixtureB().GetBody().GetLinearVelocity();
		
		var pos = new b2Vec2((ply.GetPosition().x - ball.GetPosition().x), (ply.GetPosition().y - ball.GetPosition().y));

		bV.x = -pos.x * Math.abs(pV.x) * 2;
		bV.y = pos.y * Math.abs(pV.y) * 4;

		if (chip) {
			if (bV.y == 0) {
				bV.y -= 15;
			}
		}
	}
}
this.world.SetContactListener(listener);