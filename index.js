const { default: axios } = require("axios");
const express = require("express");
const redis = require("redis");
// const fetch = require("node-fetch");
const app = express();

const REDIS_PORT = 6379;

const redisClient = redis.createClient(REDIS_PORT);

redisClient.connect();
redisClient.on("connect", () => console.log("Redis connected"));

app.get("/repos/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    const cache = await redisClient.get(username);

    if (cache) {
      return res.json({ username: JSON.parse(cache) });
    }

    const resp = await axios.get(`https://api.github.com/users/${username}`);

    redisClient.set(username, JSON.stringify(resp.data));
    console.log(resp.data);

    return res.json({ username: resp.data });
  } catch (error) {
    res.json({ message: "something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server running");
});
