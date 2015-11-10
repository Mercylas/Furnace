var https = require('https');
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
    console.log('Thermostat: ' + responseData.temperature);
  });
}

function furnaceChange(change){
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    var req = https.request(options);
    req.write("change :" + change);
    req.end();
}

document.getElementById("temperature").innerHTML = "Temperature: " + 20;
document.getElementById("thermostatTemperature").innerHTML = "Thermostat: " + 25;
document.getElementById("weather").innerHTML = "weather";
