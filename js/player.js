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

document.addEventListener("keydown", (event) => {
	if (event.key == " ") event.preventDefault();

	if (keys.includes(event.key.toLowerCase())) return;

	if (event.key == " ") Jump();

	keys.push(event.key.toLowerCase());
});

document.addEventListener("keyup", (event) => {
	var index = keys.indexOf(event.key.toLowerCase());

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
	if (force.x < -3 || force.x > 3) {
		if (force.x < -3) {
			force.x = -3;
		} else {
			force.x = 3;
		}
	}
	if (force.y < -10 || force.y > 10) {
		if (force.y < -10) {
			force.y = -10;
		} else {
			force.y = 10;
		}
	}

	player.GetBody().ApplyForce(new b2Vec2 (0.0, 0.0), new b2Vec2 (0.0, 0.0)); // used to wake up player object and apply the set velocity
}