import express from "express";

import csv from "csv-parser";
import fs from "fs";
let results = [];

const router = express.Router();

router.get("/", (req, res) => {
  results = [];
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  fs.createReadStream("./listings.csv")
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      res.send(results);
    });
});

export default router;
