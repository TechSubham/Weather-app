import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Cloud, Wind, Droplet, Eye, CloudRain, Sunrise, Sunset } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

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

    const apiKey = '9ea08a9892905905d69203b7ae04756c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    setLoading(true);
    axios.get(url)
      .then(response => {
        setWeatherData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        alert('City not found. Please enter a valid city name.');
        setLoading(false);
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

  const WeatherCard = ({ icon, title, value, description, bgColor, textColor }) => (
    <div className={`p-6 rounded-xl shadow-lg ${bgColor} transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <h3 className="text-lg font-semibold opacity-70">{title}</h3>
      </div>
      <div className={`text-4xl font-bold ${textColor} mb-2`}>{value}</div>
      {description && <div className="text-sm opacity-70">{description}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-3 gap-6 p-6">
        {/* Search and Current Conditions Column */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-xl">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition duration-300"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-7xl font-bold text-blue-600 mb-4">
                {temp !== null ? `${temp}°C` : '--'}
              </div>
              <div className="flex justify-center items-center gap-2 mb-4">
                {weather[0].icon && (
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`} 
                    alt={weather[0].description} 
                    className="w-20 h-20" 
                  />
                )}
                <span className="text-xl font-semibold capitalize text-gray-600">
                  {weather[0].description || 'No data'}
                </span>
              </div>
              <div className="text-lg font-medium text-gray-500">
                {name || 'City'}, {country || 'Country'}
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          )}
        </div>

        {/* Weather Details Column */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <WeatherCard 
            icon={<Droplet className="text-blue-500" />} 
            title="Humidity" 
            value={`${humidity || '--'}%`} 
            bgColor="bg-blue-50" 
            textColor="text-blue-500" 
          />
          <WeatherCard 
            icon={<Wind className="text-indigo-500" />} 
            title="Wind" 
            value={`${speed || '--'} km/h`} 
            description={`${weatherData.wind.deg || '--'}°`} 
            bgColor="bg-indigo-50" 
            textColor="text-indigo-500" 
          />
          <WeatherCard 
            icon={<Eye className="text-green-500" />} 
            title="Visibility" 
            value={`${visibility ? (visibility / 1000).toFixed(1) : '--'} km`} 
            bgColor="bg-green-50" 
            textColor="text-green-500" 
          />
          <WeatherCard 
            icon={<CloudRain className="text-gray-500" />} 
            title="Pressure" 
            value={`${pressure || '--'} hPa`} 
            bgColor="bg-gray-50" 
            textColor="text-gray-500" 
          />
          <WeatherCard 
            icon={<Sunrise className="text-orange-500" />} 
            title="Sunrise" 
            value={formatTime(sunrise)}
            bgColor="bg-orange-50" 
            textColor="text-orange-500" 
          />
          <WeatherCard 
            icon={<Sunset className="text-pink-500" />} 
            title="Sunset" 
            value={formatTime(sunset)}
            bgColor="bg-pink-50" 
            textColor="text-pink-500" 
          />
        </div>
      </div>
    </div>
  );
}

export default App;