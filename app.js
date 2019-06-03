const express = require('express')
const app = express()
const wss = require('express-ws')(app);
const port = 3000
const raspividStream = require('raspivid-stream');
var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};
pwm = new Pca9685Driver(options, function(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("Initialization done");
 
    // Set channel 0 to turn on on step 42 and off on step 255
    // (with optional callback)
    // pwm.setPulseRange(0, 42, 255, function() {
    //     if (err) {
    //         console.error("Error setting pulse range.");
    //     } else {
    //         console.log("Pulse range set.");
    //     }
    // });


});

let servoPL = 1500;
let servoMin = 600;
let servoMax = 2400;
let servoMove = 1500;
app.get('/servo-plus', (req, res) => {
    if (servoPL < servoMax){
        while (servoMove < (servoPL + 100)) {
            setTimeout(() => {
                 servoMove = servoPL + 10;
                pwm.setPulseLength(15, servoMove);
            }, 20);
            
        }
        servoPL = servoMove;
        
    }
    
    res.send('servo set to '+servoPL);

});
app.get('/servo-minus', (req, res) => {
    if (servoPL > servoMin){
        servoPL -=100;
    }
    pwm.setPulseLength(15, servoPL);
    res.send('servo set to '+servoPL);

});

app.get('/', (req, res) => res.send('pi-spy'))

app.ws('/stream', (ws, req) => {
    console.log('Client connected');
    

    ws.send(JSON.stringify({
      action: 'init',
      width: '960',
      height: '540'
    }));

    var videoStream = raspividStream();

    videoStream.on('data', (data) => {
        ws.send(data, { binary: true }, (error) => { if (error) console.error(error); });
    });

    ws.on('close', () => {
        console.log('Client left');
        videoStream.removeAllListeners('data');
    });
});



app.listen(port, () => console.log(`app listening on port ${port}!`))