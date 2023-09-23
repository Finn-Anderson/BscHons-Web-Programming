function DisplayPicking() {
	document.getElementById("pickside").style.display = "block";
}

function ChooseTeam(team) {
	document.getElementById("pickside").style.display = "none";

	if (players[localStorage.getItem("Index")]) {
		var ply = players[localStorage.getItem("Index")];

		destroylist.push(ply);

		players.splice(localStorage.getItem("Index"), 1);
	}

	var player = SpawnEntity(team, "player");

	localStorage.setItem("Index", players.length - 1);

	localStorage.setItem("Team", team);

	var count = 0;
	for (var i in players) {
		var id = players[i][0].GetBody().GetUserData().id;
		if (id == "player") count++;
	}

	if (count == 1) {
		StartGame(team);
	}
}

// Movement key listeners
var keys = [];
var chip = false;
var canRun = true;
var run = false;
var charge = 300;
var chargeTimer;
var keyBanList = [32, 65, 68];

document.addEventListener("keydown", (event) => {
	for (const key of keyBanList) {
		console.log(key);
		if (event.keyCode == key) {
			event.preventDefault();
		}
	}

	if (keys.includes(event.key.toLowerCase())) return;

	if (event.key == " ") Jump();

	if (event.key == "Control") chip = true;

	if (event.key == "Shift") run = true;

	keys.push(event.key.toLowerCase());
});

document.addEventListener("keyup", (event) => {
	var index = keys.indexOf(event.key.toLowerCase());

	if (event.key == "Control") chip = false;

	if (event.key == "Shift") run = false;

	keys.splice(index, 1);
});

function Movement() {
	var [player, force] = GetForce();

	if (keys.length > 0 && player && force) {
		if (keys.includes("d")) {
			force.x += 1.0;
		} 
		if (keys.includes("a")) {
			force.x -= 1.0;
		}

		SetForce(player, force);
	}
}

function Jump() {
	var [player, force] = GetForce();

	if (player && force) {
		force.y -= 10.0;

		SetForce(player, force);
	}
}

function AddCharge() {
	charge += 1;

	if (charge == 100) {
		canRun = true;
	}

	if (charge == 300) {
		clearInterval(chargeTimer);
		chargeTimer = null;
	}
}

function GetForce() {
	var i = localStorage.getItem("Index");

	var force;
	var player;
	if (i) {
		player = players[i][0];

		var velocity = player.GetBody().GetLinearVelocity();
		force = velocity;
	}

	return [player, force];
}

function SetForce(player, force) {
	var x = 3;
	var y = 10;

	if (canRun && run && force.x != 0) {
		x *= 2;
		charge -= 1;

		if (charge == 0) canRun = false;
	} else if (charge < 300 && !chargeTimer) {
		chargeTimer = setInterval(AddCharge, 20);
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

	player.GetBody().ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0)); // used to wake up player object and apply the set velocity
}