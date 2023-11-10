let io;

//
// Box2dWeb definitions for use in the game.
//
const Box2D = require("box2dweb-commonjs").Box2D;

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

function add(body, response) {
	if (!response) return;

	var userdata = response.data;
	userdata.render = response.render;

	body.SetUserData(userdata);
}

function CreateObject(density, friction, restitution, bDynamic, x, y, angle, objid, sensor) {
	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = friction;
	fixDef.restitution = restitution;
	fixDef.isSensor = sensor;

	let type;
	if (bDynamic) {
		type = b2Body.b2_dynamicBody;
	} else {
		type = b2Body.b2_staticBody;
	}

	var bodyDef = new b2BodyDef;
	bodyDef.type = type;
	bodyDef.position.x = x / scale;
	bodyDef.position.y = y / scale;
	bodyDef.angle = angle;

	return [fixDef, bodyDef];
}

function CreateBox(density, friction, restitution, bDynamic, x, y, width, height, angle, objid, sensor) {
	var [fixDef, bodyDef] = CreateObject(density, friction, restitution, bDynamic, x, y, angle, objid, sensor);

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(width/scale, height/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id: objid, width: width, height: height});

	io.sockets.emit("add", thisobj.GetBody().GetUserData(), thisobj.GetBody().GetPosition(), thisobj.GetBody().GetAngle(), (response) => { add(thisobj.GetBody(), response); });

	return thisobj;
}

function CreateCircle(density, friction, restitution, bDynamic, x, y, r, angle, objid) {
	var [fixDef, bodyDef] = CreateObject(density, friction, restitution, bDynamic, x, y, angle, objid);

	fixDef.shape = new b2CircleShape(r/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id: objid, width: width, height: height});

	io.sockets.emit("add", thisobj.GetBody().GetUserData(), thisobj.GetBody().GetPosition(), thisobj.GetBody().GetAngle(), (response) => { add(thisobj.GetBody(), response); });

	return thisobj;
}

//
// Physics Engine code.
//

// Defining canvas and world
let width = 1280;
let height = 540;
let scale = 30;
let fps = 60;

let world;

function setupCollisions() {
	// Create ground and walls
	let ground = CreateBox(1.0, 0.5, 0.2, false, (width / 2), (height - 5), (width / 2), 1, 0, "ground", false);
	let ceiling = CreateBox(1.0, 0.0, 0.2, false, (width / 2), 1, (width / 2), 1, 0, "ceiling", false);
	let leftWall = CreateBox(1.0, 0.0, 0.2, false, 1, height, 1, height, 0, "leftWall", false);
	let rightWall = CreateBox(1.0, 0.0, 0.2, false, (width - 1), height, 1, height, 0, "rightWall", false);

	// Create goal posts
	let redPost = CreateBox(1.0, 0.5, 0.2, false, 60, height, 60, 200, 0, "post", false);
	let redCrossbar = CreateBox(1.0, 0.5, 0.2, false, 58, (height - 200), 62, 6, 0, "crossbar", false);
	let redGoal = CreateBox(1.0, 0.5, 0.2, false, 30, (height - 95), 38, 100, 0, "redGoal", true);

	let bluePost = CreateBox(1.0, 0.5, 0.2, false, (width - 60), height, 60, 200, 180, "post", false);
	let blueCrossbar = CreateBox(1.0, 0.5, 0.2, false, (width - 58), (height - 200), 62, 6, 180, "crossbar", false);
	let blueGoal = CreateBox(1.0, 0.5, 0.2, false, (width - 30), (height - 95), 38, 100, 180, "blueGoal", true);

	// Allow football to go through posts
	let filter = ground.GetFilterData(); // Set collision of any object that must collide with the player and football.
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
}

// Variables that are used later in gamemode
let play;
let dynamicList = [];

function init() {
	world = new b2World(
		new b2Vec2(0,9.81),
		true
	);

	setupCollisions();

	initialiseContacts();

	let interval = setInterval(function() {
		tick();
	}, 1000/fps);
	tick();

	return world;
}

function destroy(actor) {
	io.sockets.emit("remove", actor.GetBody().GetUserData().render);

	world.DestroyBody(actor.GetBody());
}

function tick() {
	world.Step(
		1/fps, 	// FPS
		10,		// Velocity Iterations
		10		// Position Iterations
	);
	world.ClearForces();

	if (play) {
		for (var actor of dynamicList) {
			if (actor.GetBody().GetUserData().id != "football") {
				const a = actor.GetBody().GetUserData().actor;

				a.movement();
			} else {
				// Gives ball friction so that it gradually slows down
				var ballVelocity = actor.GetBody().GetLinearVelocity();
				if (Math.sign(ballVelocity.x) == -1) {
					ballVelocity.x += 0.01;
				} else if (Math.sign(ballVelocity.x) == 1)  {
					ballVelocity.x -= 0.01; 
				}

				if (!canScore) {
					ZoomIntoScorer(actor.GetBody().GetUserData());
				}
			}
		}

		io.sockets.emit("tick", dynamicList);
	}
}

let setScoreFunc;
function initialiseContacts() {
	let listener = new Box2D.Dynamics.b2ContactListener;

	var obj1;
	var obj2;

	listener.BeginContact = function(contact) {
		// Make sure obj2 is football for if statements
		if (contact.GetFixtureA().GetBody().GetUserData().id == "football") {
			obj1 = contact.GetFixtureB().GetBody();
			obj2 = contact.GetFixtureA().GetBody();
		} else {
			obj1 = contact.GetFixtureA().GetBody();
			obj2 = contact.GetFixtureB().GetBody();
		}

		if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
			for (var actor of dynamicList) {
				if (actor.GetBody() == obj1) {
					const a = actor.GetBody().GetUserData().actor;

					a.contact = obj2;

					a.kick();
				}
			}
		} else if ((obj1.GetUserData().id == "redGoal" || obj1.GetUserData().id == "blueGoal") && obj2.GetUserData().id == "football") {
			setScoreFunc(obj1.GetUserData().id);
		} else if ((obj2.GetUserData().id == "player" || obj2.GetUserData().id == "bot") && (obj1.GetUserData().id == "ground" || obj1.GetUserData().id == "crossbar")) {
			for (var actor of dynamicList) {
				if (actor.GetBody() == obj2) {
					const a = actor.GetBody().GetUserData().actor;

					a.jumpCount = 0;
				}
			}
		}
	}
	listener.EndContact = function(contact) {
		// Make sure obj2 is football for if statements
		if (contact.GetFixtureA().GetBody().GetUserData().id == "football") {
			obj1 = contact.GetFixtureB().GetBody();
			obj2 = contact.GetFixtureA().GetBody();
		} else {
			obj1 = contact.GetFixtureA().GetBody();
			obj2 = contact.GetFixtureB().GetBody();
		}

		if ((obj1.GetUserData().id == "player" || obj1.GetUserData().id == "bot") && obj2.GetUserData().id == "football") {
			for (var actor of dynamicList) {
				if (actor.GetBody() == obj1) {
					const a = actor.GetBody().GetUserData().actor;

					a.contact = null;
				}
			}
		}
	}
	world.SetContactListener(listener);
}

function callback(func) {
	setScoreFunc = func;
}

module.exports = function(ioIn) {
	io = ioIn;

	return {init, add, dynamicList, CreateCircle, play, width, height, scale};
}