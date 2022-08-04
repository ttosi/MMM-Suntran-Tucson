const fs = require("fs").promises;
const csv = require("async-csv");
const { format } = require("date-fns");

const days = ["sun", "week", "week", "week", "week", "week", "sat"];

const suntran = {
    defaults: {
        updateInterval: 60000,
        fadeSpeed: 4000,
        weekStartTime: 500,
        weekEndTime: 2355,
        satStartTime: 615,
        satEndTime: 2135,
        sunStartTime: 730,
        sunEndTime: 2030
    },
    routeData: [],
    nextStopTimes(data) {
        let index = -1;
        while (index === -1) {
            index = this.routeData.findIndex(
                (row) =>
                    row[0] === data.route &&
                    row[1] === data.direction &&
                    row[2] === data.day &&
                    row[3] === data.time
            );
            data.time++;
        }
        return this.routeData.slice(index, index + limit);
    },
    currentTime() {
        const now = new Date()
        const day = days[format(now, "i")]
        const time = format(now, "HHmm")

        const canRun = (this.defaults[day + "StartTime"] < time &&
            this.defaults[day + "EndTime"] > time)

        if (canRun) {
            return {
                day: day,
                time: time
            }
        }
        return false;
    }
};

(async () => {
    const file = await fs.readFile("./data/suntran-route-4.csv", "utf8");
    suntran.routeData = await csv.parse(file, {
        cast: (val, ctx) => {
            if (ctx.index === 0 || ctx.index === 3) return Number(val)
            return val
        },
    });

    const run = suntran.currentTime()
    console.log(run)
    
    
    // suntran.nextStopTimes(
    //     { route: 4, dir: "west", ...suntran.currentTime() }
    // )
    // if(stopTimes) {
    //     console.log(stopTimes)
    // }
})();

// const bus = {
//     getNext: (route, direction, day, time, limit) => {
//         let index = -1;
//         while (index === -1) {
//             index = routeData.findIndex(
//                 (row) =>
//                     row[0] === route &&
//                     row[1] === direction &&
//                     row[2] === day &&
//                     row[3] === time
//             );
//             time++;
//         }
//         return routeData.slice(index, index + limit);
//     },
// };

// routeDataStream
//     .pipe(new CsvReader({ parseNumbers: true, trim: true }))
//     .on("data", (row) => {
//         routeData.push(row);
//     })
//     .on("end", () => {
//         const now = new Date();
//         console.log(now)
//         const days = ["sun", "week", "week", "week", "week", "week", "sat"];
//         const day = days[format(now, "i")];
//         const time = format(now, "Hm");
//         console.log(day, time)

//         console.log(bus.getNext(4, "west", day, time, 5));
//     });