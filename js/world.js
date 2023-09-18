'use strict'
// Defining canvas and world
var width = 800;
var height = 600;
var scale = 30;

var world = new b2World(
	new b2Vec2(0,9.81),
	true
);

// Debugging
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(document.getElementById("b2dcan").getContext("2d")
);
debugDraw.SetDrawScale(scale);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

// Update world
function update() {
	world.Step(
		1/60, 	// FPS
		10,		// Velocity Iterations
		10		// Position Iterations
	);
	world.DrawDebugData();
	world.ClearForces();
	window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);

// Create ground and walls
var ground = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), (height - 5), (width / 2), 5, "ground");
var ceiling = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width / 2), 5, (width / 2), 5, "ground");
var leftWall = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, 5, height, 5, height, "ground");
var rightWall = CreateBox(1.0, 0.5, 0.2, b2Body.b2_staticBody, (width - 5), height, 5, height, "ground");

var football = CreateCircle(1.0, 0.2, 0.8, b2Body.b2_dynamicBody, 400, 250, 20, "football");