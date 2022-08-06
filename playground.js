// const fs = require("fs").promises;
// const csv = require("async-csv");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const { format } = require("date-fns");

const suntran = {
    defaults: {
        routes: [
            { route: 4, stop: 11150 },
            { route: 4, stop: 11190 },
            { route: 11, stop: 10981 },
            { route: 11, stop: 11610 }
        ],
        limit: 5,
        weekStartTime: 500,
        weekEndTime: 2355,
        satStartTime: 615,
        satEndTime: 2135,
        sunStartTime: 730,
        sunEndTime: 2030,
        fadeSpeed: 4000,
        updateInterval: 60000,
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
                    row[1] === data.stop &&
                    row[2] === data.day &&
                    row[3] === data.time
            );
            data.time++;
        }

        return this.routeData.slice(index, index + data.limit).map(r => {
            return {
                route: r[0],
                stop: r[1],
                time: r[3]
            }
        });
    },
    currentTime() {
        const now = new Date();
        const day = this.days[format(now, "i")];
        const time = format(now, "HHmm");

        if (this.shouldRun(day, time)) {
            return {
                day: day,
                time: time,
            };
        }
        return false;
    },
    shouldRun(day, time) {
        return (
            this.defaults[day + "StartTime"] < time &&
            this.defaults[day + "EndTime"] > time
        );
    },
};

(async () => {
    const db = await sqlite.open({
        filename: "./data/suntran.db",
        driver: sqlite3.Database,
    });

    const rows = await db.all(`
        SELECT
            route_short_name, stop_id, day, departure_time
        FROM full_routes
        WHERE 
            route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
        AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
        ORDER BY route_short_name, stop_id, day, departure_time
    `);

    const meta = await db.all(`
        SELECT DISTINCT
            route_short_name AS route,
            stop_name AS name,
            route_color AS color
        FROM full_routes
        WHERE 
            route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
        AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
    `);

    console.log(meta);

    rows.map((r) => {
        suntran.routeData.push([
            r.route_short_name,
            r.stop_id,
            r.day,
            r.departure_time,
        ]);
    });


    if (suntran.currentTime()) {
        suntran.defaults.routes.forEach((r, index) => {
            suntran.nextStopTimes.push(suntran.getNextStopTimes({
                route: r.route,
                stop: r.stop,
                ...suntran.currentTime(),
                limit: suntran.defaults.limit
            }));
        })
    }

    console.log(suntran.nextStopTimes);
})();
