import { getWeatherByCity, getWeatherByCoords, WeatherData } from './api';
import React, { useEffect, useState } from 'react';
import { Search, MapPin, Navigation, Droplets, Wind, Thermometer, Sun, Moon, Cloud, CloudRain, Snowflake } from 'lucide-react';
import { format } from 'date-fns';

const WeatherIcon = ({ iconCode, className = "w-8 h-8" }: { iconCode: string, className?: string }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  return <img src={iconUrl} alt="Weather Icon" className={className} />;
};

const CurrentWeather: React.FC<{ data: WeatherData['current'], cityName: string, country: string }> = ({ data, cityName, country }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between transition-all hover:bg-white/15">
      <div className="flex flex-col mb-6 md:mb-0 w-full md:w-1/2">
        <h2 className="text-4xl font-bold tracking-tight mb-1">{cityName}{country ? `, ${country}` : ''}</h2>
        <p className="text-blue-200 text-lg capitalize">{data.weather[0]?.description}</p>
        <div className="flex items-center mt-6">
          <WeatherIcon iconCode={data.weather[0]?.icon} className="w-24 h-24 mr-4 filter drop-shadow-md object-contain" />
          <span className="text-7xl font-light">{Math.round(data.temp)}°C</span>
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="flex items-center space-x-3 bg-black/20 p-4 rounded-2xl">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-sm text-gray-300">Feels Like</p>
              <p className="text-xl font-semibold">{Math.round(data.feels_like)}°C</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-black/20 p-4 rounded-2xl">
            <Droplets className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-gray-300">Humidity</p>
              <p className="text-xl font-semibold">{data.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-black/20 p-4 rounded-2xl col-span-2">
            <Wind className="w-6 h-6 text-teal-300" />
            <div>
              <p className="text-sm text-gray-300">Wind Speed</p>
              <p className="text-xl font-semibold">{data.wind_speed} m/s</p>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner h-48 relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(cityName + (country ? `, ${country}` : ''))}&output=embed`}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const DaysForecast: React.FC<{ data: WeatherData['daily'] }> = ({ data }) => {
  return (
    <div className="mt-8 bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-white">
      <h3 className="text-2xl font-semibold mb-6 flex items-center">
        📅 5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.slice(0, 5).map((day) => (
          <div key={day.dt} className="flex flex-col items-center bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5 text-center">
            <p className="font-medium text-lg text-blue-100">{format(new Date(day.dt * 1000), 'EEE')}</p>
            <p className="text-sm text-gray-400 mb-2">{format(new Date(day.dt * 1000), 'MMM d')}</p>
            <WeatherIcon iconCode={day.weather[0]?.icon} className="w-16 h-16 drop-shadow-sm mb-2 object-contain" />
            <div className="flex justify-between w-full mt-2 font-semibold">
              <span className="text-orange-300">{Math.round(day.temp.max)}°</span>
              <span className="text-blue-300 ml-2">{Math.round(day.temp.min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchWeather = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError('');

    try {
      const data = await getWeatherByCity(query);
      setWeatherData(data);

      try {
        await fetch('http://localhost:5000/api/weather/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: query,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            temperatureData: data.current
          })
        });
      } catch (backendError) { }

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            setWeatherData(data);
            setCity(data.cityName);

            try {
              await fetch('http://localhost:5000/api/weather/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: data.cityName,
                  startDate: new Date().toISOString(),
                  endDate: new Date().toISOString(),
                  temperatureData: data.current
                })
              });
            } catch (ignored) { }

          } catch (e) {
            setError('Error fetching location weather');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Geolocation permission denied or unavailable');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported by this browser');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 font-sans">
      <div className="max-w-4xl mx-auto pt-10">

        {/* Header / Branding */}
        <div className="text-center mb-10 text-white flex flex-col items-center justify-center">
          <img src="/logo.png" alt="Weather App Logo" className="w-24 h-24 mb-4 drop-shadow-xl" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">Weather App</h1>
          <p className="text-blue-300">Get the latest weather for anywhere, anytime.</p>
        </div>

        {/* Search Bar section */}
        <div className="bg-white/10 backdrop-blur-md rounded-full shadow-lg p-2 mb-6 border border-white/20 flex items-center w-full max-w-2xl mx-auto relative z-10 transition-all focus-within:bg-white/15 focus-within:shadow-xl">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center pr-2">
            <Search className="text-blue-200 ml-4 w-6 h-6 flex-shrink-0" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Zip code, City, Landmarks..."
              disabled={loading}
              className="w-full bg-transparent text-white placeholder-blue-300/70 border-none outline-none px-4 py-3 text-lg focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="bg-blue-600 hover:bg-blue-500 transition shadow-md disabled:bg-slate-700/50 disabled:text-slate-400 text-white font-medium py-3 px-6 rounded-full whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGeolocation}
            disabled={loading}
            title="Use Current Location"
            className="ml-2 bg-slate-800/60 hover:bg-slate-700 p-3 rounded-full text-blue-300 transition-colors border border-white/10 shadow-inner"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Error Handling */}
        <div className={`transition-all duration-300 overflow-hidden ${error ? 'max-h-24 mb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-red-500/20 backdrop-blur border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl max-w-2xl mx-auto flex items-center shadow-lg">
            <span className="text-2xl mr-3">⚠️</span>
            <p className="text-lg text-red-100"><strong>Wait,</strong> {error}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out min-h-[400px]">
          {weatherData ? (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <CurrentWeather data={weatherData.current} cityName={weatherData.cityName} country={weatherData.country} />
              <DaysForecast data={weatherData.daily} />
            </div>
          ) : (
            <div className="text-center text-blue-200/50 text-xl font-light mt-20 p-10 border border-dashed border-blue-300/20 rounded-3xl max-w-2xl mx-auto backdrop-blur-sm bg-white/5">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              Enter a location above to see the weather exactly where you need it.
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-blue-200/60 pb-8 font-medium">
          <div className="max-w-3xl mx-auto p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
            <h4 className="text-xl text-white font-bold mb-3 border-b border-white/10 pb-2 inline-block">Product Manager Accelerator</h4>
            <p className="text-sm leading-relaxed text-blue-100/80 mb-4 text-justify md:text-center">
              The Product Manager Accelerator is a cutting-edge program designed to cultivate the next generation of high-impact product leaders.
              The intensive curriculum provides participants with an immersive, hands-on learning experience across core product management domains,
              including product strategy, market validation, agile execution, and go-to-market planning to drive innovation in today's fast-evolving tech landscape.
            </p>
            <p className="text-blue-300 font-semibold tracking-wide border-t border-white/10 pt-4 mt-2">
              Designed & Built by <span className="text-white">Desagani Sai Koushik</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;