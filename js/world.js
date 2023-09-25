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
var ground = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), (height - 5), (width / 2), 1, "ground", false);
var ceiling = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width / 2), 1, (width / 2), 1, "ceiling", false);
var leftWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, 1, height, 1, height, "leftWall", false);
var rightWall = CreateBox(1.0, 0.0, 0.2, b2Body.b2_staticBody, (width - 1), height, 1, height, "rightWall", false);

// Create goal posts
var redPost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 60, height, 60, 200, "redPost", false);
var redCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 58, (height - 200), 62, 6, "redCrossbar", false);
var redGoal = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 30, (height - 95), 38, 100, "redGoal", true);

var bluePost = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 60), height, 60, 200, "bluePost", false);
var blueCrossbar = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 58), (height - 200), 62, 6, "blueCrossbar", false);
var blueGoal = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 30), (height - 95), 38, 100, "blueGoal", true);

// Define football to use later
var easelfootball;
var football;

// Allow football to go through posts
var filter = ground.GetFilterData(); // Getting any object that must collide with the player and football would do.
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

	if (play) {
		Movement();

		Kick();
	}
}

var contacts = [];
var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function(contact) {
	var obj1 = contact.GetFixtureA().GetBody();
	var obj2 = contact.GetFixtureB().GetBody();

	if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
		contacts.push(obj2);

		localStorage.setItem("contact", contacts.indexOf(obj2));
	} else if ((obj1.GetUserData().id == "redGoal" || obj1.GetUserData().id == "blueGoal") && obj2.GetUserData().id == "football") {
		if (obj1.GetUserData().id == "redGoal") {
			SetScore("team-blue");
		} else {
			SetScore("team-red");
		}
	}
}
listener.EndContact = function(contact) {
	var obj1 = contact.GetFixtureA().GetBody();
	var obj2 = contact.GetFixtureB().GetBody();

	if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
		localStorage.removeItem("contact");
	}
}
this.world.SetContactListener(listener);