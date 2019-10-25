/* jshint esversion: 6*/ 

// URL to get the Earthquake data.
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map
var vMap = L.map("map", {
  center: [44, -95.71], // [37.09, -95.71],
  zoom: 4
});

// Define maps styles
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-streets-v9",
  accessToken: API_KEY
}).addTo( vMap ); // Add a basemap

var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v9",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v9",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v9",
  accessToken: API_KEY
});

// Function to get Additional Earthquake information and colorScale (source data.js)
function getInfo(mag, source) {
  return source.find( obj => (obj.magInterval[0] <= mag && mag < obj.magInterval[1]) );
}

// Create variable to store earthquake circles.
var earthquakeMarkers = [];

// Create panes to garantee that earthquake tooltips are always available for users.
// Otherwise, Fault Lines will be on top of the map and earthquake tooltips will be inaccessible.
var pane = vMap.createPane("paneZindex");
pane.style.zIndex = 500;

// Function to create layers structure and add to the map
function addMarkers ( response ) {

  // Loop through the cities array and create one marker for each record object
  for (var i = 0; i < response.metadata.count; i++) {

    // REMARK: There are some earthquakes with negative magnitudes.
    // Assign the magnitude to a variable
    var mag = response.features[i].properties.mag;

    // Conditionals for colors accordingly to the magnitude.
    var color = getInfo(mag, colorScale).color;

    // Get the coordinates
    var coordinates = [ response.features[i].geometry.coordinates[1], response.features[i].geometry.coordinates[0]];
    
    // Get more information to present on tooltip.
    var moreInfo = getInfo(mag, additionalEarthquakeInfo);

    // Add circles to earthquakeMarkers
    earthquakeMarkers.push(  L.circle(coordinates, {
      stroke: true,
      fillOpacity: 0.7,
      weight: 1,
      color: "white",
      fillColor: color,
      radius: mag * 40000,
      pane: "paneZindex"
    } ).bindPopup( 
                  "<h3>" + response.features[i].properties.place + "</h3>" +
                  "<hr>" +
                  "<span>Magnitude: " + mag + "</span><br>" + 
                  "<span>Effect: " + moreInfo.effect + "</span><br>" +
                  "<span>Estimate number each year: " + moreInfo.freqYear + "</span>"  
                 )
    );
   }

  // Create a layer for Fault Lines
  let faultLinesLayer = L.layerGroup();

  // Set style for Fault Lines layer
  var geoJsonStyle = {
    color: "rgba(0,100,100, 0.5)",
    fillOpacity: 0,
    weight: 1
  };

  // Fill that layer with tectonic plates data
  d3.json('./static/data/PB2002_plates.json', function( data ){
    L.geoJSON( data, {
      style: geoJsonStyle,
      onEachFeature: addFaultLinesData,
    });
  });

  // This function is run for every feature found in the geojson file. 
  function addFaultLinesData( feature, layer ){
    faultLinesLayer.addLayer( layer );
  }

  // Fill the earthquake layer
  let earthquakeLayer = L.layerGroup(earthquakeMarkers);

  // Add layears to the map;
  earthquakeLayer.addTo( vMap );
  faultLinesLayer.addTo( vMap );

  // Map styles options to appear in the control box.
  let basemapControl = {
    "Satellite": satellite,
    "Streets": streetmap,
    "Grayscale": light,
    "Outdoors": outdoors,
    "Dark Map": dark
  };

  // Data layers options in the control box.  
  let layerControl = {
    "Fault Lines": faultLinesLayer,  
    "Earthquake": earthquakeLayer,
  };

  // Add the control component, a layer list with checkboxes for operational layers and radio buttons for basemaps
  L.control.layers( basemapControl, layerControl ).addTo( vMap );
}

// Perform the API call to get earthquake data
d3.json(earthquakeURL,  addMarkers );

// Create a legend for color scale
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "color-scale"
info.onAdd = function() {
  var div = L.DomUtil.create("div", "color-scale");
  return div;
};

// Add the colors legend to the map
info.addTo(vMap);

// Legend for color scale.
document.querySelector(".color-scale").innerHTML = [
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(0,colorScale).color + ";'></div><p class='color-range'>0-1</p></div>",
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(1,colorScale).color + ";'></div><p class='color-range'>1-2</p></div>",
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(2,colorScale).color + ";'></div><p class='color-range'>2-3</p></div>",
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(3,colorScale).color + ";'></div><p class='color-range'>3-4</p></div>",
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(4,colorScale).color + ";'></div><p class='color-range'>4-5</p></div>",
  "<div class='item-container'><div class='box-color' style='background:" + getInfo(5,colorScale).color + ";'></div><p class='color-range'> 5+</p></div>"
].join("");
