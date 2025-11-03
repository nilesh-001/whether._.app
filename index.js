const apiKey = "c767b78fdb64c3258fe155a5a22c6f6d";
let globalForecastData = null;

const weatherIcons = {
  Clear: "icons/icon-sunny.webp",
  Clouds: "icons/icon-overcast.webp",
  Rain: "icons/icon-rain.webp",
  Snow: "icons/icon-snow.webp",
  Drizzle: "icons/icon-drizzle.webp",
  Thunderstorm: "icons/icon-storm.webp",
  Mist: "icons/icon-fog.webp",
  Smoke: "icons/icon-fog.webp",
  Haze: "icons/icon-fog.webp",
  Fog: "icons/icon-fog.webp"
};



const searchInput = document.getElementById("search");
const searchButton = document.querySelector(".search-button");
const unitSelect = document.getElementById("unitSelect");


const cityName = document.getElementById("city");
const countryName = document.getElementById("country");
const tempDisplay = document.getElementById("tem");
const feeslLike = document.getElementById("temp"); //
const humidityDisplay = document.getElementById("humidity");
const windDisplay = document.getElementById("wind");
const preci = document.getElementById("precipitation"); //
const iconImg = document.querySelector(".icon img");


const now = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const day = now.toLocaleDateString('en-IN', { weekday: 'long' });
const date = now.toLocaleDateString('en-IN', { month:'long', day: 'numeric'});
const year = now.toLocaleDateString('en-IN', { year: 'numeric'});
document.getElementById("day").textContent = day;
document.getElementById("date_month").textContent = date;
document.getElementById("year").textContent = year;


async function getWeather(city, unit) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    

    updateUI(data, unit);
    getWeeklyForecast(city, unit);

  } catch (error) {
    alert(error.message);
  }
}

async function getWeeklyForecast(city, unit) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);

    if(!response.ok) {
      throw new Error("City not found");
    }
    
    const data = await response.json();
    globalForecastData = data; // save forecast data for hourly use
    displayHourlyForecast(data); // show current day's hourly forecast


    const dailyData = {};
    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(item);
    });

    const days = Object.keys(dailyData).slice(0, 6);

    days.forEach((date, index) => {
      const temps = dailyData[date].map((i) => i.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const weather = dailyData[date][0].weather[0];
      const icon = weatherIcons[weather.main] || "icons/default.svg";

      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });


      document.getElementById(`day_${index + 1}`).textContent = dayName;
      document.getElementById(`weather_${index + 1}`).innerHTML = `<img src="${icon}" alt="${weather.main}" width="45">`;
      document.getElementById(`max_${index + 1}`).textContent = `${max.toFixed(1)}°`;
      document.getElementById(`min_${index + 1}`).textContent = `${min.toFixed(1)}°`;


    });
  }
  catch (err) {
    console.error("Error fetching forecast:", err);
  }
}



function displayHourlyForecast(data) {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = "<h3>Hourly Forecast</h3>";

  const next24Hours = data.list.slice(0, 8);

  next24Hours.forEach(item => {
    const time = new Date(item.dt_txt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const temp = `${Math.round(item.main.temp)}°C`;
    const weather = item.weather[0];
    const icon = weatherIcons[weather.main] || "icons/default.svg";

    const card = document.createElement("div");
    card.classList.add("hour-card");
    card.innerHTML = `
      <div class="hour-time">${time}</div>
      <img src="${icon}" alt="${weather.main}" width="35">
      <div class="hour-temp">${temp}</div>
    `;
    container.appendChild(card);
  });
}




function updateUI(data, unit) {
  const { name, sys, main, wind, weather } = data;

  cityName.textContent = name;
  countryName.textContent = getFullCountryName(sys.country);
  tempDisplay.textContent = `${Math.round(main.temp)}° ${getUnitSymbol(unit)}`;
  feeslLike.textContent = `${Math.round(main.feels_like)}° ${getUnitSymbol(unit)}`;
  humidityDisplay.textContent = `${main.humidity}%`;
  windDisplay.textContent = `${wind.speed} ${unit === "imperial" ? "mph" : "m/s"}`;

  const iconPath = weatherIcons[weather[0].main] || "icons/default.svg";
  iconImg.src = iconPath;


    let precipitation = "0 mm";
    if (data.rain && data.rain["1h"]) {
        precipitation = `Rain: ${data.rain["1h"]} mm`;
    }
    else if (data.snow && data.snow["1h"]) {
        precipitation = `Snow: ${data.snow["1h"]} mm`;
    }
    preci.textContent = `${precipitation}`;
}

function getUnitSymbol(unit) {
  if (unit === "metric") return "C";
  if (unit === "imperial") return "F";
  return "K";
}


searchButton.addEventListener("click", () => {
  const city = searchInput.value.trim();
  const unit = unitSelect.value;

  if (city === "" || unit === "units") {
    alert("Please enter a city and select a valid unit.");
    return;
  }

  getWeather(city, unit);
});

function getFullCountryName(countryCode) {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return regionNames.of(countryCode);
}


searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});


window.addEventListener("load", () => {
  getWeather("Delhi", "metric");
});

