// Loading API Keys from local file
window.onload = () => {
    fetch("./env.json")
        .then(response => response.json())
        .then(json => {
            mapboxgl.accessToken = json.mapboxkey;
            documenuKey = json.documenukey;
            console.log("Loaded API Key from local file.");
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
        });
}

// --- API Settings ---
//let documenuKey = "8bb10903010e51cfb76da6d356c1d84d";
let documenuKey = "";
let APICallURL = "https://api.documenu.com/v2/restaurants/search/geo?lat=39&lon=-94&distance=5";
// For using locally saved data
let localURL = "./data.json";

mapboxgl.accessToken = "pk.eyJ1IjoianN0YW1ldXMiLCJhIjoiY2ttMzh5MXB1MjNtbDJxbHlicWdzc3NpeiJ9.mgv20WRpcdojJ8elyTdmyg";
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});

// --- App Settings ---
let searchDistance = 5;
let centerMarker = new mapboxgl.Marker({
    color: "#ff0000",
});
let debugMarkers = [];
let restaurantMarkers = [];

// --- DOM Elements ---
const cardList = document.querySelector("#app_cardlist");

const searchButton = document.querySelector("#button_startSearch");
searchButton.addEventListener("click", () => {
    console.log("Searching...");
    const coordinates = getCenterCoordinates();
    restaurantMarkers = [];
    setTimeout(() => {
        fetchAPI(coordinates.lat, coordinates.lng, searchDistance);
    }, 1000);
});

const debugMarkerButton = document.querySelector("#button_addDebugMarker");
debugMarkerButton.addEventListener("click", () => {
    console.log("Adding debug marker...");
    if(debugMarkers.length > 1) {
        debugMarkers[0].remove();
        debugMarkers.shift();
    }
    createDebugMarker(getCenterCoordinates());
});

const checkDistanceButton = document.querySelector("#button_debugDistance");
checkDistanceButton.addEventListener("click", () => {
    console.log("Checking distance between debug markers.");
    debugDistance();
});

const rangeInput = document.querySelector("#input_searchrange");
rangeInput.addEventListener("input", () => {
    searchDistance = rangeInput.value;
    rangeDisplay.innerText = searchDistance;
});

const rangeDisplay = document.querySelector("#searchrange_display");
rangeDisplay.innerText = searchDistance;

// API call functions
function fetchAPI(latitude, longitude, distance) {
    clearRestaurantCards();
    let fullUrl = `https://api.documenu.com/v2/restaurants/search/geo?lat=${latitude}&lon=${longitude}&distance=${distance}`;
    fetch(fullUrl, {headers: {"X-API-KEY": "8bb10903010e51cfb76da6d356c1d84d"}})
        .then(response => response.json())
        .then(json => {
            console.log(json)
            for(let i = 0; i < json.data.length; i++) {
                createRestaurantCard(json.data[i]);
                createRestaurantMarker(json.data[i]);
            }
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
        });
}

function fetchLocal() {
    fetch(localURL)
        .then(response => response.json())
        .then(json => {
            console.log(`Json: ${json}`);
            console.log(`Json.data: ${json.data}`);
            //for(let i = 0; i < json.data.length; i++) {
            //    createRestaurantCard(json.data[i]);
            //}
            //return json;
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
        });
}

// Uses the MapBox API 
function getCenterCoordinates() {
    const mapCenter = map.transform._center;
    return {lng: mapCenter.lng, lat: mapCenter.lat};
}

function clearRestaurantCards() {
    while (cardList.firstChild) {
        cardList.firstChild.remove();
    }
    console.log("Cleared restaurant cards.");
}

// Uses data from the Documenu API
function createRestaurantCard(data) {
    const cardDiv = document.createElement("div");

    const restaurantHeader = document.createElement("h2");
    restaurantHeader.innerText = data.restaurant_name;
    cardDiv.appendChild(restaurantHeader);

    const restaurantStreet = document.createElement("h3");
    restaurantStreet.innerText = data.address.street;
    cardDiv.appendChild(restaurantStreet);

    for (let i = 0; i < data.cuisines.length; i++) {
        const newTag = document.createElement("h6");
        newTag.innerText = data.cuisines[i];
        newTag.className = "cuisinetag";
        cardDiv.appendChild(newTag);
    }

    const newLine = document.createElement("hr");
    cardDiv.appendChild(newLine);

    const restaurantPhone = document.createElement("p");
    restaurantPhone.innerText = `Phone: ${data.restaurant_phone}`;
    cardDiv.appendChild(restaurantPhone);
    const restaurantWebsite = document.createElement("a");
    restaurantWebsite.innerText = data.restaurant_website;
    restaurantWebsite.href = data.restaurant_website;
    cardDiv.appendChild(restaurantWebsite);

    cardDiv.className = "restaurantcard";
    cardList.appendChild(cardDiv);
}

function createRestaurantMarker(data) {
    console.log(`Creating marker for: ${data.restaurant_name}`);
    //console.log("-----DEBUGGING-----");
    //console.log(data);
    //console.log(`Lat: ${data.geo.lat}`);
    //console.log(`Lon: ${data.geo.lon}`);
    //console.log("-------------------");
    const newMarker = new mapboxgl.Marker()
        .setLngLat([data.geo.lon, data.geo.lat])
        .addTo(map);
    restaurantMarkers.push(newMarker);
}

function updateCenterMarker() {
    const coordinates = getCenterCoordinates();
    centerMarker.setLngLat([coordinates.lng, coordinates.lat]).addTo(map);
}

// Debug functions
function createDebugMarker(coordinates) {
    const newMarker = new mapboxgl.Marker()
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map);
    debugMarkers.push(newMarker);
}

function debugDistance() {
    const pointA = debugMarkers[0].getLngLat();
    const pointB = debugMarkers[1].getLngLat();
    const distance = pointA.distanceTo(pointB);
    console.log(distance);
}

// APP ENTRY POINT
// When the user moves the map and lets go, it creates a map pin in the middle
// and then uses the coordinates to find restaurants within the specified range.
//map.on("drag", () => {
    //updateCenterMarker();
//});
//
//map.on("zoom", () => {
    //updateCenterMarker();
//});

map.on("dragend", () => {
    console.log(getCenterCoordinates());
    updateCenterMarker();
});
