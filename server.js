const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(
    express.json({
        limit: '1mb',
    })
);

// Generate latitudes and longitudes
locations = [];
const makeLocations = (from, to, fixed) => {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
};

for (i = 0; i < 100; i++) {
    locations.push({
        [i]: {
            latitude: makeLocations(-180, 180, 7),
            longitude: makeLocations(-180, 180, 7),
        },
    });
}


// Create database
const database = new Datastore('database.db');
database.loadDatabase();

// Remove previous records from database
database.remove({}, {
    multi: true
}, function (err, numRemoved) {});




// Get data from the API and send to database
let j = 1;

function connectApi() {
    setTimeout(function () {
        const api_url = `https://api.sunrise-sunset.org/json?lat=${locations[j][j].latitude}&lng=${locations[j][j].latitude}&formatted=0`;
        fetch(api_url).then(data => data.json())
            .then(data => {
                if (data.results.day_length > 0) {
                    database.insert(data.results)

                }
            }).catch((err) => {
                console.error(err);
            })
        j++;
        if (j < locations.length) {
            connectApi();
        }
    }, 200)
}

connectApi();

// Send data to the website
app.get('/api', (request, response) => {
    database
        .find({})
        .sort({
            sunrise: 1,
        })
        .exec(function (err, data) {
            if (err) {
                response.end();
                return;
            }
            response.json(data);
        });
});















// app.get('/data', async (request, response) => {
//     const api_url = `https://api.sunrise-sunset.org/json?lat=${locations[1][1].latitude}&lng=${locations[0][0].latitude}`;
//     const fetch_response = await fetch(api_url);
//     const json = await fetch_response.json();
//     const data_insert = JSON.stringify(locations[0]) + json.results.sunrise;
//     database.insert(data_insert);
//     response.json(json);

// });

// app.post('/api', (request, response) => {
//     const data = request.body;
//     const timestamp = Date.now();
//     data.timestamp = timestamp;
//     database.insert(data);
//     response.json({
//         data,
//     });
// });



// app.get('/api', (request, response) => {
//     database
//         .find({})
//         .sort({
//             mood: 1,
//         })
//         .exec(function (err, data) {
//             if (err) {
//                 response.end();
//                 return;
//             }
//             response.json(data);
//         });
// });