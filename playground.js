// const fs = require("fs").promises;
// const csv = require("async-csv");
const sqlite3 = require("sqlite3")
const sqlite = require("sqlite");
const { format } = require("date-fns");

const suntran = {
    defaults: {
        routes: [
            { route: 4, stop: 11150 }
        ],
        limit: 5,
        weekStartTime: 500,
        weekEndTime: 2355,
        satStartTime: 615,
        satEndTime: 2135,
        sunStartTime: 730,
        sunEndTime: 2030,
        fadeSpeed: 4000,
        updateInterval: 60000
    },
    days: ["sun", "week", "week", "week", "week", "week", "sat"],
    routeData: [],
    nextStopTimes: [],
    getNextStopTimes(data) {
        let index = -1;
        while (index === -1) {
            index = this.routeData.findIndex(
                (row) =>
                    row[0] === data.route &&
                    row[1] === data.dir &&
                    row[2] === data.day &&
                    row[3] === data.time
            );
            data.time++;
        }

        return this.routeData.slice(index, index + data.limit);
    },
    currentTime() {
        const now = new Date()
        const day = this.days[format(now, "i")]
        const time = format(now, "HHmm")

        if (this.shouldRun(day, time)) {
            return {
                day: day,
                time: time
            }
        }
        return false;
    },
    shouldRun(day, time) {
        return (this.defaults[day + "StartTime"] < time &&
            this.defaults[day + "EndTime"] > time)
    }
};

(async () => {
    const db = await sqlite.open({
        filename: "./data/suntran.db",
        driver: sqlite3.Database
    });

    const rows = await db.all(`
        SELECT r.route_short_name, t.direction_id,
            st.departure_time, r.route_color,
            s.stop_id, s.stop_name
        FROM routes r
        JOIN trips t ON t.route_id = r.route_id
        JOIN stop_times st ON st.trip_id = t.trip_id
        JOIN stops s ON s.stop_id = st.stop_id
        WHERE r.route_short_name = ${suntran.defaults.routes[0].route}
        AND s.stop_id = ${suntran.defaults.routes[0].stop}
        ORDER BY st.departure_time
    `)

    // console.log(suntran.routeData)
    rows.map(r => {
        suntran.routeData.push(
            [ r.route_short_name, "west", "week", r.departure_time ]
        )
    });

    // console.log(suntran.routeData)

    // const file = await fs.readFile("./data/suntran-route-4.csv", "utf8");
    // suntran.routeData = await csv.parse(file, {
    //     cast: (val, ctx) => {
    //         if (ctx.index === 0 || ctx.index === 3) return Number(val)
    //         return val
    //     },
    // });

    if (suntran.currentTime()) {
        this.nextStopTimes = suntran.getNextStopTimes(
            {
                route: suntran.defaults.routes[0].route,
                dir: "west",
                // stop: suntran.defaults.routes[0].stop,
                ...suntran.currentTime(),
                limit: suntran.defaults.limit
            }
        )
    }

    console.log(this.nextStopTimes)
})();