// Replace with your own API key
var API_KEY = 'YOUR_API_KEY';    

// not used
// Icons for markers
var RED_MARKER = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
var GREEN_MARKER = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
var BLUE_MARKER = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
var YELLOW_MARKER = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';

// URL for places requests
// var PLACES_URL = 'https://maps.googleapis.com/maps/api/place/details/json?' +
//                'key=' + API_KEY + '&placeid=';

// URL for Speed limits
// var SPEED_LIMIT_URL = 'https://roads.googleapis.com/v1/speedLimits';

var coords;

originals = [[],[]];   // the original input points, a list of ExtendedLatLng

var interpolate = true;
var map;
var placesService;
var originalCoordsLength;

// Settingup Arrays
var markers = [];
var polylines = [[],[]]; // animatenum pointing inside array 0-1
var snappedCoordinates = [[],[]];

// which animation (all global variables)
var animatenum = 0;

// Symbol that gets animated along the polyline
var lineSymbol = {
  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  scale: 6,
  strokeColor: '#FF2D00',
  strokeWidth: '#49FF00'
};
var roadTime1, roadTime2, roadTime3; 
var coords1, coords2, coords3;

// Initialize
function initialize() {
  var kalpkrizicoord;

  $('#eg1').click(function(e) {
    // ilk ambulans süresi
    $('#roadTimes').val(roadTime1); 
    //ilk rota
    $('#coords'+animatenum).val(coords1);
    $('#plot').trigger('click');
  });

  $('#eg2').click(function(e) {
    $('#roadTimes').val(roadTime2);
    $('#coords' + animatenum).val(coords2);
    $('#plot').trigger('click');
  });

  $('#eg3').click(function(e) {
    $('#roadTimes').val(roadTime3);
    $('#coords' + animatenum).val(coords3);
    $('#plot').trigger('click');
  });

  function clickEg1() {
    animatenum = 0;
    $('#eg1').trigger('click');
  }

  function clickEg2() {
    animatenum = 0;
    $('#eg2').trigger('click');
  }

  function clickEg3() {
    animatenum = 1;
    $('#eg3').trigger('click');
  }
  
  $('#getStatistic').click(function(e) {
    $.getJSON('static/statistic.json', function(data) {
      var statTimes=[];
      var sum = 0;
      var max = 0;
      var min = 10000;
      for (var i = 1; i<data.length; i++) { // i=0 is comment
        var a1 = data[i].info.ambulance1
        var a2 = data[i].info.ambulance2
        var a3 = data[i].info.ambulance3
        var t = a1 + 3;
        if (a2 > a3) {
          t += a2;
        } else {
          t +=  a3;
        }
        if (t>max) {
          max = t;
        }
        if (t<min) {
          min = t;
        }
        sum+=t;
        statTimes.push(t)
      }
      var avrage = sum / statTimes.length;
      var statinfo = "Ortalama zaman= " + avrage.toFixed(2) + " dakika<br/>Maksimum zaman= " + max + " dakika<br/>Minumum zaman= " + min + " dakika";
      document.getElementById('statInfo').innerHTML = statinfo;
    });
  });

  $('#startAnimate').click(function(e) {
    
    $.ajax({
        url: 'getDistance',
        type: 'GET',
        ContentType: 'application/json',
        data: kalpkrizicoord,
        success: function (data) {
          // clear pre info
          Kronometre.baslat();
          Kronometre.bitir();
          document.getElementById('log').value = "";

          // config
          roadTime1 = data['ambulance1']['varis vakti']
          roadTime2 = data['ambulance2']['varis vakti']
          roadTime3 = data['ambulance3']['varis vakti']
          var roadtimes = "Ambulans -> Hasta= " + roadTime1 + " dakika<br/>Ecmo -> Hastane= " + roadTime2 + " dakika<br/>Ambulans -> Hastane= " + roadTime3 + " dakika";
          
          coords1 = data['coords1']
          coords2 = data['coords2']
          coords3 = data['coords3']
          
          var ihbar = 1000;

          var bitisZamani;
          if ((roadTime2*1000) + (roadTime1 * 1000) + ihbar+1000 > ihbar + (roadTime1 * 1000) + 1000 + 2000 + (roadTime3*1000)) {
            bitisZamani =(roadTime2*1000) + (roadTime1 * 1000) + ihbar+1000;
          } else {
            bitisZamani = ihbar + (roadTime1 * 1000) + 1000 + 2000 + (roadTime3*1000);
          }

          
          // var hastabindirme = getRandomInt(5);

          // info
          document.getElementById('roadtimesinfo').innerHTML = roadtimes;

          

          // Zamanlayıcı başlat
          Kronometre.baslat()
          window.setTimeout(function() {clickEg1()}, ihbar); // ambulans animasyonu
          window.setTimeout(function() {clickEg2()}, ihbar + (roadTime1 * 1000) + 1000); // ecmo animasyonu
          window.setTimeout(function() {clickEg3()}, ihbar + (roadTime1 * 1000) + 1000 + 2000); // ambulans geri dönüş animasyonu
          setTimeout(function(){document.getElementById('log').value += "İhbar Geldi " + Kronometre.getTime() + "\n"}, ihbar) // ihbar geldi
          setTimeout(function(){document.getElementById('log').value += "Ambulans Yola Çıktı " + Kronometre.getTime() + "\n"}, ihbar) // ambulans yola çktı geldi
          setTimeout(function(){document.getElementById('log').value += "Ambulans Vardı " + Kronometre.getTime() + "\n"}, ihbar + (roadTime1 * 1000)) // ambulans Vardı
          setTimeout(function(){document.getElementById('log').value += "Check List Yapıldı Karar Verildi " + Kronometre.getTime() + "\n"}, ihbar + (roadTime1 * 1000)) // karar verildi
          setTimeout(function(){document.getElementById('log').value += "Ecmo Yola Çıktı " + Kronometre.getTime() + "\n"}, ihbar + (roadTime1 * 1000) +1000) // Ecmo yola çıktı
          setTimeout(function(){document.getElementById('log').value += "Ambulans Hastaneye Gidiyor " + Kronometre.getTime() + "\n"}, ihbar + (roadTime1 * 1000) + 1000 + 2000); 
          setTimeout(function(){document.getElementById('log').value += "Ambulans Hastaneye Vardı " + Kronometre.getTime() + "\n"}, ihbar + (roadTime1 * 1000) + 1000 + 2000 + (roadTime3*1000)); 
          setTimeout(function(){document.getElementById('log').value += "Ecmo Vardı " + Kronometre.getTime() + "\n"}, (roadTime2*1000) + (roadTime1 * 1000) + ihbar+1000) // Ecmo vardı
          
          setTimeout(function(){Kronometre.duraklat()},  bitisZamani) 
        },
        error: function (err) {
          console.log(err)
        }
    });
  });

  $('#toggle').click(function(e) {
     if ($('#panel').css("display") != 'none') {
        $('#toggle').html("+");
        $('#panel').hide();
     } else {
        $('#toggle').html("&mdash;");
        $('#panel').show();
     }
  });

  // Centre the map on Aydın
  var mapOptions = {
    center: {'lat': 37.847832, 'lng': 27.843644},
    zoom: 15
  };
  kalpkrizicoord = mapOptions.center;

  function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
  }

  function Kronometre(Id, Saniye){
  
  this.gercekSaniye = Saniye || 0;
  this.saniye = Saniye || 0;
  this.interval;
  
  this.baslat = function(){
    this.sayacElem = document.getElementById(Id);
    if ( !this.interval ){
      this.sayac();
      this.interval = setInterval(this.sayac.bind(this), 1000);
    }
  };
  
  this.sayac = function(){
    
    var toplamSaniye = this.saniye;
    var saat = parseInt( toplamSaniye / 3600 ) % 24;
    var dakika = parseInt( toplamSaniye / 60 ) % 60;
    var saniye = toplamSaniye % 60;
    
    this.sayacElem.innerHTML = (dakika < 10 ? "0" + dakika : dakika) + ":" + (saniye  < 10 ? "0" + saniye : saniye);
    
    this.saniye += 1;
    
  };
  
  this.duraklat = function(){
    clearInterval(this.interval);
    this.interval = null;
  };
  
  this.bitir = function(){
    this.duraklat();
    this.sayacElem.innerHTML = '';
    this.saniye = this.gercekSaniye;
  };

  this.getTime = function(){
    return this.sayacElem.innerHTML;
  }
  
}

  var Kronometre = new Kronometre('sayac');

  // Map object
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // Places object
  placesService = new google.maps.places.PlacesService(map);

  // Reset the map to a clean state and reset all variables
  // used for displaying each request
  function clearMap() {
    // Clear the polyline
    for (var j = 0; j < 2; j++) {
        for (var i = 0; i < polylines[j].length; i++) {
            polylines[j][i].setMap(null);
        }
    }

    // Empty everything
    polylines = [[],[]];
    snappedCoordinates = [[],[]];

    $('#unsnappedPoints').empty();
    $('#warningMessage').empty();
  }

  // Parse the value in the input element
  // to get all coordinates
  function parseCoordsFromQuery(input) {
    var coords;
    input = decodeURIComponent(input);
    if (input.split('path=').length > 1) {
      input = decodeURIComponent(input);
      // Split on the ampersand to get all params
      var parts = input.split('&');
      // Check each part to see if it starts with 'path='
      // grabbing out the coordinates if it does
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].split('path=').length > 1) {
          coords = parts[i].split('path=')[1];
          break;
        }
      }
    } else {
      coords = decodeURIComponent(input);
    }

    // Parse the "Lat,Lng|..." coordinates into an array of ExtendedLatLng 
    originals = [[],[]]; // **global
    
    var points = coords.split('|');
    for (var i = 0; i < points.length; i++) {
      var point = points[i].split(',');
    //   originals.push({lat: Number(point[0]), lng: Number(point[1]), index:i});
    originals[animatenum].push({lat: Number(point[0]), lng: Number(point[1]), index:i});
    //   originals[1].push({lat: Number(point[1]), lng: Number(point[0]), index:i});
    }

    return coords;
  }


  // Clear the map of any old data and plot the request
  $('#plot').click(function(e) {
    if (animatenum==0) {
        clearMap();
    }
    bendAndSnap();
    e.preventDefault();
  });

  // Make AJAX request to the snapToRoadsAPI
  // with coordinates parsed from text input element.
  function bendAndSnap() {
    coords = parseCoordsFromQuery($('#coords' + animatenum).val()); // **global
    location.hash = coords; // **global
    $.ajax({ 
      type: 'GET',
      url: 'https://roads.googleapis.com/v1/snapToRoads',
      data: {
        interpolate: $('#interpolate').is(':checked'),
        key: API_KEY,
        path: coords
      },
      success: function(data) {
        $('#requestURL').html('<a target="blank" href="' +
            this.url + '">Request URL</a>');
        processSnapToRoadResponse(data);
        drawSnappedPolyline(snappedCoordinates[animatenum]); 

        
        // fitBounds(markers);
      },
      error: function() {
        $('#requestURL').html('<strong> Kriz noktası çok uzak </strong>' +
            '<p><a href="' + this.url +
            '">Request URL</a></p>');
        clearMap();
      }
    });
  }

  

  // Parse the value in the input element
  // to get all coordinates
  function getMissingPoints(originalIndexes, originalCoordsLength) {
    var unsnappedPoints = [];
    var coordsArray = coords.split('|');
    var hasMissingCoords = false;
    for (var i = 0; i < originalCoordsLength; i++) {
      if (originalIndexes.indexOf(i) < 0) {
        hasMissingCoords = true;
        var latlng = {
          'lat': parseFloat(coordsArray[i].split(',')[0]),
          'lng': parseFloat(coordsArray[i].split(',')[1])
        };

        unsnappedPoints.push(latlng);
        latlng.unsnapped = true;
      }
    }
    return unsnappedPoints;
  }

  // Parse response from snapToRoads API request
  // Store all coordinates in response
  // Calls functions to add markers to map for unsnapped coordinates
  function processSnapToRoadResponse(data) {
    var originalIndexes = [];
    var unsnappedMessage = '';

    for (var i = 0; i < data.snappedPoints.length; i++) {
      var latlng = {
        'lat': data.snappedPoints[i].location.latitude,
        'lng': data.snappedPoints[i].location.longitude
      };
      var interpolated = true;

      if (data.snappedPoints[i].originalIndex != undefined) {
        interpolated = false;
        originalIndexes.push(data.snappedPoints[i].originalIndex);
        latlng.originalIndex = data.snappedPoints[i].originalIndex;
      }

      latlng.interpolated = interpolated;
      snappedCoordinates[animatenum].push(latlng); // **global

      // Cross-reference the original point and this snapped point.
      latlng.related = originals[animatenum][latlng.originalIndex];
      //originals[latlng.originalIndex].related = latlng;
    }

    var unsnappedPoints = getMissingPoints(
        originalIndexes,
        coords.split('|').length
    );

    if (unsnappedPoints.length) {
      unsnappedMessage = '<strong>' +
         'These points weren\'t snapped: ' +
         '</strong><br>' + unsnappedMessage;
      // $('#unsnappedPoints').html(unsnappedMessage);
    }

    if (data.warningMessage) {
      $('#warningMessage').html('<span style="color:#CC0022;' +
          'font-style:italic;font-size:12px">' + data.warningMessage + '<br/>' +
          '<a target="_blank" href="https://developers.google.com/maps/' +
          'documentation/roads/snap">https://developers.google.com/maps/' +
          'documentation/roads/snap</a>');
    }
  }

  // Draw the polyline for the snapToRoads API response
  function drawSnappedPolyline(snappedCoords) {
    var snappedPolyline = new google.maps.Polyline({
      path: snappedCoords,
      strokeColor: '#005db5',
      strokeWeight: 4,
      icons: [{
        icon: lineSymbol, // **global
        offset: '100%'
      }]
    });

    snappedPolyline.setMap(map);
    t = parseInt($('#roadTimes').val()); // **global
    animateCircle(snappedPolyline, t*5);

    polylines[animatenum].push(snappedPolyline); // **global

  }


  // Avoid infoWindows staying open if the pano changes
  // listenForPanoChange();

  // If the user came to the page with a particular path or URL,
  // immediately plot it.
  if (location.hash.length > 1) {
    coords = parseCoordsFromQuery(location.hash.slice(1));
    $('#coords0').val(coords);
    $('#plot').click();
  }

  
  let infoWindow = new google.maps.InfoWindow({
    content: "Aydın",
    position: mapOptions.center,
  });
  infoWindow.open(map);
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    infoWindow.close();

    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      "Kalp Krizi"
    );
    kalpkrizicoord = mapsMouseEvent.latLng.toJSON();
    infoWindow.open(map);
  });

} // End init function

