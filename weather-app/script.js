class WeatherApp {
    constructor() {
        this.apiKey = 'b1fcdd11dabd1065e7fa2353536ee9ed'; // Replace with your OpenWeather API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
        this.units = 'metric';
        this.init();
    }
    init() {
        this.searchBtn = document.getElementById('search-btn');
        this.cityInput = document.getElementById('city-input');
        this.unitToggle = document.getElementById('unit-toggle');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.suggestions = document.getElementById('city-suggestions');
        this.weatherIcon = document.getElementById('weather-icon');
        this.weatherIcon.style.display = 'none';
        this.searchBtn.addEventListener('click', () => this.getWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getWeather();
        });
        this.unitToggle.addEventListener('click', () => this.toggleUnits());
        this.cityInput.addEventListener('input', () => this.handleInput());
        document.addEventListener('click', (e) => {
            if (!this.suggestions.contains(e.target) && e.target !== this.cityInput) {
                this.suggestions.classList.add('hidden');
            }
        });
    }
    
    async getWeather() {
        const city = this.cityInput.value.trim();
        if (!city) return;

        this.showLoading();
        try {
            const weatherData = await this.fetchWeatherData(city);
            const forecastData = await this.fetchForecastData(city);
            this.displayWeather(weatherData);
            this.displayForecast(forecastData);
            this.hideError();
        } catch (error) {
            this.showError('City not found or network error. Please try again.');
        }
        this.hideLoading();
    }

    async fetchWeatherData(city) {
        const response = await fetch(
            `${this.baseUrl}/weather?q=${city}&units=${this.units}&appid=${this.apiKey}`
        );
        if (!response.ok) throw new Error('Weather data fetch failed');
        return response.json();
    }

    async fetchForecastData(city) {
        const response = await fetch(
            `${this.baseUrl}/forecast?q=${city}&units=${this.units}&appid=${this.apiKey}`
        );
        if (!response.ok) throw new Error('Forecast data fetch failed');
        return response.json();
    }

    displayWeather(data) {
        const weatherDetails = document.getElementById('weather-details');
        const iconCode = data.weather[0].icon;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        this.weatherIcon.style.display = 'block';
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        this.weatherIcon.alt = data.weather[0].description;
        document.getElementById('weather-icon').src = 
            `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        document.getElementById('current-temp').textContent = 
            `${temp}°${this.units === 'metric' ? 'C' : 'F'}`;
        document.getElementById('feels-like').textContent = 
            `Feels like: ${feelsLike}°${this.units === 'metric' ? 'C' : 'F'}`;
        document.getElementById('weather-description').textContent = 
            data.weather[0].description;
        document.getElementById('humidity').textContent = 
            `Humidity: ${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = 
            `Wind: ${data.wind.speed} ${this.units === 'metric' ? 'm/s' : 'mph'}`;
        document.getElementById('pressure').textContent = 
            `Pressure: ${data.main.pressure} hPa`;
    }

    displayForecast(data) {
        const forecastDetails = document.getElementById('forecast-details');
        forecastDetails.innerHTML = '';

        const dailyForecasts = this.groupForecastsByDay(data.list);
        
        dailyForecasts.forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <p>${new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
                <p>${Math.round(forecast.main.temp)}°${this.units === 'metric' ? 'C' : 'F'}</p>
                <p>${forecast.weather[0].description}</p>
            `;
            forecastDetails.appendChild(forecastItem);
        });
    }

    groupForecastsByDay(forecastList) {
        const dailyForecasts = [];
        const today = new Date().getDate();
        
        forecastList.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000).getDate();
            if (forecastDate !== today && !dailyForecasts.find(f => 
                new Date(f.dt * 1000).getDate() === forecastDate)) {
                dailyForecasts.push(forecast);
            }
        });

        return dailyForecasts.slice(0, 5);
    }

    toggleUnits() {
        this.units = this.units === 'metric' ? 'imperial' : 'metric';
        if (this.cityInput.value.trim()) {
            this.getWeather();
        }
    }

    showLoading() {
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.weatherIcon.style.display = 'none';
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    async handleInput() {
        const query = this.cityInput.value.trim();
        if (query.length < 3) {
            this.suggestions.classList.add('hidden');
            return;
        }

        try {
            const cities = await this.fetchCities(query);
            this.displaySuggestions(cities);
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
        }
    }

    async fetchCities(query) {
        const response = await fetch(
            `${this.geocodingUrl}/direct?q=${query}&limit=5&appid=${this.apiKey}`
        );
        if (!response.ok) throw new Error('Failed to fetch cities');
        return response.json();
    }

    displaySuggestions(cities) {
        if (!cities.length) {
            this.suggestions.classList.add('hidden');
            return;
        }

        this.suggestions.innerHTML = '';
        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${city.name}, ${city.state || ''} ${city.country}`.trim();
            div.addEventListener('click', () => {
                this.cityInput.value = div.textContent;
                this.suggestions.classList.add('hidden');
                this.getWeather();
            });
            this.suggestions.appendChild(div);
        });
        this.suggestions.classList.remove('hidden');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});