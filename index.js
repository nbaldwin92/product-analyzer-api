const express = require('express');
const bodyParser = require('body-parser');

const scraper = require('./routes/api/scraper').rating;

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://ecommerce-product-analyzer.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('ACK');
});

app.get('/api/scraper', async (req, res) => {
  // Call servers

  const { url } = req.query;

  const score = await scraper(url);

  res.send(score.toString());

  // console.log(JSON.stringify(scraper));

  // res.send(safetyRating);

  // await res.send(
  //   scraper.rating(
  //     'https://www.ebay.com/itm/Dyson-DC39-Origin-Canister-Vacuum-Yellow-New/272647620945?_trkparms=pageci%3Abbb70dd5-2b1e-11e9-b85f-74dbd180d4f1%7Cparentrq%3Ac9d8e3561680a9c560ea5644ffccb79c%7Ciid%3A1#rwid'
  //   )
  // );
});

const port = process.env.PORT || 5000;

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
