document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const copyBtn = document.getElementById('copy-btn');
    const message = document.getElementById('message');
    const warningMessage = document.getElementById('warning-message');
    const darkModeSwitch = document.getElementById('dark-mode-switch');

    // Weather widget elements
    const weatherContainer = document.getElementById('weather-container');
    const loadingMessage = document.getElementById('loading-message');
    const weatherSummary = document.getElementById('weather-summary');
    const weatherDetails = document.getElementById('weather-details');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemperature = document.getElementById('weather-temperature');
    const weatherCountry = document.getElementById('weather-country');
    const weatherDescription = document.getElementById('weather-description');
    const temperatureDisplay = document.getElementById('temperature');
    const windSpeedDisplay = document.getElementById('wind-speed');
    const locationDisplay = document.getElementById('location');

    const encryptionKeys = { 'e': 'enter', 'i': 'imes', 'a': 'ai', 'o': 'ober', 'u': 'ufat' };
    const decryptKeys = Object.fromEntries(Object.entries(encryptionKeys).map(([k, v]) => [v, k]));

    // Update UI to show or hide the message illustration
    function updateUI() {
        const inputText = textInput.value.trim();
        if (inputText === '') {
            message.textContent = 'Ningún mensaje encontrado';
            message.style.visibility = 'hidden';
        } else {
            message.textContent = 'El texto encriptado/desencriptado aparecerá aquí';
            message.style.visibility = 'visible';
        }
    }

    // Input validation for lowercase and updating warning message
    textInput.addEventListener('input', () => {
        if (/[A-Z]/.test(textInput.value)) {
            warningMessage.style.display = 'block';
            encryptBtn.disabled = true;
            decryptBtn.disabled = true;
        } else {
            warningMessage.style.display = 'none';
            encryptBtn.disabled = false;
            decryptBtn.disabled = false;
        }
        updateUI();
    });

    // Encryption functionality
    encryptBtn.addEventListener('click', () => {
        const inputText = textInput.value.trim().toLowerCase();
        if (inputText) {
            const encryptedText = inputText.replace(/[eioua]/g, match => encryptionKeys[match]);
            message.textContent = encryptedText;
        } else {
            message.textContent = 'Por favor ingresa un texto para encriptar.';
        }
    });

    // Decryption functionality
    decryptBtn.addEventListener('click', () => {
        const inputText = textInput.value.trim().toLowerCase();
        if (inputText) {
            let decryptedText = inputText;
            for (const [key, value] of Object.entries(decryptKeys)) {
                decryptedText = decryptedText.replace(new RegExp(key, 'g'), value);
            }
            message.textContent = decryptedText;
        } else {
            message.textContent = 'Por favor ingresa un texto para desencriptar.';
        }
    });

    // Copy text functionality
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(message.textContent).then(() => {
            alert('Texto copiado al portapapeles.');
        }).catch(err => {
            alert('Error al copiar el texto: ', err);
        });
    });

    // Dark Mode Toggle Functionality
    function setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            darkModeSwitch.nextElementSibling.textContent = '☀️'; // Switch to sun icon for dark mode
        } else {
            document.body.classList.remove('dark-mode');
            darkModeSwitch.nextElementSibling.textContent = '🌙'; // Switch to moon icon for light mode
        }
        localStorage.setItem('dark-mode', enabled);
    }

    darkModeSwitch.addEventListener('change', () => {
        setDarkMode(darkModeSwitch.checked);
    });

    // Initialize dark mode based on localStorage
    const darkModeEnabled = JSON.parse(localStorage.getItem('dark-mode'));
    if (darkModeEnabled) {
        darkModeSwitch.checked = true;
        setDarkMode(true);
    }

    // Fetch and display weather data
    async function fetchWeatherData() {
        try {
            // Example fetching the location (using a fallback IP-based location API)
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            
            // Get geolocation based on IP
            const geoResponse = await fetch(`https://ipinfo.io/${ipData.ip}/json`);
            const geoData = await geoResponse.json();
            const [latitude, longitude] = geoData.loc.split(',');

            // Example weather API based on the fetched latitude and longitude
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherResponse.json();

            updateWeatherUI(weatherData, geoData.city, latitude, longitude);
        } catch (error) {
            loadingMessage.textContent = 'Error al cargar los datos del clima.';
            console.error('Fetch error:', error);
        }
    }

    // Update the UI with fetched data
    function updateWeatherUI(data, city, latitude, longitude) {
        loadingMessage.style.display = 'none';
        weatherSummary.style.display = 'flex';

        // Set icon, temperature, and city
        const weatherCode = data.current_weather.weathercode;
        weatherIcon.textContent = getWeatherEmoji(weatherCode);
        weatherTemperature.textContent = `${data.current_weather.temperature}°C`;
        weatherCountry.textContent = city || 'Ciudad no disponible'; // Fallback if city is missing

        // Set the detailed weather information
        weatherDescription.textContent = `Descripción: ${weatherCode || 'No disponible'}`;
        temperatureDisplay.textContent = `Temperatura: ${data.current_weather.temperature}°C`;
        windSpeedDisplay.textContent = `Viento: ${data.current_weather.windspeed} m/s`;
        
        // Handle location to avoid "undefined"
        if (latitude && longitude) {
            locationDisplay.textContent = `Latitud ${latitude}, Longitud ${longitude}`;
        } else {
            locationDisplay.textContent = 'Ubicación no disponible'; // Fallback
        }
    }

    // Helper function to map weather codes to emojis
    function getWeatherEmoji(weatherCode) {
        switch (weatherCode) {
            case 0: return '☀️'; // Clear sky
            case 1: return '🌤️'; // Mainly clear
            case 2: return '⛅'; // Partly cloudy
            case 3: return '☁️'; // Overcast
            case 45: case 48: return '🌫️'; // Fog
            case 51: case 53: case 55: return '🌦️'; // Drizzle
            case 61: case 63: case 65: return '🌧️'; // Rain
            case 66: case 67: return '🌨️'; // Freezing rain
            case 71: case 73: case 75: return '❄️'; // Snow
            case 80: case 81: case 82: return '🌦️'; // Showers
            case 95: return '🌩️'; // Thunderstorm
            default: return '❓'; // Unknown
        }
    }

    // Initialize weather data fetch on page load
    fetchWeatherData();
});
