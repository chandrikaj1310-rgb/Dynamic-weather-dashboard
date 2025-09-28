const apiKey = "c807da17319a3c8731e4bf118bfd34af"; // 🔑 Replace with your OpenWeatherMap API key
let map, marker;

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    // Fetch current weather
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    if (weatherData.cod !== 200) throw new Error(weatherData.message);

    // Update current weather card
    document.getElementById("cityName").innerText = `${weatherData.name}, ${weatherData.sys.country}`;
    document.getElementById("temperature").innerText = `${weatherData.main.temp} °C`;
    document.getElementById("feelsLike").innerText = `Feels like: ${weatherData.main.feels_like} °C`;
    document.getElementById("description").innerText = weatherData.weather[0].description.toUpperCase();
    document.getElementById("minMax").innerText = `Min: ${weatherData.main.temp_min} °C | Max: ${weatherData.main.temp_max} °C`;
    document.getElementById("humidity").innerText = `Humidity: ${weatherData.main.humidity}%`;
    document.getElementById("wind").innerText = `Wind: ${weatherData.wind.speed} m/s`;

    const iconCode = weatherData.weather[0].icon;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weatherCard").classList.remove("hidden");

    // Fetch 5-day forecast
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";
    const daily = {};

    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!daily[date] && item.dt_txt.includes("12:00:00")) {
        daily[date] = item;
      }
    });

    const today = new Date().toISOString().split("T")[0]; // current date

    Object.values(daily).slice(0, 5).forEach((day) => {
      const div = document.createElement("div");
      div.classList.add("forecast-day");

      // Highlight current day
      if (day.dt_txt.split(" ")[0] === today) {
        div.classList.add("current-day");
      }

      div.innerHTML = `
        <p><b>${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</b></p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="icon">
        <p>${day.main.temp} °C</p>
        <p>${day.weather[0].main}</p>
      `;
      forecastContainer.appendChild(div);
    });

    document.getElementById("forecastTitle").classList.remove("hidden");
    document.getElementById("forecast").classList.remove("hidden");

    // Map
    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;

    document.getElementById("mapContainer").classList.remove("hidden");
    document.getElementById("mapTitle").classList.remove("hidden");

    if (!map) {
      map = L.map("map").setView([lat, lon], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);
      marker = L.marker([lat, lon]).addTo(map);
    } else {
      map.setView([lat, lon], 10);
      marker.setLatLng([lat, lon]);
    }

    setTimeout(() => { map.invalidateSize(); }, 200);

    // Dynamic background
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    if (weatherMain.includes("cloud")) {
      document.body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
    } else if (weatherMain.includes("rain")) {
      document.body.style.background = "linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)";
    } else if (weatherMain.includes("clear")) {
      document.body.style.background = "linear-gradient(to right, #56ccf2, #2f80ed)";
    } else if (weatherMain.includes("snow")) {
      document.body.style.background = "linear-gradient(to right, #e6dada, #274046)";
    } else {
      document.body.style.background = "linear-gradient(to right, #83a4d4, #b6fbff)";
    }

  } catch (error) {
    alert(error.message);
  }
}
