//const { json } = require('express');
const express = require('express');

const request = require('request');
const fs = require('fs');

// const s = require('country-json'); // neatrod, lai gan esmu instalējis 
const raw_capital_cities = fs.readFileSync('country-by-capital-city.json'); // tapec panemu vajadzeigo failu
const capital_cities = JSON.parse(raw_capital_cities);

const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getXlsxStream } = require('xlstream');
const app = express();

app.get('/', function (req, res) {
    res.send('Hello, World!');
});

// First task
app.get('/btc', function (req, res) {
           
    request('https://api.coindesk.com/v1/bpi/currentprice.json', {json: true}, function(err, response, body) {
        if (err) throw err

            let bpi_value = JSON.stringify(body.bpi.EUR.rate_float);
            res.send(`Price of BTC is ${bpi_value} EUR`);
        });
});      

// Second task
// ir valstis, kuram ir vairāki vārdi ar lielo burtu un citi ar mazo. tā ir problema
app.get('/capital', function (req, res) {
   
    let country = req.query.country;
    let countryCap = country.charAt(0).toUpperCase() + country.slice(1);
    let found = 0;

    capital_cities.forEach((e, key) => {
        if(capital_cities[key].country == countryCap){
            found = 1;    
            res.send(`Capital of ${capital_cities[key].country} is ${capital_cities[key].city}`);
        }
    });
        if(!found)
            res.send(`Capital of ${countryCap} not found`);
        
});



//Third task
app.get('/excel-sum', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/excel-sum', upload.single('myfile'), function (req, res) {
   
    var sum = 0;
    let file = req.file.path;
    
    (async () => {
        
        const excel = await getXlsxStream({
            filePath: file,
            sheet: 0,
        });
        
        excel.on('data', (x) => {            
            sum = sum + Number(x.formatted.obj.A);
        }).on('end', () => {
            const total_sum = JSON.stringify(sum);
            res.send(`SUM is ${total_sum}`);
            res.end();
        });
    })(); 
})

app.listen(3000, () => console.log(`started in port 3000!`))