const express = require('express')
const app = express()
const wss = require('express-ws')(app);
const port = 3000

app.get('/', (req, res) => res.send('pi-spy'))

app.ws('/stream', (ws, req) => {
    console.log('Client connected');
    

    ws.send(JSON.stringify({
      action: 'init',
      width: '960',
      height: '540'
    }));

    var videoStream = raspividStream({ rotation: 180 });

    videoStream.on('data', (data) => {
        ws.send(data, { binary: true }, (error) => { if (error) console.error(error); });
    });

    ws.on('close', () => {
        console.log('Client left');
        videoStream.removeAllListeners('data');
    });
});


app.listen(port, () => console.log(`app listening on port ${port}!`))