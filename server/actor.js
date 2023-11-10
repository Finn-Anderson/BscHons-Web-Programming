class Actor {
	constructor(team, type, physics) {
		// Movement key states
		this.chip = false;
		this.canRun = true;
		this.run = false;
		this.stamina = 300;
		this.staminaTimer = null;
		this.jumpCount = 0;

		this.team = team;

		this.contact = null;

		this.body = this.spawn(team, type, physics);
	}

	/**
	 * Spawns the actor body and appends to actor array.
	 * - `team` (String) is the team the actor belongs to.
	 * - `type` (String) is whether it is bot or player.
	 */
	spawn(team, type, physics) {
		var x;
		if (team == "team-red") {
			x = 200;
		} else {
			x = 1280 - 200;
		}

		var actor = physics.CreateCircle(0.0, 0.2, 0.0, true, x, (720 - 300), 20, type);
		var filter = actor.GetFilterData();
		filter.categoryBits = 0x0004;
		filter.maskBits = 0x0002;
		filter.groupIndex = 2;
		actor.SetFilterData(filter);

		var data = actor.GetBody().GetUserData();
		data.actor = this;
		actor.GetBody().SetUserData(data);

		physics.dynamicList.push(actor);

		return actor.GetBody();
	}

	jump() {
		if (this.jumpCount < 2) {
			var force = this.force;

			if (force) {
				force.y -= 10.0;

				this.jumpCount++;

				this.force = force;
			}
		}
	}

	kick() {
		if (!this.contact) return;

		var force = this.force;

		// Makes sure kicking ball is not glued to the player by multiplying player movement force by 1.2
		var finalV = Math.hypot(force.x, force.y) * 1.2;

		if (finalV > 0) {
			var bV = this.contact.GetLinearVelocity();
		
			// Get contact position of player and ball
			var pos = new b2Vec2((this.contact.GetPosition().x - this.body.GetPosition().x), (this.contact.GetPosition().y - this.body.GetPosition().y));

			bV.x = pos.x * finalV;
			bV.y = pos.y * finalV;

			if (this.chip) {
				// Moves ball vertically by twice horizontal speed with limits. 
				bV.y = -Math.min(Math.abs(bV.x) * 2, 16);
			}

			if (playAudio) {
				document.getElementById("audioKick").play();
			}
		}

		// Log last to kick ball before goal for zoom-in effect
		var data = this.contact.GetUserData();
		data.last = this.body;
	}

	get contact() {
		return this._contact;
	}

	set contact(contact) {
		this._contact = contact;
	}

	get jumpCount() {
		return this._jumpCount;
	}

	set jumpCount(count) {
		this._jumpCount = count;
	}

	get stamina() {
		return this._stamina;
	}

	set stamina(value) {
		if (value == 300) {
			this._stamina = value;
			return;
		}

		this._stamina += value;
		this._stamina = Math.min(Math.max(this._stamina, 0), 300);

		if (this.stamina == 0) {
			this.canRun = false;
		} else if (this.stamina >= 100) {
			this.canRun = true;
		} 

		if (this.stamina == 300) {
			clearInterval(this.staminaTimer);
			this.staminaTimer = null;
		}
	}

	get force() {
		var force = this.body.GetLinearVelocity();

		return force;
	}

	set force(force) {
		var x = 3;
		var y = 10;

		// Check if to run or to recharge stamina
		if (this.canRun && this.run && force.x != 0) {
			x *= 2;
			this.stamina = -1;
		} else if (this.stamina < 300 && !this.staminaTimer) {
			this.staminaTimer = setInterval(() => {
				this.stamina = 1;
			}, 20);
		}

		// Apply x and y force of player for movement
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

module.exports = Actor;