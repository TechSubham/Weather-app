import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weatherData, setWeatherData] = useState({
    main: { temp: null, feels_like: null, pressure: null, humidity: null },
    weather: [{ description: null, icon: null }],
    wind: { speed: null, deg: null },
    sys: { sunrise: null, sunset: null, country: null },
    visibility: null,
    clouds: { all: null },
    name: null,
  });

  const [cityName, setCityName] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (cityName.trim() === '') {
      setWeatherData({
        main: { temp: null, feels_like: null, pressure: null, humidity: null },
        weather: [{ description: null, icon: null }],
        wind: { speed: null, deg: null },
        sys: { sunrise: null, sunset: null, country: null },
        visibility: null,
        clouds: { all: null },
        name: null,
      });
      return;
    }



    const apiKey = ''; // ADD YOUR API KEY HERE
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    axios.get(url)
      .then(response => {
        setWeatherData(response.data);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        alert('City not found. Please enter a valid city name.');
      });
  }, [cityName]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCityName(query);
  };

  const {
    main: { temp, feels_like, pressure, humidity },
    weather,
    wind: { speed },
    sys: { sunrise, sunset, country },
    visibility,
    clouds: { all: cloudiness },
    name
  } = weatherData;

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className='p-10 bg-gray-400 min-h-screen'>
      <div className="max-w-7xl mx-auto h-auto flex bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
        {/* Sidebar with normal color */}
        <div className="w-1/4 bg-gray-300 text-gray-800 p-8 flex flex-col items-center">
          <form onSubmit={handleSearch} className="mb-8 w-full">
            <input
              type="text"
              placeholder="Search for places..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 bg-white shadow-sm"
            />
            <button
              type="submit"
              className="mt-4 w-full p-2 bg-blue-300 text-gray-800 font-semibold rounded-lg hover:bg-blue-400 transition duration-200 ease-in-out shadow-md"
            >
              Search
            </button>
          </form>
          <div className="flex flex-col items-center text-center">
            <div className="text-7xl font-bold mb-4">
              {temp !== null ? `${temp}°C` : 'N/A'}
            </div>
            <div className="text-gray-600 mb-4">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
            </div>
            <div className="text-gray-600 mb-4 flex items-center gap-2">
              {weather[0].icon && (
                <img src={`https://openweathermap.org/img/wn/${weather[0].icon}.png`} alt={weather[0].description} className="w-12 h-12" />
              )}
              <span className="text-xl font-semibold capitalize">{weather[0].description || 'N/A'}</span>
            </div>
            <div className="text-lg font-medium">
              <span>{name || 'N/A'}, {country || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 bg-gray-100">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-700">Weather Highlights</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Feels Like</h3>
                <div className="text-4xl text-teal-500">{feels_like !== null ? `${feels_like}°C` : 'N/A'}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-yellow-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Pressure</h3>
                <div className="text-4xl text-yellow-500">{pressure !== null ? `${pressure} hPa` : 'N/A'}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Humidity</h3>
                <div className="text-4xl text-blue-500">{humidity !== null ? `${humidity}%` : 'N/A'}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-green-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Visibility</h3>
                <div className="text-4xl text-green-500">{visibility !== null ? `${visibility / 1000} km` : 'N/A'}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-indigo-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Wind Status</h3>
                <div className="text-4xl">{speed !== null ? `${speed} km/h` : 'N/A'}</div>
                <div className="text-gray-600">{weatherData.wind.deg !== null ? `${weatherData.wind.deg}°` : 'N/A'}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-pink-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Sunrise & Sunset</h3>
                <div className="text-lg text-gray-500">Sunrise: {formatTime(sunrise)}</div>
                <div className="text-lg text-gray-500">Sunset: {formatTime(sunset)}</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition duration-200 ease-in-out transform hover:scale-105">
                <h3 className="text-lg font-semibold mb-2">Cloudiness</h3>
                <div className="text-4xl text-gray-600">{cloudiness !== null ? `${cloudiness}%` : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
