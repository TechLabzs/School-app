// OpenWeatherMap API Configuration
const API_KEY = 'demo'; // Will be replaced with user's API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherContent = document.getElementById('weatherContent');
const welcomeMessage = document.getElementById('welcomeMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    }
});

locationBtn.addEventListener('click', getLocationWeather);

// Get weather by city name
async function fetchWeatherByCity(city) {
    try {
        showLoading(true);
        hideError();

        // Fetch current weather and forecast
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&appid=8d5ceb557d4af9b4d66c008b952adeda`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&appid=8d5ceb557d4af9b4d66c008b952adeda`
        );
        
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);
        showLoading(false);
    } catch (error) {
        showError(error.message);
        showLoading(false);
    }
}

// Get weather using geolocation
async function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Fetch current weather
                    const currentResponse = await fetch(
                        `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=8d5ceb557d4af9b4d66c008b952adeda`
                    );
                    
                    const currentData = await currentResponse.json();
                    
                    // Fetch 5-day forecast
                    const forecastResponse = await fetch(
                        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=8d5ceb557d4af9b4d66c008b952adeda`
                    );
                    
                    const forecastData = await forecastResponse.json();
                    
                    displayWeather(currentData, forecastData);
                    showLoading(false);
                } catch (error) {
                    showError('Failed to fetch weather data');
                    showLoading(false);
                }
            },
            (error) => {
                showError('Permission denied. Please enter a city manually.');
                showLoading(false);
            }
        );
    } else {
        showError('Geolocation not supported. Please enter a city manually.');
    }
}

// Display weather data
function displayWeather(currentData, forecastData) {
    // Hide welcome message and show weather content
    welcomeMessage.style.display = 'none';
    weatherContent.style.display = 'block';

    // Current weather
    const current = currentData;
    document.getElementById('cityName').textContent = `${current.name}, ${current.sys.country}`;
    document.getElementById('weatherDescription').textContent = current.weather[0].description;
    document.getElementById('temperature').textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById('weatherIcon').textContent = getWeatherEmoji(current.weather[0].main);
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${(current.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('pressure').textContent = `${current.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.main.feels_like)}°C`;
    
    // Sunrise and Sunset
    const sunrise = new Date(current.sys.sunrise * 1000);
    const sunset = new Date(current.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // UV Index (simulated - would need separate API call in production)
    const uvIndex = Math.floor(Math.random() * 12);
    document.getElementById('uvIndex').textContent = uvIndex;

    // 5-Day Forecast
    displayForecast(forecastData);
}

// Display 5-day forecast
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (every 8 entries, approximately 24 hours apart)
    const dailyForecasts = {};
    
    forecastData.list.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = forecast;
        }
    });

    // Display up to 5 days
    Object.entries(dailyForecasts).slice(0, 5).forEach(([day, forecast]) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${day}</div>
            <div class="forecast-icon">${getWeatherEmoji(forecast.weather[0].main)}</div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-desc">${forecast.weather[0].main}</div>
        `;
        forecastContainer.appendChild(card);
    });
}

// Get weather emoji based on condition
function getWeatherEmoji(condition) {
    const emojis = {
        'Thunderstorm': '⛈️',
        'Drizzle': '🌦️',
        'Rain': '🌧️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🌪️',
        'Ash': '🌋',
        'Squall': '💨',
        'Tornado': '🌪️',
        'Clear': '☀️',
        'Clouds': '☁️'
    };
    return emojis[condition] || '🌤️';
}

// Show loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = `❌ Error: ${message}`;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Initialize with demo data
function initDemo() {
    console.log('📱 Weather Dashboard initialized!');
    console.log('ℹ️ Using OpenWeatherMap free API');
    console.log('🔍 Search for a city or use your location to get started');
}

window.addEventListener('load', initDemo);
