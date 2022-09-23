// Module.register("MMM-Suntran-Tucson", {
  
//     defaults: {
//       fadeSpeed: 4000,
//       updateInterval: 60000,
//       limit: 5,
//       weekStartTime: 500,
//       weekEndTime: 2355,
//       satStartTime: 615,
//       satEndTime: 2135,
//       sunStartTime: 730,
//       sunEndTime: 2030
//     },
//     routeData: [],
//     nextStopTimes: [],
//     days: ["sun", "week", "week", "week", "week", "week", "sat"],
//     async start() {
//       Log.info("Starting module: " + this.name);
  
//       // load route data from file into memory
//       const csvData = await fs.readFile("./data/suntran-route-4.csv", "utf8");
//       this.routeData = await csv.parse(csvData);
      
//       const currentTimes = getRouteTimes()
//     },
//     loaded: function (callback) { },
//     getDom: function () { },
//     notificationReceived: function (notification, payload, sender) { },
//     socketNotificationReceived: function (notification, payload) { },
//   });
  