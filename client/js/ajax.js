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

function submitScore(name, score, difficulty) {
	$.ajax({
		url: "/senddata",
		type: "get",
		data: {name: name, score: score, difficulty: difficulty},
	})
	.done(function(json) {
		populateLeaderboard(difficulty);
	});
}

populateLeaderboard(document.querySelector("input[name='difficulty']:checked").id);