// Call the initialize function once everything has loaded
google.maps.event.addDomListener(window, 'load', initialize);


// Load the control panel in a floating div if it is not loaded in an iframe
// after the textarea has been rendered
$("#coords0").ready(function() {
    if (!window.frameElement) {
       $('#panel').addClass("floating panel");
       $('#button-div').addClass("button-div");
       $('#coords0').removeClass("coords-large").addClass("coords-small");
       $('#toggle').show();
       $('#map').height('100%');
    }
});

$("#coords1").ready(function() {
    if (!window.frameElement) {
       $('#coords1').removeClass("coords-large").addClass("coords-small");
    }
});
    /**
*  latlng literal with extra properties to use with the RoadsAPI
*  @typedef {Object} ExtendedLatLng
*   lat:string|float
*   lng:string|float
*   interpolated:boolean
*   unsnapped:boolean
*/

/**
 * Add a line to the map for highlighting the connection between two
 * markers while the mouse is over it.
 * @param {ExtendedLatLng} from - The origin of the line
 * @param {ExtendedLatLng} to - The destination of the line
 * @return {!Object} line - the polyline object created
 */
function addOverline(from, to) {
  return addLine("overline", from, to, '#ff77ff', 4, 1.0, 2.0, false);
}

/**
 * Add a line to the map for highlighting the connection between two
 * markers while the mouse is NOT over it.
 * @param {ExtendedLatLng} from - The origin of the line
 * @param {ExtendedLatLng} to - The destination of the line
 * @return {!Object} line - the polyline object created
 */
