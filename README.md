# BscHons-Web-Programming

## How To Run
Setup a .bat file and put the following in it:

```bat
@echo off
cd "<Location of files>"
npm install
node server.js
```

Then launch on it to run. You will need NodeJS installed.

You can access the page via http://localhost:8000.

## Features
The game is a 2d football game where the first to 5 points wins. Your score will be determined based on the number of goals conceded and scored, along with the number of bots on each side. You can submit your score to the leaderboards, which is based on the difficulty selected.

The AI (bots) in this game constantly move towards the ball and react faster based on difficulty. The AI is programmed to try and get themselves between their own goals and the ball so that they try to not concede own goals all the time.

The user has different controls which are listed below the game.

## Database
You can see the data dictionary of the leaderboard table, along with database credentials in the database.js file. This is used to store the highest score achieved on a select difficulty by a user on a google account.
 
