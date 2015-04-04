var currentGame = new Object();
var gameActive = false;

window.onload = function() {
    console.log("START");

    $('#createPlayerButton').on('click', createPlayer);
    $('#createGameButton').on('click', createGame);
    $('#createRoundButton').on('click', createRound);
    $('#generateStatsButton').on('click', generateStats);

    populatePlayers();
}

function createPlayer() {
	console.log("In create player...");

	if($('#username').val() != "" && $('#username').val().length <= 16 
		&& $('#passphrase').val() != "" && $('#passphrase').val().length <= 12) {

		var query = "INSERT INTO Player (username, passphrase) VALUES ('" + $('#username').val() + "','" + $('#passphrase').val() +"')";
		var sendData = {
			"query": query
		};

		$.ajax({
			type: 'POST',
			data: sendData,
			url: '/query'
		}).done(function(response) {
			if (response.affectedRows > 0) {
				alert("Player successfully created.");
			}
			populatePlayers();
		});
	} else {
		alert("Invalid username and passphrase.");
	}
}

function createGame() {	
	console.log("In create game...");

	if (gameActive) {
		alert("A game is active. You can not create a new game!");
	} else {
		gameActive = true;
	}

	currentGame.playerID1 = $('#playerCombo1 option:selected').attr('rel');
	currentGame.playerID2 = $('#playerCombo2 option:selected').attr('rel');
	currentGame.playerID3 = $('#playerCombo3 option:selected').attr('rel');
	currentGame.playerID4 = $('#playerCombo4 option:selected').attr('rel');

	currentGame.username1 = $('#playerCombo1 option:selected').val();
	currentGame.username2 = $('#playerCombo2 option:selected').val();
	currentGame.username3 = $('#playerCombo3 option:selected').val();
	currentGame.username4 = $('#playerCombo4 option:selected').val();

	currentGame.score1 = 0;
	currentGame.score2 = 0;
	currentGame.score3 = 0;
	currentGame.score4 = 0;

	var query = "INSERT INTO Game (gameType) VALUES ('hearts')";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {

		if (response.affectedRows > 0) {
			getMaxGameID(function(gameID) {
				currentGame.gameID = gameID;
				var query = "INSERT INTO Participant VALUES (" 
				 + currentGame.gameID + ", " + currentGame.playerID1 + ", 'north'), ("
				 + currentGame.gameID + ", " + currentGame.playerID2 + ", 'south'), (" 
				 + currentGame.gameID + ", " + currentGame.playerID3 + ", 'east'), (" 
				 + currentGame.gameID + ", " + currentGame.playerID4 + ", 'west')";
				var sendData = {
					"query": query
				};

				$.ajax({
					type: 'POST',
					data: sendData,
					url: '/query'
				}).done(function(response) {
					if (response.affectedRows > 0) {
						populateQueen();

						alert("Succesfully created a game!");
					}
				});
			});			
		}		
	});
}

function populatePlayers() {
	console.log("In populate players...");

	$("#playerCombo1").empty();
	$("#playerCombo2").empty();
	$("#playerCombo3").empty();
	$("#playerCombo4").empty();

	var query = "SELECT playerID, username FROM Player";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		var usernames = response;
		for (var i = 0; i<usernames.length; i++) {

			var newSelectOption = '<option value="' + usernames[i].username 
			+ '" rel="' + usernames[i].playerID + '">'
			+ usernames[i].username + '</option>'

			$("#playerCombo1").append(newSelectOption);
			$("#playerCombo2").append(newSelectOption);
			$("#playerCombo3").append(newSelectOption);
			$("#playerCombo4").append(newSelectOption);
			$("#playerStatsCombo").append(newSelectOption);
		}
	});
}