function addOutline(from, to) {
  return addLine("outline", from, to, '#bb33bb', 2, 0.5, 1.35, true);
}

/**
 * Add a line to the map for highlighting the connection between two
 * markers.
 * @param {string}         attrib  - The attribute to use for managing the line
 * @param {ExtendedLatLng} from    - The origin of the line
 * @param {ExtendedLatLng} to      - The destination of the line
 * @param {string}         color   - The color of the line
 * @param {number}         weight  - The weight of the line
 * @param {number}         opacity - The opacity of the line (0..1)
 * @param {number}         scale   - The scale of the arrow-head (pt)
 * @param {boolean}        visible - The visibility of the line
 * @return {!Object}       line    - the polyline object created
 */
function addLine(attrib, from, to, color, weight, opacity, scale, visible) {
  from[attrib] = new google.maps.Polyline({
    path:         [from, to],
    strokeColor:  color,
    strokeWeight:  weight,
    strokeOpacity: opacity,
    icons:[{
      offset: "0%",
      icon: {
        scale: scale/*pt*/,
        path:  google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
      }
    }]
  });
  from[attrib].setVisible(visible);
  from[attrib].setMap(map);
  to[attrib] = from[attrib];
  polylines[animatenum].push(from[attrib]);
  return from[attrib];
}

