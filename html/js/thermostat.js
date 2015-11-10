function furnaceChange(change){
    var userRequestJSON = JSON.stringify({"change": change});
    $.post("userText", userRequestJSON, function(data, status){
      responseObj = JSON.parse(data);
      });
  }

$(document).ready(function(){
setInterval(function(){
  var RequestJSON = JSON.stringify({"thermostat" : "?", "temperature": "?", "weather": "Ottawa"});
  $.post("userText", RequestJSON, function(data, status){
  responseObj = JSON.parse(data);
  document.getElementById("temperature").innerHTML = "Temperature: " + responseObj.temperature;
  document.getElementById("thermostatTemperature").innerHTML = "Thermostat: " + responseObj.thermostat;
  document.getElementById("weather").innerHTML = responseObj.weather;
  });
}, 300);
});