function createRound() {
	console.log("In create round...");

	if(validRoundScores()) {

		getMaxRoundID(function(roundID) {
			var query = "INSERT INTO HeartsRound (roundID, gameID, tookQueenOfSpades) VALUES (" 
				+ roundID + ",	" 
				+ currentGame.gameID + ", " 
				+ $('#queenCombo option:selected').val() + ")";
			var sendData = {
				"query": query
			};

			$.ajax({
				type: 'POST',
				data: sendData,
				url: '/query'
			}).done(function(response) {

				if (response.affectedRows > 0) {

					var query = "INSERT INTO Score (amount, roundID, playerID) VALUES (" 
						+ $('#score1').val() + ", " + roundID + ", " + currentGame.playerID1 + "), (" 
						+ $('#score2').val() + ", " + roundID + ", " + currentGame.playerID2 + "), (" 
						+ $('#score3').val() + ", " + roundID + ", " + currentGame.playerID3 + "), (" 
						+ $('#score4').val() + ", " + roundID + ", " + currentGame.playerID4 + ")";
					var sendData = {
						"query": query
					};

					$.ajax({
						type: 'POST',
						data: sendData,
						url: '/query'
					}).done(function(response) {
						alert("Successfully added round.");

						populateCurrentScore();
						checkGameOver();
					});
				}
			});
		});
	} else {
		alert("Invalid set of scores.");
	}
}

function validRoundScores() {
	if ($('#score1').val() != "" && $('#score2').val() != ""
		&& $('#score3').val() != "" && $('#score4').val() != "") {
		var sum = parseInt($('#score1').val()) + parseInt($('#score2').val()) 
				+ parseInt($('#score3').val()) + parseInt($('#score4').val());
		if (sum == 26 || sum == 78) {
			return true;
		}
	}
	return false;
}

var getMaxGameID = function(callback) {
	var query = "SELECT max(gameID) AS gameID FROM Game";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		callback(response[0].gameID);
	});
}

function populateQueen() {
	$("#queenCombo").append('<option value="' + currentGame.playerID1 + '">' + currentGame.username1 + '</option>');
	$("#queenCombo").append('<option value="' + currentGame.playerID2 + '">' + currentGame.username2 + '</option>');
	$("#queenCombo").append('<option value="' + currentGame.playerID3 + '">' + currentGame.username3 + '</option>');
	$("#queenCombo").append('<option value="' + currentGame.playerID4 + '">' + currentGame.username4 + '</option>');
}

var getMaxRoundID = function(callback) {
	var query = "SELECT GREATEST((SELECT IFNULL(MAX(roundID), 0) FROM HeartsRound),"
				+ "(SELECT IFNULL(MAX(roundID), 0) FROM EuchreRound)) + 1 AS roundID";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		callback(response[0].roundID);
	});
}

function checkGameOver() {
	if (Math.max(currentGame.score1, currentGame.score2, currentGame.score3, currentGame.score4) >= 100) {
		var minScore = Math.min(currentGame.score1, currentGame.score2, currentGame.score3, currentGame.score4);

		if (minScore == currentGame.score1) {
			gameOver(currentGame.playerID1);

		} else if (minScore == currentGame.score2) {
			gameOver(currentGame.playerID2);

		} else if (minScore == currentGame.score3) {
			gameOver(currentGame.playerID3);

		} else {
			gameOver(currentGame.playerID4);
		}
	}
}

function gameOver(winnerID) {
    var query = "UPDATE Game SET isCompleted = TRUE,"
    + " dateCompleted = CURRENT_TIMESTAMP(),"
	+ " winner = " + winnerID
    + " WHERE gameID = " + currentGame.gameID;
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		alert("The game has been completed!");
	});
}