/**
 * Add a pair of lines to the map for highlighting the connection between two
 * markers; one visible while the mouse is over the marker (the "overline"),
 * the other while it is not (the "outline").
 * @param {ExtendedLatLng} from - The origin of the line (the original input)
 * @param {ExtendedLatLng} to - The destination of the line (the snapped point)
 * @return {!Object} line - the polyline object created
 */
function addCorrespondence(coords, marker) {
  if (!coords.overline) { addOverline(coords, coords.related); }
  if (!coords.outline)  { addOutline(coords, coords.related); }

  marker.addListener('mouseover', function(mevt) {
    coords.outline.setVisible(false);
    coords.overline.setVisible(true);
    coords.related.marker.setOpacity(1.0);
  });
  marker.addListener('mouseout', function(mevt) {
    coords.overline.setVisible(false);
    coords.outline.setVisible(true);
    coords.related.marker.setOpacity(0.5);
  });
}

// not used
/**
 * Add a marker to the map and check for special 'interpolated'
 * and 'unsnapped' properties to control which colour marker is used
 * @param {ExtendedLatLng} coords - Coords of where to add the marker
 * @return {!Object} marker - the marker object created
 */
function addMarker(coords) {
  var x = 0;
  
  var marker = new google.maps.Marker({
    position: coords,
    title: coords.lat + ',' + coords.lng,
    map: map,
    opacity: x,
    icon: RED_MARKER
  });

  // Coord should NEVER be interpolated AND unsnapped
  if (coords.interpolated) {
    marker.setIcon(BLUE_MARKER);
  } else if (!coords.related) {
    marker.setIcon(YELLOW_MARKER);
  } else if (coords.originalIndex != undefined) {
    marker.setIcon(RED_MARKER);
    addCorrespondence(coords, marker);
  } else {
    marker.setIcon({url: GREEN_MARKER,
                    scaledSize: {width: 20, height: 20}});
    addCorrespondence(coords, marker);
  }

  // Make markers change opacity when the mouse scrubs across them
  // marker.addListener('mouseover', function(mevt) {
  //   marker.setOpacity(1.0);
  // });
  // marker.addListener('mouseout', function(mevt) {
  //   marker.setOpacity(0.5);
  // });

  coords.marker = marker;  // Save a reference for easy access later
  markers.push(marker);

  return marker;
}

