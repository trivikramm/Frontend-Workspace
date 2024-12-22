const WeatherApp = require('./script');

// Mock DOM elements and fetch
beforeEach(() => {
	document.body.innerHTML = `
		<input id="city-input" />
		<button id="search-btn"></button>
		<div id="unit-toggle"></div>
		<div id="loading"></div>
		<div id="error-message"></div>
		<div id="city-suggestions"></div>
		<img id="weather-icon" />
	`;
	
	global.fetch = jest.fn();
});

describe('WeatherApp', () => {
	let app;

	beforeEach(() => {
		app = new WeatherApp();
	});

	test('should initialize with metric units', () => {
		expect(app.units).toBe('metric');
	});

	test('toggleUnits should switch between metric and imperial', () => {
		app.toggleUnits();
		expect(app.units).toBe('imperial');
		app.toggleUnits(); 
		expect(app.units).toBe('metric');
	});

	test('fetchWeatherData should call API with correct parameters', async () => {
		const mockResponse = { ok: true, json: () => Promise.resolve({}) };
		global.fetch.mockResolvedValueOnce(mockResponse);

		await app.fetchWeatherData('London');
		
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/weather?q=London&units=metric')
		);
	});

	test('fetchForecastData should call API with correct parameters', async () => {
		const mockResponse = { ok: true, json: () => Promise.resolve({}) };
		global.fetch.mockResolvedValueOnce(mockResponse);

		await app.fetchForecastData('London');
		
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/forecast?q=London&units=metric')
		);
	});

	test('should show error message when API call fails', async () => {
		global.fetch.mockRejectedValueOnce(new Error('API Error'));
		
		await app.getWeather();
		
		const errorEl = document.getElementById('error-message');
		expect(errorEl.classList.contains('hidden')).toBe(false);
	});

	test('groupForecastsByDay should return max 5 days forecast', () => {
		const mockForecasts = Array(8).fill().map((_, i) => ({
			dt: Date.now()/1000 + (i * 86400),
			weather: [{}],
			main: {}
		}));

		const result = app.groupForecastsByDay(mockForecasts);
		expect(result.length).toBeLessThanOrEqual(5);
	});
});