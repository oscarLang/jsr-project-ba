var startOfMinute = require('date-fns/startOfMinute');
var startOfHour = require('date-fns/startOfHour');
var startOfDay = require('date-fns/startOfDay');
var subMinutes = require('date-fns/subMinutes');
var format = require('date-fns/format');
var faker = require('faker');

const objects = require("./models/objects");
const user = require("./models/user");
const mongo = require("mongodb").MongoClient;
const dsn = "mongodb://localhost:27017";
let dbName = 'project';
const existingTickers = [];
(async function(){
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    db.dropDatabase();
    await user.insertUser("test@test.com", "pass");

    const now = new Date();
    for (let j = 0; j < 15; j++) {
        const companyName = faker.company.companyName();
        const ticker = generateTicker(companyName);
        const catchPhrase = faker.company.catchPhrase();
        const ceo = faker.name.firstName() + " " + faker.name.lastName();
        const startPrice = getRandomInt(50, 200);
        const startAmount = getRandomInt(100000, 1000000000000);
        const volatility = (Math.random() * (0.01 - 0.005) + 0.005);
        const history = generateHistory(now, startPrice, volatility);
        await objects.insertObject(
            ticker,
            companyName,
            ceo,
            catchPhrase,
            startPrice,
            startAmount,
            volatility,
            history);
    }
    await client.close();

})();


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


function generateTicker(companyName) {
    let ticker = companyName.match(/[A-Z]/g).join("");;
    while (existingTickers.includes(ticker)) {
        ticker += getRandomInt(1,9);
    }
    existingTickers.push(ticker);
    return ticker;
}

function generateHistory(initDate, initPrice, volatility) {
    var price = initPrice;
    const minutly = [];
    const hourly = [];
    const daily = [];
    for(let i = 0; i < 43200 ; i++) {
        price = getNewPrice(price, volatility);
        const date = subMinutes(initDate, i);
        if (i < 60) {
            const minutlyDate = startOfMinute(date);
            minutly.push({
                date: minutlyDate,
                price: price});
        }
        if ((i % 60 === 0) && (i < 1440)) {
            const hourlyDate = startOfHour(date);
            hourly.push({
                date: hourlyDate,
                price: price});
        }
        if (i % 1440 === 0 ) {
            const dailyDate = startOfDay(date);
            daily.push({
                date: dailyDate,
                price: price});
        }

    }
    return {minutly: minutly, hourly: hourly, daily: daily};
}

function getNewPrice(old, volatility) {
    const random = Math.random();
    let changeInPercent = (2 * (volatility * random));
    if (old > 10 && changeInPercent > volatility) {
        changeInPercent -= (2 * volatility);
    }
    let change = old * changeInPercent;
    let newPrice = +old + +change;
    return parseFloat(newPrice).toFixed(5);
}
