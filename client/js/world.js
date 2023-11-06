'use strict'
// Defining canvas and world
var width = 1280;
var height = 540;
var scale = 30;

document.getElementById("viewport").width = width;
document.getElementById("viewport").height = height;

document.getElementsByTagName("canvas")[0].width = width;
document.getElementsByTagName("canvas")[0].height = height;

var world = new b2World(
	new b2Vec2(0,9.81),
	true
);

// Create ground and walls
var ground = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), (height - 5), (width / 2), 1, "ground", false);
var ceiling = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width / 2), 1, (width / 2), 1, "ceiling", false);
var leftWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, 1, height, 1, height, "leftWall", false);
var rightWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width - 1), height, 1, height, "rightWall", false);

// Create goal posts
var redPost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 60, height, 60, 200, "redPost", false);
var redCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 58, (height - 200), 62, 6, "crossbar", false);
var redGoal = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 30, (height - 95), 38, 100, "redGoal", true);

var bluePost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 60), height, 60, 200, "bluePost", false);
var blueCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 58), (height - 200), 62, 6, "crossbar", false);
var blueGoal = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 30), (height - 95), 38, 100, "blueGoal", true);

// Define football to use later
var easelfootball;
var football;

// Allow football to go through posts
var filter = ground.GetFilterData(); // Set collision of any object that must collide with the player and football.
filter.categoryBits = 0x0002;
filter.maskBits = 0x0004;
filter.groupIndex = 8;
ground.SetFilterData(filter);
ceiling.SetFilterData(filter);
leftWall.SetFilterData(filter);
rightWall.SetFilterData(filter);
redCrossbar.SetFilterData(filter);
blueCrossbar.SetFilterData(filter);
redGoal.SetFilterData(filter);
blueGoal.SetFilterData(filter);

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

		if (obj[0] instanceof Actor) {
			world.DestroyBody(obj[0].body);
		} else {
			world.DestroyBody(obj[0].GetBody());
		}
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

	for (var actor of actors) {
		actor[1].x = actor[0].body.GetPosition().x * scale;
		actor[1].y = actor[0].body.GetPosition().y * scale;
		actor[1].rotation = actor[0].body.GetAngle() * (180 / Math.PI);
	}

	if (play) {
		for (var actor of actors) {
			actor[0].movement();
		}

		if (!canScore) {
			ZoomIntoScorer(football.GetBody().GetUserData());
		}
	}

	stage.update(e);
}

var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function(contact) {
	var obj1;
	var obj2;

	// Make sure obj2 is football for if statements
	if (contact.GetFixtureA().GetBody().GetUserData().id == "football") {
		obj1 = contact.GetFixtureB().GetBody();
		obj2 = contact.GetFixtureA().GetBody();
	} else {
		obj1 = contact.GetFixtureA().GetBody();
		obj2 = contact.GetFixtureB().GetBody();
	}

	if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
		for (var actor of actors) {
			if (actor[0].body == obj1) {
				actor[0].contact = obj2;

				actor[0].kick();
			}
		}
	} else if ((obj1.GetUserData().id == "redGoal" || obj1.GetUserData().id == "blueGoal") && obj2.GetUserData().id == "football") {
		if (obj1.GetUserData().id == "redGoal") {
			SetScore("team-blue");
		} else {
			SetScore("team-red");
		}
	} else if ((obj2.GetUserData().id == "player" || obj2.GetUserData().id == "bot") && (obj1.GetUserData().id == "ground" || obj1.GetUserData().id == "crossbar")) {
		for (var actor of actors) {
			if (actor[0].body == obj2) {
				actor[0].jumpCount = 0;
			}
		}
	}
}
listener.EndContact = function(contact) {
	var obj1;
	var obj2;

	// Make sure obj2 is football for if statements
	if (contact.GetFixtureA().GetBody().GetUserData().id == "football") {
		obj1 = contact.GetFixtureB().GetBody();
		obj2 = contact.GetFixtureA().GetBody();
	} else {
		obj1 = contact.GetFixtureA().GetBody();
		obj2 = contact.GetFixtureB().GetBody();
	}

	if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
		for (var actor of actors) {
			if (actor[0].body == obj1) {
				actor[0].contact = null;
			}
		}
	}
}
this.world.SetContactListener(listener);