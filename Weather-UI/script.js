const searchInput = document.getElementById("search-input");
const dropdown = document.getElementById('dropdown');
const searchButton = document.getElementById("search-button");
const weatherInfo = document.getElementById("weather-info");
const mapContainer = document.getElementById('map-container');
const map = document.getElementById("map");

const apiKey = "b1fcdd11dabd1065e7fa2353536ee9ed";

window.onload = function() {
    var width = window.innerWidth;

    document.querySelector(".my-element").style.width = width + "px";
};

searchButton.addEventListener('click', () => {
    search();
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        search();
    }
});



function search() {
    const cityName = searchInput.value;
    const searchValue = searchInput.value;
    mapContainer.querySelector('h2').textContent = `You searched for: "${searchValue}"`;

    // Perform the rest of your search logic here
    // ...
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const weatherDescription = data.weather[0].description;
            const temperature = Math.round((data.main.temp) - 273.15) + " &deg;";
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;

            // Display weather information
            weatherInfo.innerHTML = `
        <p>Weather description: ${weatherDescription}</p>
        <p>Temperature: ${temperature} C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind speed: ${windSpeed} m/s</p>
      `;

            const lat = data.coord.lat;
            const lon = data.coord.lon;
            const mapUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyDGu7JbuS7I91ln8vYzNsvq3oh4Yx76mXE&center=${lat},${lon}&zoom=12`;
            map.innerHTML = `<iframe src="${mapUrl}" width="600" height="250" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
            const mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(lat, lon),
                styles: [{
                    featureType: 'administrative',
                    elementType: 'geometry.stroke',
                    stylers: [{
                        color: '#ff0000',
                        weight: 2
                    }]
                }]
            };
            const mapInstance = new google.maps.Map(document.getElementById('map'), mapOptions);
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lon),
                map: mapInstance,
                title: cityName
            });
            marker.setMap(mapInstance);



        })
        .catch(error => console.error(error));
};

searchInput.addEventListener('input', async() => {
    const query = searchInput.value;

    // Call the OpenWeatherMap API to search for cities that match the query
    const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}`);
    const data = await response.json();

    // Parse the results and create a list of suggested city names
    const cities = data.list.map(city => city.name);
    const suggestions = cities.slice(0, 1);

    // Display the list of suggested cities as a dropdown
    dropdown.innerHTML = '';
    suggestions.forEach(city => {
        const option = document.createElement('div');
        option.textContent = city;
        option.addEventListener('click', () => {
            searchInput.value = city;
            dropdown.innerHTML = '';
            search();
        });
        dropdown.appendChild(option);
    });
});

// Hide the dropdown when the user clicks outside of it
document.addEventListener('click', function(event) {
    if (!dropdown.contains(event.target)) {
        dropdown.innerHTML = '';
    }
});