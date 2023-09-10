// Reference variables
var searchBtnEl = $("#searchBtn");
var searchCityEl = $("#searchCity");
var currentWeatherEl = $(".current-weather");
var fiveDayForcastEl = $(".five-day-forcast");
var recentCitiesList = $(".list-group");

// Global variables
var today = moment().format("MMMM Do");
var citiesArray = [];

// get city, add it to local storage array
function getCity(event) {
  var city = event.currentTarget.previousElementSibling.value;
  searchCityEl.val("");

  // error control
  if (city === "") {
    return;
  }
  // get cities local storage
  // if city (the key value) does not exist, make an empty slot in local storage
  if (!localStorage.getItem("city")) {
    localStorage.setItem("city", "[]");
  } else {
    // parse from the local storage
    citiesArray = JSON.parse(localStorage.getItem("city"));
  }

  // if local storage >, delete first item in array
  if (citiesArray.length >= 5) {
    citiesArray.shift();
  }

  // if city doesn't already exist in local storage, add it
  if (!citiesArray.includes(city)) {
    citiesArray.push(city);
  } else {
    console.log("its a repeat");
  }

  // set to local storage (stringify it)
  localStorage.setItem("city", JSON.stringify(citiesArray));

  makeRecentCities();
  getAPI(city);
}

// displays local storage
function makeRecentCities() {
  recentCitiesList.empty();
  var savedCities = JSON.parse(localStorage.getItem("city"));

  // error control
  if (savedCities === null) {
    console.log("nothing in local storage");
  } else {
    savedCities.forEach(function (cityItem) {
      var savedCityItems = $("<li>")
        .text(cityItem)
        .addClass(
          "list-group-item py-1 my-2 d-flex justify-content-center recent-cities-items"
        );

      recentCitiesList.append(savedCityItems);
    });
  }
}

// fetch current weather, weather forcast 5 days
function getAPI(city) {
  var city = city;
  console.log(city);
  var requestURL =
    "https://api.openweathermap.org/geo/1.0/direct?appid=f18de7fe10f46ccca13adc41b61d567d&q=" +
    city; // ? added a "s" to the end of http

  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;
      console.log(data);

      var url =
        "https://api.openweathermap.org/data/2.5/onecall?appid=9b35244b1b7b8578e6c231fd7654c186&units=imperial&lat=" +
        lat +
        "&lon=" +
        lon;

      fetch(url)
        .then(function (response2) {
          if (response2.ok) {
            return response2.json();
          } else {
            console.log("there's an error!");
          }
        })
        .then(function (data2) {
          console.log(data2);
          // prevents doubles
          currentWeatherEl.empty();
          fiveDayForcastEl.empty();

          var cityName = city.toUpperCase();
          var todayIcon =
            "http://openweathermap.org/img/wn/" +
            data2.current.weather[0].icon +
            "@2x.png";
          var todayTemp = "Temp: " + data2.current.temp + "°F";
          var todayWind = "Wind: " + data2.current.wind_speed + " MPH";
          var todayHumidity = "Humidity: " + data2.current.humidity + "%";
          var todayUVIndex = data2.current.uvi;

          // generate current weather card
          var cityHeading = $("<h2>")
            .text(cityName + " : " + today)
            .addClass("text-dark border-bottom border-dark");
          var iconPic = $("<img>").attr("src", todayIcon);
          // todo make uv index change class depending on its value
          // todo how to make a span for todayUVIndex
          var temp = $("<p>").text(todayTemp).addClass("text-dark mb-0");
          var wind = $("<p>").text(todayWind).addClass("text-dark mb-0");
          var humidity = $("<p>")
            .text(todayHumidity)
            .addClass("text-dark mb-0");
          var uvIndex = $("<p>").html(
            `UV Index: <span class="text-dark px-2 mb-0 ${setUVColor(
              todayUVIndex
            )}"> ${todayUVIndex} </span>`
          ); //.html let's you manipulate inline. `` back tics let you still use "" inside without conflict. $() lets you break from the back tics to add some js script

          currentWeatherEl.append(
            cityHeading,
            iconPic,
            temp,
            wind,
            humidity,
            uvIndex
          );

          // generate five day forcast cards
          // these are the index numbers for next five days
          var indexNumbers = ["1", "2", "3", "4", "5"];

          indexNumbers.forEach(function (indexNumber) {
            var forcastDate = moment(data2.daily[indexNumber].dt, "X").format(
              "M/D/YYYY"
            );
            var forcastIcon =
              "http://openweathermap.org/img/wn/" +
              data2.daily[indexNumber].weather[0].icon +
              "@2x.png";
            var forcastTemp =
              "Temp: " + data2.daily[indexNumber].temp.day + "°F";
            var forcastWind =
              "Wind: " + data2.daily[indexNumber].wind_speed + " MPH";
            var forcastHumidity =
              "Humidity: " + data2.daily[indexNumber].humidity + "%";

            var cardBodyEl = $("<div>").addClass(
              "card-body mt-3 mx-3 border border-dark bg-secondary w-20 h-100"
            );

            var dateCard = $("<h5>").text(forcastDate).addClass("card-title");
            var iconCard = $("<img>")
              .attr("src", forcastIcon)
              .addClass("card-text");
            var tempCard = $("<p>").text(forcastTemp).addClass("card-text");
            var windCard = $("<p>").text(forcastWind).addClass("card-text");
            var humidityCard = $("<p>")
              .text(forcastHumidity)
              .addClass("card-text");

            fiveDayForcastEl.addClass("card-deck text-white mb-3 text-center");
            fiveDayForcastEl.append(cardBodyEl);
            cardBodyEl.append(
              dateCard,
              iconCard,
              tempCard,
              windCard,
              humidityCard
            );
          });
        });
    });
}

// to add UV color class
function setUVColor(uvIndex) {
  if (uvIndex <= 2) {
    return "favorable";
  } else if (uvIndex <= 7) {
    return "moderate";
  } else {
    return "severe";
  }
}

searchBtnEl.on("click", getCity);
makeRecentCities();

// Make Recent Cities Clickable
var recentCitiesItemsArray = $("li");

recentCitiesItemsArray.each(function (i, city) {
  $(city).on("click", sendRecentCity);
  console.log("it clicked!");
});

function sendRecentCity(city) {
  var city = city.target.textContent;
  getAPI(city);
}