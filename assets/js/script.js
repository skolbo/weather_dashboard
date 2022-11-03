localStorage.clear();

let weatherApiKey = "15cf1b6ee25d386085d1aff8a08b55f6";
let weatherApiRootUrl = "https://api.openweathermap.org";

function findCity() {
    var cityName = titleCase($("#cityName")[0].value.trim());

    var apiURL = weatherApiRootUrl + "/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + weatherApiKey;

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                $("#city-name")[0].textContent = cityName + " (" + moment().format('M/D/YYYY') + ")";

                $("#city-list").append('<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' + cityName);

                // get coordinates and cache in local storage
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                var latLonPair = lat.toString() + " " + lon.toString();
                localStorage.setItem(cityName, latLonPair);

            })
        } else {
            alert("Cannot find city!");
        }
    })
}

function getWeatherForCity(coordinates) {
    apiURL = weatherApiRootUrl + "/data/2.5/forecast?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&units=imperial&appid=" + weatherApiKey;
    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                renderCurrentWeather(data);
                renderFutureWeather(data);
            })
        }
    })
}

function renderCurrentWeather(data) {
    $(".results-panel").addClass("visible");
    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png";
    $("#temperature")[0].textContent = "Temperature: " + data.list[0].main.temp.toFixed(1) + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.list[0].main.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.list[0].wind.speed.toFixed(1) + " MPH";
}

function renderFutureWeather(data) {
    // for five day forecast
    for (var i = 0; i < 5; i++) {
        var futureWeather = {
            date: convertUnixTime(data.list[i + 1], i),
            icon: "http://openweathermap.org/img/wn/" + data.list[i + 1].weather[0].icon + "@2x.png",
            temp: data.list[i + 1].main.temp.toFixed(1),
            humidity: data.list[i + 1].main.humidity
        }

        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#temp-" + i;
        $(currentSelector)[0].textContent = "Temp: " + futureWeather.temp + " \u2109";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + futureWeather.humidity + "%";
    }
}

function titleCase(city) {
    var updatedCity = city.toLowerCase().split(" ");
    var returnedCity = "";
    for (var i = 0; i < updatedCity.length; i++) {
        updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
        returnedCity += " " + updatedCity[i];
    }
    return returnedCity;
}

function convertUnixTime(data) {
    const dateObject = new Date(data.dt * 1000);
    return (dateObject.toLocaleDateString());
}

$("#search-button").on("click", function (e) {
    e.preventDefault();
    findCity();
    $("form")[0].reset();
})

$(".city-list-box").on("click", ".city-name", function () {

    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";
    getWeatherForCity(coordinates);
})