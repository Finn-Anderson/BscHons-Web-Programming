const Actor = require("./actor");

class Player extends Actor {
	constructor(team, type, physics) {
		super(team, type, physics);

		// Movement key listeners
		this.keys = [];
	}

	onKeyDown(event) {
		if (this.keys.includes(event.key.toLowerCase())) return;

		if (event.key == " ") this.jump();

		if (event.key == "Control") this.chip = true;

		if (event.key == "Shift") this.run = true;
		
		this.keys.push(event.key.toLowerCase());
	}

	onKeyUp(event) {
		var index = this.keys.indexOf(event.key.toLowerCase());

		if (event.key == "Control") this.chip = false;

		if (event.key == "Shift") this.run = false;

		if (index > -1) {
			this.keys.splice(index, 1);
		}
	}

	movement(football) {
		var force = this.force;

		if (this.keys.length > 0) {
			if (this.keys.includes("d")) {
				force.x += 1.0;
			} 
			if (this.keys.includes("a")) {
				force.x -= 1.0;
			}

			this.force = force;
		}
	}
}

module.exports = Player;