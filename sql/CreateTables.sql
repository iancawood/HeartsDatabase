CREATE TABLE IF NOT EXISTS Player (
	playerID INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(16) NOT NULL,
	passphrase VARCHAR(12) NOT NULL,
    signUpDate DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (playerID),
    UNIQUE(username)
);

CREATE TABLE IF NOT EXISTS Game (
	gameID INT NOT NULL AUTO_INCREMENT,
    gameType ENUM('hearts', 'euchre'),
    isCompleted BOOL DEFAULT FALSE,
    dateCompleted DATE,
    winner int,
    PRIMARY KEY (gameID),
    FOREIGN KEY (winner) REFERENCES Player (playerID)
);

CREATE TABLE IF NOT EXISTS Participant (
	gameID INT NOT NULL,
    playerID INT NOT NULL,
    tablePosition ENUM('north', 'south', 'east', 'west') NOT NULL,
    PRIMARY KEY (gameID, playerID),
    FOREIGN KEY (gameID) REFERENCES Game (gameID),
    FOREIGN KEY (playerID) REFERENCES Player (playerID)
);

CREATE TABLE IF NOT EXISTS HeartsRound (
    roundID INT NOT NULL DEFAULT 0,
	gameID INT NOT NULL,    
    tookQueenOfSpades int NOT NULL,
	PRIMARY KEY (roundID),
    FOREIGN KEY (gameID) REFERENCES Game (gameID),
    FOREIGN KEY (tookQueenOfSpades) REFERENCES Player (playerID),
    CHECK (tookQueenOfSpades IN (SELECT playerID FROM Participant WHERE Participant.gameID = gameID))
);

CREATE TABLE IF NOT EXISTS EuchreRound (
	roundID INT NOT NULL DEFAULT 0,
    gameID INT NOT NULL,
    trumpType ENUM('spades', 'hearts', 'clubs', 'diamonds') NOT NULL,
    PRIMARY KEY (roundID),
    FOREIGN KEY (gameID) REFERENCES Game (gameID)
);

CREATE TABLE IF NOT EXISTS Score (
	amount INT,
    roundID INT NOT NULL,
    playerID INT NOT NULL,
    PRIMARY KEY(roundID, playerID),
    FOREIGN KEY (playerID) REFERENCES Player (playerID) ON DELETE CASCADE,
    CHECK(roundId IN (SELECT roundID FROM HeartsRound UNION DISTINCT SELECT roundID FROM EuchreRound))
);

CREATE TABLE IF NOT EXISTS TrumpCaller (
	wentAlone BOOL DEFAULT FALSE,
	roundID INT NOT NULL,
    playerID INT NOT NULL,
    PRIMARY KEY (roundID, playerID),
    FOREIGN KEY (roundID) REFERENCES EuchreRound (roundID),
    FOREIGN KEY (playerID) REFERENCES Player (playerID)
);

CREATE TABLE IF NOT EXISTS Team (
	teamID INT NOT NULL AUTO_INCREMENT,
    playerOneID INT NOT NULL,
    playerTwoID INT NOT NULL,
    PRIMARY KEY (teamID),
    FOREIGN KEY (playerOneID) REFERENCES Player (playerID),
    FOREIGN KEY (playerTwoID) REFERENCES Player (playerID)
);

CREATE TABLE IF NOT EXISTS Trick (
	amount INT NOT NULL DEFAULT 0,
	roundID INT NOT NULL,
    teamID INT NOT NULL,
    PRIMARY KEY (roundID, teamID),
    FOREIGN KEY (roundID) REFERENCES EuchreRound (roundID),
    FOREIGN KEY (teamID) REFERENCES Team (teamID)
);