var five = require("johnny-five");
var board = new five.Board({'port':'COM6'});

var express = require('express');
var app = express();

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://iot.eclipse.org')

var led;
var distancia;
var ultimoStatusVaga;

board.on("ready", function() {
    led = new five.Led(13);   
    
    var proximity = new five.Proximity({
        controller: "HCSR04",
        pin: 7
    });

    proximity.on("change", function() {
        distancia = this.cm;

        var statusAtual;

        if(distancia < 5) {
            statusAtual = "Ocupada";
           // led.on();  
        } else {
            statusAtual = "Vazia";
           // led.off();           
        }    
        
        if(ultimoStatusVaga !== statusAtual) {
            ultimoStatusVaga = statusAtual;
            client.publish('distancia21', statusAtual);
        }
    });
});
  
app.post('/led/ligar', function(req, res){
    led.on();
    res.sendStatus(200);
});

app.post('/led/desligar', function(req, res){
    led.off();
    res.sendStatus(200);
});

app.get('/vaga', function(req, res){
    if(distancia < 5) {
        res.send("Ocupada");
        led.on();
    } else {
        res.send("Vazia");
        led.off();
    }
});

app.listen(3000, function(req, res){
    console.log('app listening on port ${3000}');
});

