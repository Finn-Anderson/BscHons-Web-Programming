'use strict'
//
// This file contains object definitions for use in the game.
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


function CreateBox(density, friction, restitution, type, x, y, width, height, objid) {
	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = friction;
	fixDef.restitution = restitution;

	var bodyDef = new b2BodyDef;
	bodyDef.type = type;
	bodyDef.position.x = x / scale;
	bodyDef.position.y = y / scale;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(width/scale, height/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id:objid});

	return thisobj;
}

function CreateCircle(density, friction, restitution, type, x, y, r, objid) {
	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = friction;
	fixDef.restitution = restitution;

	var bodyDef = new b2BodyDef;
	bodyDef.type = type;
	bodyDef.position.x = x / scale;
	bodyDef.position.y = y / scale;

	fixDef.shape = new b2CircleShape(r/scale);

	var thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
	thisobj.GetBody().SetUserData({id:objid});

	return thisobj;
}