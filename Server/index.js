import express from "express";
import bodyParser from "body-parser";

import listingsRoutes from "./routes/csvListings.js";
import contactsRoutes from "./routes/csvContacts.js";
const app = express();

const PORT = 5000;

app.use(bodyParser.json());

app.use("/listings", listingsRoutes);
app.use("/contacts", contactsRoutes);

app.get("/", (req, res) => {
  res.send("");
});

app.listen(PORT, () => {
  console.log(`server running on port: http://localhost:${PORT}`);
});
