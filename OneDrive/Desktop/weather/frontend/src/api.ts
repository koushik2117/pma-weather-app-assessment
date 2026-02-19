const API_KEY = 'e5fc8874aeb5c3f379872955c4c8d051'; // 🔑 Replace with your key
// Types
export interface WeatherData {
    cityName: string;
    country: string;
    current: CurrentWeather;
    hourly: HourlyItem[];
    daily: DailyItem[];
}

export interface CurrentWeather {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
}

export interface HourlyItem {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    pop: number; // Probability of precipitation
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
}

export interface DailyItem {
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
        day: number;
        min: number;
        max: number;
        night: number;
        eve: number;
        morn: number;
    };
    feels_like: {
        day: number;
        night: number;
        eve: number;
        morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    clouds: number;
    pop: number;
    uvi: number;
}


// Get weather by city name, zip code, or coords string
export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
    try {
        let lat, lon, name, country;

        // Check if input is coordinates (e.g. "40.7128, -74.0060")
        const coordMatch = city.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);

        if (coordMatch) {
            lat = parseFloat(coordMatch[1]);
            lon = parseFloat(coordMatch[3]);
            name = "Coordinates";
            country = "";
        } else {
            // Check if input might be a ZIP code (e.g. "10001" or "10001,US")
            const zipMatch = city.match(/^(\d{5})(?:,([a-zA-Z]{2}))?$/);

            if (zipMatch) {
                const zipCode = zipMatch[1];
                const countryCode = zipMatch[2] ? `,${zipMatch[2]}` : ',US'; // Default to US if not provided
                const geoResponse = await fetch(
                    `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode}${countryCode}&appid=${API_KEY}`
                );

                if (!geoResponse.ok) {
                    throw new Error('Zip code not found');
                }

                const geoData = await geoResponse.json();
                lat = geoData.lat;
                lon = geoData.lon;
                name = geoData.name;
                country = geoData.country;
            } else {
                // Otherwise treat as City name
                const geoResponse = await fetch(
                    `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
                );

                if (!geoResponse.ok) {
                    throw new Error('Failed to fetch city coordinates');
                }

                const geoData = await geoResponse.json();

                if (!geoData.length) {
                    throw new Error('City not found');
                }

                lat = geoData[0].lat;
                lon = geoData[0].lon;
                name = geoData[0].name;
                country = geoData[0].country;
            }
        }

        // 1. Fetch Current Weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        if (!currentResponse.ok) throw new Error('Failed to fetch current weather');
        const currentData = await currentResponse.json();

        // 2. Fetch Forecast Weather (3-hour steps)
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
        const forecastData = await forecastResponse.json();

        // Process forecast daily data (Approximation from 3-hour chunks)
        const dailyMap = new Map();
        forecastData.list.forEach((item: any) => {
            const dateStr = new Date(item.dt * 1000).toDateString();
            if (!dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, {
                    dt: item.dt,
                    temp: { min: item.main.temp_min, max: item.main.temp_max },
                    weather: item.weather
                });
            } else {
                const existing = dailyMap.get(dateStr);
                existing.temp.min = Math.min(existing.temp.min, item.main.temp_min);
                existing.temp.max = Math.max(existing.temp.max, item.main.temp_max);
            }
        });

        const daily = Array.from(dailyMap.values()).slice(0, 5);

        return {
            cityName: name,
            country: country,
            current: {
                ...currentData.main,
                dt: currentData.dt,
                wind_speed: currentData.wind.speed,
                weather: currentData.weather
            },
            hourly: forecastData.list.slice(0, 8),
            daily: daily,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error fetching weather: ${error.message}`);
        }
        throw new Error('Unknown error occurred');
    }
};

// Get weather by coordinates
export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
    try {
        // First, get city name from coordinates (reverse geocoding)
        const geoResponse = await fetch(
            `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.ok) {
            throw new Error('Failed to fetch location name');
        }

        const geoData = await geoResponse.json();

        // 1. Fetch Current Weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        if (!currentResponse.ok) throw new Error('Failed to fetch current weather');
        const currentData = await currentResponse.json();

        // 2. Fetch Forecast Weather (3-hour steps)
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
        const forecastData = await forecastResponse.json();

        // Process forecast daily data (Approximation from 3-hour chunks)
        const dailyMap = new Map();
        forecastData.list.forEach((item: any) => {
            const dateStr = new Date(item.dt * 1000).toDateString();
            if (!dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, {
                    dt: item.dt,
                    temp: { min: item.main.temp_min, max: item.main.temp_max },
                    weather: item.weather
                });
            } else {
                const existing = dailyMap.get(dateStr);
                existing.temp.min = Math.min(existing.temp.min, item.main.temp_min);
                existing.temp.max = Math.max(existing.temp.max, item.main.temp_max);
            }
        });

        const daily = Array.from(dailyMap.values()).slice(0, 5);

        return {
            cityName: geoData[0]?.name || 'Unknown',
            country: geoData[0]?.country || '',
            current: {
                ...currentData.main,
                dt: currentData.dt,
                wind_speed: currentData.wind.speed,
                weather: currentData.weather
            },
            hourly: forecastData.list.slice(0, 8),
            daily: daily,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error fetching weather: ${error.message}`);
        }
        throw new Error('Unknown error occurred');
    }
};

// Alternative: Get weather by city name using One Call API directly with city name
// (requires calling geocoding first internally)
export const getWeatherByCityName = async (city: string): Promise<WeatherData> => {
    return getWeatherByCity(city); // This is the same as above, just for clarity
};