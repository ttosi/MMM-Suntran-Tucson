const fs = require("fs");
const CsvReader = require("csv-reader");
const { format } = require("date-fns");

let routeDataStream = fs.createReadStream("./data/suntran-route-4.csv", "utf8");
let routeData = [];

const bus = {
  getNext: (route, direction, day, time, period, limit) => {
    let index = -1;
    while (index === -1) {
      index = routeData.findIndex(
        (row) =>
          row[0] === route &&
          row[1] === direction &&
          row[2] === day &&
          row[3] === time &&
          row[4] === period
      );
      time++;
    }
    return routeData.slice(index, index + limit);
  },
};

routeDataStream
  .pipe(new CsvReader({ parseNumbers: true, trim: true }))
  .on("data", (row) => {
    routeData.push(row);
  })
  .on("end", () => {
    const now = new Date();
    console.log(now)
    const days = ["sun", "week", "week", "week", "week", "week", "sat"];
    const day = days[format(now, "i")];
    const time = format(now, "Hm");
    console.log(day, time)
    
    console.log(bus.getNext(4, "east", day, time, "pm", 5));
  });

// Module.register("MMM-Suntran-Tucson", {
//   defaults: {
//     routes: [4, 11],
//     updateInterval: 1000 * 60 * 1,
//     fadeSpeed: 4000
//   },
//   start: function () {},
//   getRouteTimes(route, direction, limit) {},
//   loaded: function (callback) {},
//   getDom: function () {},
//   getScripts: function () {
//     return [];
//   },
//   notificationReceived: function (notification, payload, sender) {},
//   socketNotificationReceived: function (notification, payload) {},
// });