function populateCurrentScore() {
	currentGame.score1 = currentGame.score1 + parseInt($('#score1').val());
	currentGame.score2 = currentGame.score2 + parseInt($('#score2').val());
	currentGame.score3 = currentGame.score3 + parseInt($('#score3').val());
	currentGame.score4 = currentGame.score4 + parseInt($('#score4').val());	

	var tableHead ='';
	tableHead += '<th>Player 1 (' + currentGame.score1 + ')</th>';
	tableHead += '<th>Player 2 (' + currentGame.score2 + ')</th>';
	tableHead += '<th>Player 3 (' + currentGame.score3 + ')</th>';
	tableHead += '<th>Player 4 (' + currentGame.score4 + ')</th>';
	$('#displayHead').html(tableHead);

	var tableContent = '';
	tableContent += '<tr>';
	tableContent += '<td>' + $('#score1').val() + '</td>';
	tableContent += '<td>' + $('#score2').val() + '</td>';
	tableContent += '<td>' + $('#score3').val() + '</td>';
	tableContent += '<td>' + $('#score4').val() + '</td>';
	tableContent += '</tr>';
	$('#displayBody').append(tableContent);
}

function generateStats() {
	console.log("In generate stats...");

	var playerID = $('#playerStatsCombo option:selected').attr('rel');
	var option = $('#statsOptionCombo').val();

	if (option == "numWins") {
		generateNumWins(playerID);
	} else if (option == "numGames") {
		generateNumGames(playerID);
	} else if (option == "avgQueens") {
		generateAvgQueens(playerID);
	} else if (option == "chanceShoot") {
		generateChanceShoot();
	} else if (option == "playerHistory") {
		generatePlayerHistory(playerID);
	}
}

function generateNumWins(playerID) {
	console.log("in num wins...");

	var query = "SELECT COUNT(winner) AS winCount FROM Game WHERE winner = " + playerID;
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		$('#statsDisplay:text').val(response[0].winCount);
	});
}

function generateNumGames(playerID) {
	console.log("in num games...");

	var query = "SELECT COUNT(gameID) AS gameCount FROM Participant WHERE playerID = " + playerID;
	var sendData = {
		"query": query
	};
	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		$('#statsDisplay:text').val(response[0].gameCount);
	});
}

function generateAvgQueens(playerID) {
	console.log("in avg queens...");

	var query = "SELECT (SELECT COUNT(tookQueenOfSpades) FROM HeartsRound WHERE tookQueenOfSpades=" + playerID + ") " 
		+ " / (SELECT COUNT(Game.gameID) FROM Participant JOIN Game ON Participant.gameID=Game.gameID " 
			+ " WHERE Participant.playerID=" + playerID + " AND Game.gameType='hearts') AS avgQueens;";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		$('#statsDisplay:text').val(response[0].avgQueens);
	});
}

function generateChanceShoot() {
	console.log("in chance shoot...");

	var query = "SELECT COUNT(gameID) / (SELECT COUNT(gameID) FROM Game WHERE gameType = 'hearts')" 
	+ " AS percentShoot FROM Game WHERE gameID IN" 
	+ " (SELECT gameID FROM HeartsRound JOIN Score ON HeartsRound.roundID=Score.roundID WHERE Score.amount=26)";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		$('#statsDisplay:text').val(response[0].percentShoot);
	});
}

function generatePlayerHistory(playerID) {
	console.log("in player history...");

	var query = "SELECT gameID, username, SUM(amount) as playerScore" 
	+ " FROM Score JOIN HeartsRound USING(roundID) JOIN Player USING(PlayerID) " 
	+ " WHERE gameID IN (SELECT gameID FROM Participant WHERE playerID = " + playerID + ") GROUP BY gameID, playerID";
	var sendData = {
		"query": query
	};

	$.ajax({
		type: 'POST',
		data: sendData,
		url: '/query'
	}).done(function(response) {
		$('#statsDisplay:text').val("See table...");

		populatePlayerHistory(response);
	});
}

function populatePlayerHistory(history) {
	var tableContent = '';

	for (var i = 0; i<history.length; i++) {
		tableContent += '<tr>';
		tableContent += '<td>' + history[i].gameID + '</td>';
		tableContent += '<td>' + history[i].username + '</td>';
		tableContent += '<td>' + history[i].playerScore + '</td>';
		tableContent += '</tr>';
	}

	$('#historyBody').html(tableContent);
}