class AI extends Actor {
	constructor(team, type) {
		super(team, type);
	}

	movement() {
		var force = this.force;
		var ballLoc = football.GetBody().GetPosition();

		var x = this.body.GetPosition().x - ballLoc.x;
		var y = this.body.GetPosition().y - ballLoc.y;

		var dX = 1;
		if (this.team == "team-red") {
			dX = -1;
		}

		if (x < dX) {
			force.x += 1.0;
		} else {
			force.x -= 1.0;
		}

		if (x < 2 && x > 0) {
			if (this.team == "team-blue" && y > 1) {
				this.jump();
			} else if (this.team == "team-red" && y < 1) {
				this.jump();
			}
		} else if (x > -2 && x < 0) {
			if (this.team == "team-red" && y > 1) {
				this.jump();
			} else if (this.team == "team-blue" && y < 1) {
				this.jump();
			}
		}
		
		if (this.canRun) {
			this.run = true;
		}

		this.force = force;
	}
}