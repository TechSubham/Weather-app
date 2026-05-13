import React, { useState, useEffect } from 'react';
import { Wind, Droplet, Eye, CloudRain, Sunrise, Sunset } from 'lucide-react';

// ─── Ensemble voting predictors ───────────────────────────────────────────────

const VOTERS = [
  {
    name: 'Humidity',
    predict({ humidity }) {
      if (humidity > 75) return 'High';
      if (humidity > 50) return 'Moderate';
      return 'Low';
    },
  },
  {
    name: 'Temperature',
    predict({ temp, humidity }) {
      if (temp < 5 || (temp > 18 && temp < 30 && humidity > 45)) return 'High';
      if ((temp >= 5 && temp < 10) || temp >= 30) return 'Moderate';
      return 'Low';
    },
  },
  {
    name: 'Pressure',
    predict({ pressure }) {
      if (pressure < 990) return 'High';
      if (pressure < 1010) return 'Moderate';
      return 'Low';
    },
  },
  {
    name: 'Wind Speed',
    predict({ windSpeed }) {
      if (windSpeed > 50) return 'High';
      if (windSpeed > 25) return 'Moderate';
      return 'Low';
    },
  },
  {
    name: 'Cloud Cover',
    predict({ clouds }) {
      if (clouds > 70) return 'High';
      if (clouds > 40) return 'Moderate';
      return 'Low';
    },
  },
];

