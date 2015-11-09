/*
Simple server/client pair of node.js apps using the POST
http method rather than GET.

JSON objects are passed back an forth between the 
client and server node.js apps using the POST method

Note: This example does not support a browser client
It will crash if you visit it with a browser
(As an exercise you can add browser support as well)
*/

//Cntl+C to stop server (in Windows CMD console)

var http = require('http'); //need to http
var https = require('https');//need to https
var fs = require('fs');


var temperature = 20;  //degrees celsius
var thermostatTemperature = 30;
var furnaceState = 'ON';

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

var test = function(){
    alert("I am an alert box!");
};
https.createServer(ssl, function (request,response){
    //console.log('REQUEST: ', request.method, " ", request.url);
    if(request.method==='POST'){
     var jsonData = '';
     request.on('data', function(chunk) {
        jsonData += chunk;
     });
     request.on('end', function(){
        var reqObj = JSON.parse(jsonData);
        var resObj;
        /*
        console.log('reqObj: ', reqObj);
        console.log('jsonData: ', jsonData );
        console.log('typeof jsonData: ', typeof jsonData );
        */
        if(reqObj.temperature){
        resObj = {
            'thermostat' : thermostatTemperature,
            'temperature' : temperature,
            'furnace' : furnaceState};
            if(reqObj.state==='ON'){
                temperature+=2;
            }
        if(reqObj.change){
            thermostatTemperature += reqObj.change;
            resObj = {
            'thermostat' : thermostatTemperature};
        }
        response.writeHead(200);
        response.end(JSON.stringify(resObj));
     }
    });
    }
    if(request.method == "GET"){
     //handle GET requests as static file requests
    filePath = 'index.html';
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
    }
 }).listen(3000);
console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');

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

