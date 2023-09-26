class Actor {
	constructor(team, type) {
		// Movement key states
		this.chip = false;
		this.canRun = true;
		this.run = false;
		this.runCharge = 300;
		this.chargeTimer;

		this.body = this.spawn(team, type);
	}

	spawn(team, type) {
		var x;
		if (team == "team-red") {
			x = 200;
		} else {
			x = width - 200;
		}

		var actor = CreateCircle(0.0, 0.2, 0.0, b2Body.b2_dynamicBody, x, (height - 300), 20, type);
		var filter = actor.GetFilterData();
		filter.categoryBits = 0x0004;
		filter.maskBits = 0x0002;
		filter.groupIndex = 2;
		actor.SetFilterData(filter);

		var easelPlayer = CreateBitmap(loader.getResult(team), 20, 20);

		stage.addChild(easelPlayer);

		actors.push([this, easelPlayer, team]);

		SetTeamNum();

		return actor.GetBody();
	}

	jump() {
		var force = this.force;

		if (force) {
			force.y -= 10.0;

			this.force = force;
		}
	}

	kick() {
		var ball = contacts[localStorage.getItem("contact")];
		if (ball) {
			var force = this.force;
			var bV = ball.GetLinearVelocity();
			
			var pos = new b2Vec2((ball.GetPosition().x - this.body.GetPosition().x), (ball.GetPosition().y - this.body.GetPosition().y));

			var finalV = Math.hypot(force.x, force.y) * 1.5;

			bV.x = pos.x * finalV;
			bV.y = pos.y * finalV;

			if (this.chip) {
				console.log(bV.x);
				bV.y = Math.min(Math.max(bV.x, -4), 4) * 4;
			}
		}
	}

	get charge() {
		return this.runCharge;
	}

	set charge(value) {
		this.runCharge += value;
		this.runCharge = Math.min(Math.max(this.runCharge, 0), 300);

		if (this.charge == 0) {
			this.canRun = false;
		} else if (this.charge >= 100) {
			this.canRun = true;
		} 

		if (this.charge == 300) {
			clearInterval(this.chargeTimer);
			this.chargeTimer = null;
		}
	}

	get force() {
		var force = this.body.GetLinearVelocity();

		return force;
	}

	set force(force) {
		var x = 3;
		var y = 10;

		if (this.canRun && this.run && force.x != 0) {
			x *= 2;
			this.charge = -1;
		} else if (this.charge < 300 && !this.chargeTimer) {
			this.chargeTimer = setInterval(() => {
				this.charge = 1;
			}, 20);
		}

		if (force.x < -x || force.x > x) {
			if (force.x < -x) {
				force.x = -x;
			} else {
				force.x = x;
			}
		}
		if (force.y < -y || force.y > y) {
			if (force.y < -y) {
				force.y = -y;
			} else {
				force.y = y;
			}
		}

		this.body.ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0)); // used to wake up player object and apply the set velocity
	}
}