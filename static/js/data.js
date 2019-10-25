/* jshint: esversion: 6*/ 

//  Additional Earthquake information. Source: http://www.geo.mtu.edu/UPSeis/magnitude.html
const additionalEarthquakeInfo = [ 
{magInterval: [-1000, 2.5 ], effect:"Usually not felt, but can be recorded by seismograph.", freqYear: "900,000"},
{magInterval: [2.5  , 5.5 ], effect:"Often felt, but only causes minor damage.",             freqYear: "30,000"},
{magInterval: [5.5  , 6.1 ], effect:"Slight damage to buildings and other structures.",      freqYear: "500"},
{magInterval: [6.1  , 7.0 ], effect:"May cause a lot of damage in very populated areas.",    freqYear: "100"},
{magInterval: [7.0  , 8.0 ], effect:"Serious damage.",                                       freqYear: "20"},
{magInterval: [8.0  , 1000], effect:"Can totally destroy communities near the epicenter.",   freqYear: "One every 5 to 10 years"}
];

// Color scale for legend and earthquake magnitude circles.
const colorScale = [
{magInterval: [-1000,   1], color: "#ffe4ff"},
{magInterval: [    1,   2], color: "#ffa9ff"},
{magInterval: [    2,   3], color: "#e474d6"},
{magInterval: [    3,   4], color: "#d732d1"},
{magInterval: [    4,   5], color: "#820082"},
{magInterval: [    5,1000], color: "#340034"}
];