/**
 * Animate an icon along a polyline
 * @param {Object} polyline The line to animate the icon along
 */
function animateCircle(polyline, timeRoad) {
  var count = 0;
  var loopCt = 0;
  // fallback icon if the poly has no icon to animate
  var defaultIcon = [
    {
      icon: lineSymbol,
      offset: '100%'
    }
  ];
  let intervalId = window.setInterval(function() {
    count = (count + 1) % 200;
    loopCt += 1;
    var icons = polyline.get('icons') || defaultIcon;
    icons[0].offset = (count / 2) + '%';
    polyline.set('icons', icons);
    if (loopCt==199) {
      clearInterval(intervalId);
    }
  }, timeRoad);  
  

}

/**
 * Fit the map bounds to the current set of markers
 * @param {Array<Object>} markers Array of all map markers
 */
function fitBounds(markers) {
  var bounds = new google.maps.LatLngBounds;
  for (var i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].getPosition());
  }
  map.fitBounds(bounds);
}

/**
 * Uses Places library to get Place Details for a Place ID
 * @param {string}   placeId         The Place ID to look up
 * @param {Function} foundCallback   Called if the place is found
 * @param {Function} missingCallback Called if nothing is found
 * @param {Function} errorCallback   Called if request fails
 */
function getPlaceDetails(placeId,
                         foundCallback, missingCallback, errorCallback) {
  var request = {
    placeId: placeId
  };

  placesService.getDetails(request, function(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      foundCallback(place);
    } else if (status == google.maps.places.PlacesServiceStatus.NOT_FOUND) {
      missingCallback();
    } else if (errorCallback) {
      errorCallback();
    }
  });
}

