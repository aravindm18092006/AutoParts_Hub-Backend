const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "Data.json");
const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

exports.getAll = (req, res) => {
  res.status(200).json({
    status: "success",
    data: jsonData,
  });
};
exports.getDataById = (req, res) => {
  const id = req.params.id;
  const title = req.params.title;
  const dataItem = jsonData.find((item) => item.title === title);

   if (!dataItem) {
    return res.status(404).json({
      status: "fail",
      message: "Not found",
    });
  } 
  res.status(200).json({
    status: "success",
    data: dataItem,
  });
};