function ensembleVote(weatherInput) {
  const tally = { High: 0, Moderate: 0, Low: 0 };
  const votes = VOTERS.map((voter) => {
    const vote = voter.predict(weatherInput);
    tally[vote]++;
    return { name: voter.name, vote };
  });

  const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  const confidence = Math.round((tally[winner] / VOTERS.length) * 100);

  return { prediction: winner, confidence, votes, tally };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PREDICTION_META = {
  High: {
    label: 'High chance of rain',
    badge: 'Risk: High',
    badgeClass: 'bg-red-100 text-red-700',
    reason: 'Most weather indicators point to rainy conditions.',
  },
  Moderate: {
    label: 'Moderate chance of rain',
    badge: 'Risk: Moderate',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    reason: 'Mixed signals — an umbrella would be wise.',
  },
  Low: {
    label: 'Low chance of rain',
    badge: 'Risk: Low',
    badgeClass: 'bg-green-100 text-green-700',
    reason: 'Conditions are mostly clear and dry.',
  },
};

const VOTE_COLORS = {
  High:     'bg-red-400',
  Moderate: 'bg-yellow-400',
  Low:      'bg-green-400',
};

const VOTE_BAR_WIDTH = {
  High: 'w-full',
  Moderate: 'w-1/2',
  Low: 'w-1/5',
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: 'numeric', hour12: true,
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const WeatherCard = ({ icon, title, value, description, bgColor, textColor }) => (
  <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${bgColor} transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-2 lg:mb-4">
      <div className="w-6 h-6 lg:w-8 lg:h-8">{icon}</div>
      <h3 className="text-sm lg:text-lg font-semibold opacity-70">{title}</h3>
    </div>
    <div className={`text-2xl lg:text-4xl font-bold ${textColor} mb-1 lg:mb-2`}>{value}</div>
    {description && <div className="text-xs lg:text-sm opacity-70">{description}</div>}
  </div>
);

const VotingPanel = ({ votes, tally, confidence }) => (
  <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-wide text-purple-500 font-semibold">Voter panel</p>
      <span className="text-xs text-gray-500 font-medium">{confidence}% confidence</span>
    </div>

    {votes.map(({ name, vote }) => (
      <div key={name} className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-gray-500 w-24 shrink-0">{name}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className={`h-full rounded-full ${VOTE_COLORS[vote]} ${VOTE_BAR_WIDTH[vote]} transition-all duration-300`} />
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0
          ${vote === 'High'     ? 'bg-red-100 text-red-700'    :
            vote === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'}`}>
          {vote}
        </span>
      </div>
    ))}

    <div className="flex gap-3 mt-2 pt-2 border-t border-purple-100 text-xs text-gray-500">
      <span>🔴 High: {tally.High}/5</span>
      <span>🟡 Moderate: {tally.Moderate}/5</span>
      <span>🟢 Low: {tally.Low}/5</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY_WEATHER = {
  main: { temp: null, feels_like: null, pressure: null, humidity: null },
  weather: [{ description: null, icon: null }],
  wind: { speed: null, deg: null },
  sys: { sunrise: null, sunset: null, country: null },
  visibility: null,
  clouds: { all: null },
  name: null,
};

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(EMPTY_WEATHER);
  const [ensembleResult, setEnsembleResult] = useState(null);
  const [cityName, setCityName]   = useState('');
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(false);

  const hasApiKey = Boolean(process.env.REACT_APP_OPENWEATHER_API_KEY?.trim());

  useEffect(() => {
    if (!cityName.trim()) {
      setWeatherData(EMPTY_WEATHER);
      setEnsembleResult(null);
      return;
    }

    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY?.trim();
    if (!apiKey) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('City not found');
        return res.json();
      })
      .then((weather) => {
        setWeatherData(weather);

        // Run ensemble voting with all available signals
        const result = ensembleVote({
          temp:      weather.main.temp,
          humidity:  weather.main.humidity,
          pressure:  weather.main.pressure,
          windSpeed: weather.wind.speed,
          clouds:    weather.clouds?.all ?? 0,
        });
        setEnsembleResult(result);
        setLoading(false);
      })
      .catch(() => {
        alert('City not found. Please enter a valid city name.');
        setLoading(false);
      });
  }, [cityName]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCityName(query);
  };

  const { main: { temp, pressure, humidity }, weather, wind: { speed }, sys: { sunrise, sunset, country }, visibility, name } = weatherData;
  const meta = ensembleResult ? PREDICTION_META[ensembleResult.prediction] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-2 sm:p-4 gap-3">

      {!hasApiKey && (
        <div className="w-full max-w-6xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow" role="status">
          <strong className="font-semibold">API key missing.</strong> Put your OpenWeatherMap key in{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">frontend/.env</code> as{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">REACT_APP_OPENWEATHER_API_KEY=…</code>, then restart{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">npm start</code>.
        </div>
      )}

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-6">

          {/* ── Left panel ── */}
          <div className="lg:col-span-1 bg-gray-50 p-4 lg:p-6 rounded-xl">
            <form onSubmit={handleSearch} className="mb-4 lg:mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-2 lg:p-3 pl-8 lg:pl-10 text-sm lg:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button type="submit" className="mt-3 w-full bg-blue-500 text-white py-2 lg:py-3 text-sm lg:text-base rounded-full hover:bg-blue-600 transition duration-300">
                Search
              </button>
            </form>

            {loading ? (
              <div className="flex justify-center items-center h-48 lg:h-64">
                <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-t-2 border-blue-500" />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl lg:text-7xl font-bold text-blue-600 mb-2 lg:mb-4">
                  {temp !== null ? `${temp}°C` : '--'}
                </div>

                {/* Ensemble result block */}
                {ensembleResult && meta && (
                  <div className="mt-2 mb-3 lg:mb-4 p-3 rounded-xl bg-purple-50 border border-purple-100 text-left">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs uppercase tracking-wide text-purple-500 font-semibold">Ensemble prediction</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${meta.badgeClass}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-sm lg:text-base text-purple-700 font-semibold">{meta.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{meta.reason}</p>

                    {/* Voting panel */}
                    <VotingPanel
                      votes={ensembleResult.votes}
                      tally={ensembleResult.tally}
                      confidence={ensembleResult.confidence}
                    />
                  </div>
                )}

                <div className="flex justify-center items-center gap-2 mb-2 lg:mb-4">
                  {weather[0].icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
                      alt={weather[0].description}
                      className="w-16 h-16 lg:w-20 lg:h-20"
                    />
                  )}
                  <span className="text-lg lg:text-xl font-semibold capitalize text-gray-600">
                    {weather[0].description || 'No data'}
                  </span>
                </div>

                <div className="text-base lg:text-lg font-medium text-gray-500">
                  {name || 'City'}, {country || 'Country'}
                </div>
                <div className="text-xs lg:text-sm text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right grid ── */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
            <WeatherCard icon={<Droplet className="w-full h-full text-blue-500" />}   title="Humidity"   value={`${humidity ?? '--'}%`}                          bgColor="bg-blue-50"   textColor="text-blue-500" />
            <WeatherCard icon={<Wind className="w-full h-full text-indigo-500" />}    title="Wind"       value={`${speed ?? '--'} km/h`}                          bgColor="bg-indigo-50" textColor="text-indigo-500" description={`${weatherData.wind.deg ?? '--'}°`} />
            <WeatherCard icon={<Eye className="w-full h-full text-green-500" />}      title="Visibility" value={`${visibility ? (visibility / 1000).toFixed(1) : '--'} km`} bgColor="bg-green-50"  textColor="text-green-500" />
            <WeatherCard icon={<CloudRain className="w-full h-full text-gray-500" />} title="Pressure"   value={`${pressure ?? '--'} hPa`}                        bgColor="bg-gray-50"   textColor="text-gray-500" />
            <WeatherCard icon={<Sunrise className="w-full h-full text-orange-500" />} title="Sunrise"    value={formatTime(sunrise)}                               bgColor="bg-orange-50" textColor="text-orange-500" />
            <WeatherCard icon={<Sunset className="w-full h-full text-pink-500" />}    title="Sunset"     value={formatTime(sunset)}                                bgColor="bg-pink-50"   textColor="text-pink-500" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;