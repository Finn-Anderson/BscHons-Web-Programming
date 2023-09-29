class AI extends Actor {
	constructor(team, type) {
		super(team, type);

		this.reaction = document.querySelector("input[name='difficulty']:checked").value;
		this.command = [];
	}

	movement() {
		var force = this.force;

		if (!this.reactTimer) {
			this.command.length = 0;

			var ballLoc = football.GetBody().GetPosition();

			var x = this.body.GetPosition().x - ballLoc.x;
			var y = this.body.GetPosition().y - ballLoc.y;

			var dX = 1;
			if (this.team == "team-red") {
				dX = -1;
			}

			if (x < dX) {
				this.command.push("Right");
			} else {
				this.command.push("Left");
			}

			if (x < 2 && x > 0) {
				if (this.team == "team-blue" && y > 1) {
					this.command.push("Jump");
				} else if (this.team == "team-red" && y < 1) {
					this.command.push("Jump");
				}
			} else if (x > -2 && x < 0) {
				if (this.team == "team-red" && y > 1) {
					this.command.push("Jump");
				} else if (this.team == "team-blue" && y < 1) {
					this.command.push("Jump");
				}
			}
			
			if (this.canRun) {
				this.command.push("Run");
			}

			this.reactTimer = setTimeout(() => {
				this.reactTimer = null;
			}, this.reaction);
		}

		if (this.command.includes("Right")) {
			force.x += 1.0;
		} else if (this.command.includes("Left")) {
			force.x -= 1.0;
		} 

		if (this.command.includes("Jump")) {
			this.jump();
		}

		if (this.command.includes("Run")) {
			this.run = true;
		}

		this.force = force;
	}

	get reaction() {
		return this.reactionTime;
	}

	set reaction(time) {
		this.reactionTime = time;
	}
}