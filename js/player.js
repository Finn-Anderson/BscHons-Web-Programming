// Picking Team
function ChooseTeam(team, value) {
	console.log(value);
	if (team == "Red" && value < 2) {
		document.getElementById("pickside").style.display = "none";

		document.getElementById("redteam").value++;

		SetRedTeamNum(document.getElementById("redteam").value);

	} else if (value < 2) {
		document.getElementById("pickside").style.display = "none";

		document.getElementById("blueteam").value++

		SetBlueTeamNum(document.getElementById("blueteam").value);
	}

	localStorage.setItem("Team", team);
}

function SetRedTeamNum(value) {
	document.getElementsByClassName("capacity")[0].innerHTML = value + " / 2";
}

function SetBlueTeamNum(value) {
	document.getElementsByClassName("capacity")[1].innerHTML = value + " / 2";
}

SetRedTeamNum(document.getElementById("redteam").value);
SetBlueTeamNum(document.getElementById("blueteam").value);

// Setting Score
function SetScore(team) {
	var score = document.getElementById("score");
	if (team == "Red") {
		score.firstChild.innerHTML++;
	} else {
		score.lastChild.innerHTML++;
	}
}

// Increment Timer
var totalSecs = 0;
function SetTimer() {
	totalSecs++;

	var seconds = totalSecs % 60;
	var minutes = parseInt(totalSecs / 60);

	if (seconds < 10) {
		var seconds = "0" + seconds;
	}
	if (minutes < 10) {
		var minutes = "0" + minutes;
	}

	document.getElementById("timer").innerHTML = minutes + ":" + seconds;
}
setInterval(SetTimer, 1000);