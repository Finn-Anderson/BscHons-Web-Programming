let physics;
class Actor {}

class Player extends Actor {
	constructor(team, type) {
		super(team, type);

		// Movement key listeners
		this.keys = [];
		this.keyBanList = [32, 65, 68];

		document.addEventListener("keydown", this.onKeyDown.bind(this));
		document.addEventListener("keyup", this.onKeyUp.bind(this));
	}

	onKeyDown(event) {
		for (const key of this.keyBanList) {
			if (event.keyCode == key) {
				event.preventDefault();
			}
		}

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

	movement() {
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

module.exports = function(actorIn, physicsIn) {
	Actor = actorIn;
	physics = physicsIn;

	return {Player};
}