/*
James Fitzgerald
Noah Steinberg
*/

var http = require('http'); //need to http
var https = require('https');//need to https
var fs = require('fs');//for file reading
var url = require('url');  //to parse url strings


var temperature = 16;  //degrees celsius
var thermostatTemperature = 20;
var furnaceState = 'ON';
var weatherString = "No Data";

var ROOT_DIR = 'html';
var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript', //should really be application/javascript
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
};

var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return MIME_TYPES['txt'];
};

//Private SSL key and signed certificate
var ssl = {
key: fs.readFileSync('serverkey.pem'),
cert: fs.readFileSync('servercert.crt')
};
//Takes Information from JSON
function parseWeather(weatherResponse, res) {
  var weatherData = '';
  weatherResponse.on('data', function (chunk) {
    weatherData += chunk;
  });
  weatherResponse.on('end', function () {
    var weatherObj = JSON.parse(weatherData);
   weatherString = weatherObj.name + ", " + weatherObj.sys.country + ": " + Math.round((weatherObj.main.temp-273.15)) + " degrees celsius and " + weatherObj.weather[0].description;
  });
}
//API Call
function getWeather(city, res){
  var wOptions = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/weather?q=' + city +
    '&appid=ac5bc6c83e855f6e0db613a0bc2f99c2'
  };
  http.request(wOptions, function(weatherResponse){
    parseWeather(weatherResponse, res);
  }).end();
}

https.createServer(ssl, function (request,response){
    var urlObj = url.parse(request.url, true, false);
    if(request.method==='POST'){
     var jsonData = '';
     request.on('data', function(chunk) {
        jsonData += chunk;
     });
     request.on('end', function(){
        var reqObj = JSON.parse(jsonData);
        var resObj;
        //from client
        if(reqObj.furnace){
        resObj = {
            'thermostat' : thermostatTemperature,
            'temperature' : temperature,
            'furnace' : furnaceState};
            if(reqObj.state==='ON'){
                temperature+=2;
            }
        //from browser on refresh
        }else if(reqObj.temperature){
            getWeather(reqObj.weather, response);
             resObj = {
            'thermostat' : thermostatTemperature,
            'temperature' : temperature,
            'weather' : weatherString};
        }
        //from browser on button
        else if(reqObj.change){
            thermostatTemperature += reqObj.change;
            resObj = {
            'thermostat' : thermostatTemperature};
        }
        response.writeHead(200);
        response.end(JSON.stringify(resObj));
    });
    }
    //for HTML and JS 
    if(request.method == "GET"){
     //handle GET requests as static file requests
     var filePath = ROOT_DIR + urlObj.pathname;
     if(urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html';

     fs.readFile(filePath, function(err,data){
       if(err){
          //report error to console
          console.log('ERROR: ' + JSON.stringify(err));
          //respond with not found 404 to client
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
         }
         response.writeHead(200, {'Content-Type': get_mime(filePath)});
         response.end(data);
       });
     } }).listen(3000);
console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
//Determins if the furnace needs to be on. Logs temperature. Also acts as the temperature decreasing
setTimeout( function again(){
    temperature--;
   if(temperature<thermostatTemperature-1){
    furnaceState = 'ON';
   }else if (temperature>thermostatTemperature){
        furnaceState = 'OFF';
   }
    console.log('Temperature: ' + temperature); //logs the room temp
   setTimeout(again, 2000); //recursively restart timeout
   }, 2000);

