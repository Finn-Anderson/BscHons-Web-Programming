const Actor = require("./actor");

class AI extends Actor {
	constructor(team, type, physics, reaction) {
		super(team, type, physics);

		this.name = "Bot";

		this.reaction = reaction;
		this.command = [];
	}

	movement() {
		var force = this.force;

		// Get new command based on reaction time set by difficulty
		if (!this.reactTimer) {
			this.command.length = 0;

			var ballLoc;
			for (var actor of this.physics.dynamicList) {
				if (actor.GetBody().GetUserData().id == "football") {
					ballLoc = actor.GetBody().GetPosition();

					break;
				}
			}

			var x = this.body.GetPosition().x - ballLoc.x;
			var y = this.body.GetPosition().y - ballLoc.y;

			// Direction of opposition goal
			var dX = 1;
			if (this.team == "team-red") {
				dX = -1;
			}

			// Go in direction of opposition goal
			if (x < dX) {
				this.command.push("Right");
			} else {
				this.command.push("Left");
			}

			// Makes sure bots don't own goal. Bots jump over ball if it's on ground and close to them
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

		// Execute command
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

module.exports = AI;