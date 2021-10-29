# Jsramverk project backend

Backend for project in JSRamverk course. A REST API using Nodejs and Express. Feautures authenticating of a user, listing stocks and buying and selling stocks.

Everything is saved in MongoDb documents, which was used as I saw it as a good fit for storing the stocks. The documents are expected to be used as is when fetched from the API.

The API uses JWT token for authenticating users. The token is saved in a coookie and sent with each request. I choose this solution as it is quite simple and quite robust. 

## Requirements
MonbgoDb instance on port 27017. Can be installed through the offical [documentation](https://docs.mongodb.com/manual/installation/)

## Setup

`npm install`

`EXPORT JWT_SECRET="NOT_A_GOOD_SECRET`

`npm start run`

Optionally run `node populate_db.js` to init db with random stocks from Faker.js.

Port: 1338