/**
 * AJAX request to the Roads Speed Limit API.
 * Request the speed limit for the Place ID
 * @param {string}   placeId         Place ID to request the speed limit for
 * @param {Function} successCallback Called if request is successful
 * @param {Function} errorCallback   Called if request fails
 */
function getSpeedLimit(placeId, successCallback, errorCallback) {
  $.ajax({
    type: 'GET',
    url: SPEED_LIMIT_URL,
    data: {
      placeId: placeId,
      key: API_KEY
    },
    success: successCallback,
    error: errorCallback
  });
}


// not used
/**
 * Open an infowindow on either the map or the active streetview pano
 * @param {Object} infowindow Infowindow to be opened
 * @param {Object} marker Marker the infowindow is anchored to
 */
function openInfoWindow(infowindow, marker) {
  // If streetView is visible display the infoWindow over the pano
  // and anchor to the marker
  if (map.getStreetView().getVisible()) {
    infowindow.open(map.getStreetView(), marker);
  }
  // Otherwise open it on the map and anchor to the marker
  else {
    infowindow.open(map, marker);
  }
}


// not used
/**
 * Add event listener to for when the active pano changes
 */
function listenForPanoChange() {
  var pano = map.getStreetView();

  // Close all open markers when the pano changes
  google.maps.event.addListener(pano, 'position_changed', function() {
    closeAllInfoWindows(infoWindows);
  });
}

// not used
/**
 * Close all open infoWindows
 * @param {Array<Object>} infoWindows - all infowindow objects
 */
function closeAllInfoWindows(infoWindows) {
  for (var i = 0; i < infoWindows.length; i++) {
    infoWindows[i].close();
  }
}
