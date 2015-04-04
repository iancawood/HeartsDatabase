/*******************************************************************************************
	NOTE: Parameters with generic names get there values from variables on the client.
*******************************************************************************************/

#Gets all players and is used to populate dropdowns...
SELECT playerID, username FROM Player;

#Inserting new player...
INSERT INTO Player (username, passphrase) VALUES (someUsername, somePassphrase);

#Inserting new game...
INSERT INTO Game (gameType) VALUES ('hearts');

#Getting next gameID...
SELECT max(gameID) AS gameID FROM Game;

#Inserting new participants (uses above statement to get gameID)...
INSERT INTO Participant VALUES 
	(currentGameID, somePlayerID, 'north'),
    (currentGameID, somePlayerID, 'south'),
    (currentGameID, somePlayerID, 'east'),
    (currentGameID, somePlayerID, 'west'); 

#Getting next gameID
SELECT GREATEST((SELECT IFNULL(MAX(roundID), 0) FROM HeartsRound), 
	(SELECT IFNULL(MAX(roundID), 0) FROM EuchreRound)) + 1;

#Inserting new hearts round (use aboves statements to get roundID and gameID)...
INSERT INTO HeartsRound (roundID, gameID, tookQueenOfSpades) 
	VALUES (currentRoundID, currentGameID, somePlayerID);

#Inserting new scores...
INSERT INTO Score (amount, roundID, playerID) VALUES 
	(someScoreInt, currentRoundID, somePlayerID),
    (someScoreInt, currentRoundID, somePlayerID),
    (someScoreInt, currentRoundID, somePlayerID),
    (someScoreInt, currentRoundID, somePlayerID);

#Modifies a game to be over... 
UPDATE Game SET isCompleted = TRUE,
    dateCompleted = CURRENT_TIMESTAMP(),
	winner = somePlayerID
    WHERE gameID = currentGameID;

#Returns the number of times a player has won
SELECT COUNT(winner) AS winCount FROM Game WHERE winner = somePlayerID;

#Returns the number of games a player has been in
SELECT COUNT(gameID) AS gameCount FROM Participant WHERE playerID = somePlayerID;

#Returns the average number of times per game that a player received a queen of hearts
SELECT (SELECT COUNT(tookQueenOfSpades) FROM HeartsRound WHERE tookQueenOfSpades= somePlayerID) 
		/ (SELECT COUNT(Game.gameID) FROM Participant JOIN Game ON Participant.gameID=Game.gameID
	WHERE Participant.playerID=somePlayerID AND Game.gameType='hearts') AS avgQueens;

#Returns the percent chance that a player will shoot the moon (takes all of the points in a round) in a game
#This will look for rounds where the points were 0, 26, 26, 26.
SELECT COUNT(gameID) / (SELECT COUNT(gameID) FROM Game WHERE gameType = 'hearts')
	AS percentShoot FROM Game WHERE gameID IN
	(SELECT gameID FROM HeartsRound JOIN Score ON HeartsRound.roundID=Score.roundID WHERE Score.amount=26)

#Returns the entire score history of a player and other players in those games
SELECT gameID, username, SUM(amount) as playerScore
	FROM Score JOIN HeartsRound USING(roundID) JOIN Player USING(PlayerID)
	WHERE gameID IN (SELECT gameID FROM Participant WHERE playerID = somePlayerID) GROUP BY gameID, playerID;
