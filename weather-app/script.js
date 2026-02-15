const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-btn');

const notFound = document.querySelector('.not-found');
const searchCity = document.querySelector('.search-city');
const weatherInfo = document.querySelector('.weather-info');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

// This will leak but it's a free key so it's fine
const apiKey = '3f9b65ece487708218f4df43804c5378';

// Initialize search city as active
searchCity.classList.add('active');

getBackgroundImage()

// Manage search bar and its visuals
searchButton.addEventListener('click', () => {
    const city = cityInput.value;
    if(city.trim() != ''){
        updateWeatherInfo(city)
        cityInput.value = ''
        cityInput.blur()
    }
})

// Add enter key searching
cityInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter'){
        const city = cityInput.value;
        if(city.trim() != '' && city.trim() != ''){
            updateWeatherInfo(city)
            cityInput.value = ''
            cityInput.blur()
        }
    }
})

// Change the bg depending on the time
function getBackgroundImage(){
    const now = new Date()
    const hours = now.getHours()
    if(hours >= 6 && hours < 18){
        document.body.style.background = "url('assets/bg-day.png')"
    } 
    else{
        document.body.style.background = "url('assets/bg-night.png')"
    }
}

// Change the bee gif depending on the weather
function getWeatherIcon(id){
    if(id <= 232) return 'thunder.gif'
    if(id <= 531) return 'rainy.gif'
    if(id <= 622) return 'snowy.gif'
    if(id <= 781) return 'windy.gif'
    else return 'sunny.gif'
}

function getCurrentDate(){
    const date = new Date()
    const options = { weekday: 'short', day: '2-digit', month: 'short' }
    return date.toLocaleDateString('en-FR', options)
}

// Handle the api part of the project
async function getFetchData(endPoint, city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`
    const response = await fetch(apiUrl)
    const json = await response.json()
    return json
}

// Outputs the correct weather data on the app
async function updateWeatherInfo(city){
    try {
        const weatherData = await getFetchData('weather', city)
        console.log('weatherData', weatherData)
        if(Number(weatherData.cod) !== 200){
            console.error('API returned error', weatherData)
            showDisplaySection(notFound)
            return
        }

        const {
            name: country,
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData

        countryTxt.textContent = country
        tempTxt.textContent = `${Math.round(temp)} °C`
        conditionTxt.textContent = main
        humidityValueTxt.textContent = `${humidity}%`
        windValueTxt.textContent = `${Math.round(speed * 3.6 * 100) / 100} km/h`

        weatherSummaryImg.src = `assets/` + getWeatherIcon(id)
        currentDateTxt.textContent = getCurrentDate()

        await updateForecastsInfo(city)
        showDisplaySection(weatherInfo)
    } catch(error) {
        showDisplaySection(notFound)
    }
}

// Outputs the correct forecast data on the app
async function updateForecastsInfo(city){
    const forecastsData = await getFetchData('forecast', city)
    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    if(!forecastsData || !forecastsData.list) return
    forecastItemsContainer.innerHTML = ''
    forecastsData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)){
            updateForecastItems(forecastWeather)
       }
    })
}

function updateForecastItems(forecastWeather){
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = forecastWeather

    const dateTaken = new Date(date)
    const dateOptions = { day: '2-digit', month: 'short' }

    const dateResult = dateTaken.toLocaleDateString('en-FR', dateOptions)

    const forecastItem =
                    `<div class="forecast-item">
                        <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                        <img src="assets/${getWeatherIcon(id)}" class="forecast-item-img">
                        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
                    </div>`

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaySection(section){
    [weatherInfo, searchCity, notFound].forEach(sec => {
        sec.classList.remove('active')
    })
    section.classList.add('active')
}
