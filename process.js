import fs from "fs";

const folders = fs.readdirSync("./data");

let data_files = [];
let stocks = [];

folders.forEach((folder) => {
   const f = fs.readdirSync("./data/" + folder);
   f.forEach((file) => {
      if (!stocks.some((stock) => stock === file)) {
         stocks.push(file);
         data_files.push("./data/" + folder + "/" + file);
      }
   });
});

let data = [];
data_files.forEach((file) => {
   let file_data = JSON.parse(fs.readFileSync(file));
   const ids = file_data.map((o) => o.timeStamp);
   file_data = file_data.filter(
      ({ id }, index) => !ids.includes(id, index + 1)
   );
   data.push(...file_data);
});

// fs.writeFileSync("./data.json", JSON.stringify(data));
console.log(data.length, stocks.length);
