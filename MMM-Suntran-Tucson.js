// const fs = require("fs");
// const CsvReader = require("csv-reader");
// const { format } = require("date-fns");

// let routeDataStream = fs.createReadStream("./data/suntran-route-4.csv", "utf8");
// let routeData = [];

// const bus = {
//   getNext: (route, direction, day, time, limit) => {
//     let index = -1;
//     while (index === -1) {
//       index = routeData.findIndex(
//         (row) =>
//           row[0] === route &&
//           row[1] === direction &&
//           row[2] === day &&
//           row[3] === time
//       );
//       time++;
//     }
//     return routeData.slice(index, index + limit);
//   },
// };

// routeDataStream
//   .pipe(new CsvReader({ parseNumbers: true, trim: true }))
//   .on("data", (row) => {
//     routeData.push(row);
//   })
//   .on("end", () => {
//     const now = new Date();
//     console.log(now)
//     const days = ["sun", "week", "week", "week", "week", "week", "sat"];
//     const day = days[format(now, "i")];
//     const time = format(now, "Hm");
//     console.log(day, time)

//     console.log(bus.getNext(4, "west", day, time, 5));
//   });

//---------------------------

const routeCsvFile = "./data/suntran-routes.csv"
const days = ["sun", "week", "week", "week", "week", "week", "sat"];

Module.register("MMM-Suntran-Tucson", {
  defaults: {
    updateInterval: 60000,
    limit: 5,
    fadeSpeed: 4000,
    weekStartTime: 500,
    weekEndTime: 2355,
    satStartTime: 615,
    satEndTime: 2135,
    sunStartTime: 730,
    sunEndTime: 2030
  },
  routeData: [],
  async start() {
    Log.info("Starting module: " + this.name);

    // load route data from file into memory
    const csvData = await fs.readFile("./data/suntran-route-4.csv", "utf8");
    this.routeData = await csv.parse(csvData);
    
    const currentTimes = getRouteTimes()
  },
  async getRouteTimes(route, direction, day, time, limit) {

  },
  loaded: function (callback) { },
  getDom: function () { },
  notificationReceived: function (notification, payload, sender) { },
  socketNotificationReceived: function (notification, payload) { },
});
