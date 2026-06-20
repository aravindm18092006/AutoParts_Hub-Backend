const dotenv = require("dotenv");
dotenv.config({ path: "./Config.env" });

const app = require("./index.js");

const PORT_NO = process.env.PORT || process.env.PORT_NO || 8000;

app.listen(PORT_NO, () => {
  console.log("Server is running on port", PORT_NO);
});
