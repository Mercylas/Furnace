/*
James Fitzgerald
Noah Steinberg
*/

//Furnace Client
var https = require('https');

var furnaceState = "OFF";

var setFurnaceTemp = function(temperature){
  furnace = temperature;
};
var setFurnaceState = function(state){
  furnaceState = state;
};

var options = {
  hostname: 'localhost',
  port: '3000',
  path: '/',
  method: 'POST',
};

function readJSONResponse(response){
  var responseData = '';
  response.on('data', function(chunk){
    responseData += chunk;
  });
  response.on('end', function(){
    var dataObj = JSON.parse(responseData);
    setFurnaceState(dataObj.furnace);
    console.log('FURNACE STATE: ' + furnaceState);
  });
}

setInterval(function(){
               process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
               var req = https.request(options, readJSONResponse);
               req.write('{"temperature" : "?", "furnace": "?", "state": "' + furnaceState + '"}');
               req.end();
}, 3000);
