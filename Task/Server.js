  const app = require("./index.js");
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config.env" });

  const PORT_NO = process.env.PORT_NO;

  app.listen(PORT_NO, () => {
    console.log("Server is running on port", PORT_NO);
  });
