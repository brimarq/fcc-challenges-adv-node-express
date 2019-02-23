require('dotenv').config() // Comment-out this line on Glitch

module.exports = function (app) {
  /** CORRECTS fCC TESTS FAILING for "Registration of New Users" challenge (as of 2/22/2019)
   * Tests not run asynchronously? Set ENABLE_DELAYS=true in .env to enable. 
   * See issue: https://github.com/freeCodeCamp/freeCodeCamp/issues/17820#issue-338363681
   */
  if (process.env.ENABLE_DELAYS) app.use((req, res, next) => {
    switch (req.method) {
      case 'GET':
        switch (req.url) {
          case '/logout': return setTimeout(() => next(), 500);
          case '/profile': return setTimeout(() => next(), 700);
          default: next();
        }
      break;
      case 'POST':
        switch (req.url) {
          case '/login': return setTimeout(() => next(), 900);
          default: next();
        }
      break;
      default: next();
    }
  });
};