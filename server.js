const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const axios = require('axios');
const fs = require('fs');
const fileName = './data.json';

const decode = require('./decode.js')

var API_KEY = 'YOUR_API_KEY';

app.use(bodyParser.urlencoded({extended: false}));

const port = process.env.PORT || 8000;

app.use("/static", express.static('./static/'));

app.get('/getDistance', (req, res) => {
  const file = require(fileName);
  var dest = req.query.lat + ', ' + req.query.lng
  var hastaneCoords = ['37.849064, 27.837057', '37.854334, 27.807922', '37.839283, 27.840346', '37.853254, 27.859137', '37.831160, 27.836124', '37.830981, 27.853023']
  var ambulanskalkiszaman = [];
  var ambulanskalkiscoords = [];

  var config1 = {
      method: 'get', // aydın devlet -> kalp krizi noktası
      url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.851585, 27.823145&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
      headers: { }
  };
  var config2 = {
    method: 'get', // çocuk devlet -> kalp krizi noktası
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.854334, 27.807922&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
    headers: { }
  };
  var config3 = {
    method: 'get', // aydın 7 nolu asm -> kalp krizi noktası
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.844876, 27.840854&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
    headers: { }
  };
  var config4 = { 
    method: 'get', // adü devlet -> kalp krizi noktası
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.853254, 27.859137&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
    headers: { }
  };
  var config5 = {
    method: 'get', // aydın 4 nolua asm -> kalp krizi noktası
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.837399, 27.854868&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
    headers: { }
  };
  var config6 = {
    method: 'get', // aydın 8 nolu asm -> kalp krizi noktası
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.829754, 27.836461&destination=' + dest + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
    headers: { }
  };
  
  axios.all([axios(config1), axios(config2), axios(config3), axios(config4), axios(config5), axios(config6)]).then(axios.spread((...responses) => {
    var responsesArray = [];
    for (var i = 0; i<6; i++) {
      responsesArray.push(responses[i])
    }
    for (var i = 0; i<6; i++) {
      var jsonContent = responsesArray[i].data;
      var x = jsonContent['routes'][0]['legs'][0]['duration_in_traffic']['text'];
      var y = parseInt(x);
      ambulanskalkiszaman.push(y);
      var mapsrouteline = decode.decodePolyline(jsonContent['routes'][0]['overview_polyline']['points']);
      var coords = "";
      coords = coords + mapsrouteline[0].latitude.toString() +  ', ' +mapsrouteline[0].longitude.toString();
      for (var j = 1; j<mapsrouteline.length; j++) {
        coords = coords + '|' +mapsrouteline[j].latitude.toString() +  ', ' +mapsrouteline[j].longitude.toString();
      }
      ambulanskalkiscoords.push(coords);
    }

    var minindex = 0;
    var minval = 150;
    for (var i=0; i<6;i++) {
      if (ambulanskalkiszaman[i]<minval) {
        minindex = i;
        minval = ambulanskalkiszaman[i];
      }
    }
    var roadTime1 = minval;
    var targetCoord;
    if (minindex <= 1) {
      targetCoord = hastaneCoords[0];
    }
    else if (minindex == 2 || minindex == 4 || minindex == 5){
      targetCoord = hastaneCoords[2];
    }
    else {
      targetCoord= hastaneCoords[3];
    }

    file['ambulance1']['varis vakti'] = roadTime1;
    file['coords1'] = ambulanskalkiscoords[minindex];
    var configAmbulance = {
      method: 'get',
      url: 'https://maps.googleapis.com/maps/api/directions/json?origin=' + dest + '&destination='+targetCoord + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
      headers: { }
    };
    var configEcmo = {
      method: 'get',
      url: 'https://maps.googleapis.com/maps/api/directions/json?origin=37.847628, 27.866822&destination=' + targetCoord + '&departure_time=now&traffic_model=pessimistic&key='+API_KEY,
      headers: { }
    };
    axios.all([
      axios(configAmbulance), 
      axios(configEcmo)
    ])
    .then(axios.spread((response1, response2) => {
      var jsonContent = response1.data;
      var x = jsonContent['routes'][0]['legs'][0]['duration_in_traffic']['text'];
      var y = parseInt(x);
      file['ambulance3']['varis vakti'] = y;
      var mapsrouteline = decode.decodePolyline(jsonContent['routes'][0]['overview_polyline']['points']);
      var coords = "";
      coords = coords + mapsrouteline[0].latitude.toString() +  ', ' +mapsrouteline[0].longitude.toString();
      for (var j = 1; j<mapsrouteline.length; j++) {
        coords = coords + '|' +mapsrouteline[j].latitude.toString() +  ', ' +mapsrouteline[j].longitude.toString();
      }
      file['coords3'] = coords;
      var jsonContent = response2.data;
      var x = jsonContent['routes'][0]['legs'][0]['duration_in_traffic']['text'];
      var y = parseInt(x);
      file['ambulance2']['varis vakti'] = y;
      var mapsrouteline = decode.decodePolyline(jsonContent['routes'][0]['overview_polyline']['points']);
      var coords = "";
      coords = coords + mapsrouteline[0].latitude.toString() +  ', ' +mapsrouteline[0].longitude.toString();
      for (var j = 1; j<mapsrouteline.length; j++) {
        coords = coords + '|' +mapsrouteline[j].latitude.toString() +  ', ' +mapsrouteline[j].longitude.toString();
      }
      file['coords2'] = coords;
      
      // statistic
//       var statjsonfile = fs.readFileSync('static/statistic.json');
//       var statFile= JSON.parse(statjsonfile);
//       var stat = {
//         "info":  {
//           "ambulance1":file['ambulance1']['varis vakti'],
//           "ambulance2":file['ambulance2']['varis vakti'],
//           "ambulance3":file['ambulance3']['varis vakti']
//         }
//       }
//       statFile.push(stat);
//       var statFile = JSON.stringify(statFile, null, 2);
//       fs.writeFile('static/statistic.json', statFile, err => {
        // error checking
//         if(err) throw err;
//         console.log("New data added");
//       });   
      //statistic
      
      res.send(file);
    })).catch(errors => {
      console.log(errors);
    })
    // use/access the results 
  })).catch(errors => {
    console.log(errors);
  })
  
})

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use((req, res,next)=>{
   res.status(404).send('<h1> Page not found </h1>');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
