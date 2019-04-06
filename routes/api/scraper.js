/* eslint-disable no-use-before-define */

const Nightmare = require('nightmare');
const cheerio = require('cheerio');
// Seller Feedback
//  "https://feedback.ebay.com/ws/eBayISAPI.dll?ViewFeedback2&ftab=AllFeedback&userid=jamestronix&iid=-1&de=off&interval=0&searchInterval=30&items=200&searchInterval=30";

// Product Reviews
// https://www.ebay.com/itm/Dyson-DC39-Origin-Canister-Vacuum-Yellow-New/272647620945?_trkparms=pageci%3Abbb70dd5-2b1e-11e9-b85f-74dbd180d4f1%7Cparentrq%3Ac9d8e3561680a9c560ea5644ffccb79c%7Ciid%3A1#rwid

const flags = ['the', 'fraud', 'corrupt', 'fraudulent', 'sjf'];
const rating = async url => {
  const result = [];
  const nightmare = new Nightmare({ show: false });
  const link = url;
  if (url.includes('ebay')) {
    await nightmare
      .goto(link)
      .click('.reviews-header .sar-btn')
      .wait('.review-item-content')
      .evaluate(() => document.querySelector('body').innerHTML)
      .end()
      .then(async response => {
        const reviews = await getEbayProductReviews(response);
        const safetyRating = await scamAlgorithm(reviews, flags);
        result.push(safetyRating);
      })
      .catch(err => {
        'NOAH GOT AN ERROR';
      });
  } else if (url.includes('amazon')) {
    await nightmare
      .goto(link)
      .click('a.a-link-emphasis')
      .wait('.review-text-content')
      .evaluate(() => document.querySelector('body').innerHTML)
      .end()
      .then(async response => {
        const reviews = await getAmazonProductReviews(response);
        const safetyRating = await scamAlgorithm(reviews, flags);
        result.push(safetyRating);
      })
      .catch(err => {
        'ERROR';
      });
  } else {
    return;
  }
  return result;
};

//   nightmare //Ebay Seller Reviews
//     .goto(url)
//     .wait("body")
//     .evaluate(() => document.querySelector("body").innerHTML)
//     .end()
//     .then(response => {
//       console.log(getEbaySellerReviews(response));
//     })
//     .catch(err => {
//       console.log(err);
//     });
// } else {
//   console.log("not working");
// }

// Add getAmazonData

// const getEbaySellerReviews = html => {
//   // Seller reviews (max 200 per page)
//   const productData = [];
//   const $ = cheerio.load(html);
//   $('tr.bot')
//     .next('tr')
//     .children(':first-child')
//     .next('td')
//     .each((i, elem) => {
//       productData.push({
//         content: $(elem).text(),
//       });
//     });
//   return productData;
// };

const getEbayProductReviews = html => {
  const productData = [];
  const $ = cheerio.load(html);
  $('.review-item-content').each((i, elem) => {
    productData.push($(elem).text());
  });
  return productData;
};

const getAmazonProductReviews = html => {
  const productData = [];
  const $ = cheerio.load(html);
  $('.review-text-content').each((i, elem) => {
    productData.push($(elem).text());
  });
  return productData;
};

const scamAlgorithm = (reviews, spamWords) => {
  let strikes = 0;
  let safetyRating = 100;
  for (let i = 0; i < spamWords.length; i += 1) {
    for (let j = 0; j < reviews.length; j += 1) {
      if (reviews[j].includes(spamWords[i])) {
        strikes += 1;
      }
    }
  }
  if (strikes > 0 && strikes <= 3) {
    safetyRating -= 25;
  }
  if (strikes > 3 && strikes < 10) {
    safetyRating -= 50;
  }
  if (strikes >= 10) {
    safetyRating -= 100;
  }
  return safetyRating;
};

// TODO Future: If price is way below average for that product, likely scam

module.exports.rating = rating;
