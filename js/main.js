'use strict'
//
// Box2dWeb definitions for use in the game.
//

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

function CreateObject(density, friction, restitution, type, x, y, objid) {
	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = friction;
	fixDef.restitution = restitution;

	var bodyDef = new b2BodyDef;
	bodyDef.type = type;
	bodyDef.position.x = x / scale;
	bodyDef.position.y = y / scale;

	return [fixDef, bodyDef]
}

function CreateBox(density, friction, restitution, type, x, y, width, height, objid) {
	var [fixDef, bodyDef] = CreateObject(density, friction, restitution, type, x, y, objid);

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(width/scale, height/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id:objid});

	return thisobj;
}

function CreateTriangle(density, friction, restitution, type, x, y, width, height, objid) {
	var [fixDef, bodyDef] = CreateObject(density, friction, restitution, type, x, y, objid);

	fixDef.shape = new b2PolygonShape;
	fixDef.vertexCount = 3;
	fixDef.vertices[0].Set(-(width / 2), 0.0);
	fixDef.vertices[1].Set((width / 2), 0.0);
	fixDef.vertices[2].Set(0.0, height);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id:objid});

	return thisobj;
}

function CreateCircle(density, friction, restitution, type, x, y, r, objid) {
	var [fixDef, bodyDef] = CreateObject(density, friction, restitution, type, x, y, objid);

	fixDef.shape = new b2CircleShape(r/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id:objid});

	return thisobj;
}

//
// Easel definitions for use in the game.
//
var easelCan = document.getElementsByTagName("canvas")[0];
var easelctx = easelCan.getContext("2d");
var stage = new createjs.Stage(easelCan);
stage.snapPixelsEnabled = true;

var manifest = [
	{src:"background.png", id:"background"},
	{src:"ground.png", id:"ground"},
	{src:"football.png", id:"football"},
	{src:"post.png", id:"post"},
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