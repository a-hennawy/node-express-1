const express = require("express");
const app = express();
const axios = require("axios");
const ExpressError = require("./expressError");

app.use(express.json());
app.post("/", async function (req, res, next) {
  try {
    let results = await Promise.all(
      req.body.developers.map(async (d) => {
        try {
          const resp = await axios.get(`https://api.github.com/users/${d}`);
          if (resp.status === 404) throw new ExpressError("Not Found", 404);
          return resp.data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            throw new ExpressError(`User ${d} NOT FOUND`, 404);
          } else {
            throw new ExpressError("Failed to fetch data from Github", 500);
          }
        }
      })
    );
    let out = results.map((r) => ({ name: r.name, bio: r.bio }));
    return res.json(out);
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  const notFoundError = new ExpressError("Not Found", 404);
  return next(notFoundError);
});

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

app.listen(3000, () => {
  console.log("Running app on port 3000");
});
