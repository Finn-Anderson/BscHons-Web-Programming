var fs = require("fs");
var host = "127.0.0.1";
var port = 8000;
var express = require("express");

var app = express();
app.use(express.static(__dirname + "/client")); //use static files in ROOT/src folder

app.get("/", function(request, response) { //root dir
	response.sendFile(__dirname + "/client/index.html");
})

app.listen(port, host);