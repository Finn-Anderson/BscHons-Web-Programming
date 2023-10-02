function populateLeaderboard(difficulty) {
	$.ajax({
		url: "/requestdata",
		type: "get",
		data: {difficulty: difficulty},
	})
	.done(function(json) {
		const data = JSON.parse(json);

		document.querySelector("caption").innerHTML = "Leaderboard - " + difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

		const table = document.querySelector("table");
		var tbody = table.querySelector('tbody');

		if (tbody) {
			table.removeChild(tbody);
		}

		tbody = document.createElement("tbody");
		table.appendChild(tbody);

		for (var i = 0; i < data.name.length; i++) {
			var tr = document.createElement("tr");

			var tdName = document.createElement("td");
			tdName.innerHTML = data.name[i];

			var tdScore = document.createElement("td");
			tdScore.innerHTML = data.score[i];

			tr.appendChild(tdName);
			tr.appendChild(tdScore);

			tbody.appendChild(tr);
		}
	});
}

function submitScore(score, difficulty) {
	document.getElementById("submit").remove();
	$.ajax({
		url: "/senddata",
		type: "get",
		data: {score: score, difficulty: difficulty},
	})
	.done(function() {
		populateLeaderboard(difficulty);
	});
}

function checkAuth() {
	$.ajax({
		url: "/checkauth",
		type: "get",
	})
	.done(function(json) {
		const data = JSON.parse(json);

		if (data.auth) {
			document.getElementById("login").style.display = "none";

			showSubmit = true;
		}
	});
}

checkAuth();
populateLeaderboard(document.querySelector("input[name='difficulty']:checked").id);