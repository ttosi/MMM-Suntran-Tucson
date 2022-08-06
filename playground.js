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
    days: [3, 1, 1, 1, 1, 1, 2],
    routeData: [],
    nextStopTimes: [],
    getNextStopTimes(data) {
        let index = -1;
        let sanityCheck = 0;

        while (index === -1) {
            index = this.routeData.findIndex(
                (row) =>
                    row[0] === data.route &&
                    row[1] === data.stop &&
                    row[2] === data.day &&
                    row[3] === data.time
            );
            data.time++;
            sanityCheck++;
            if (sanityCheck > 25) {
                return false;
            }
        }

        return this.routeData.slice(index, index + data.limit).map(r => {
            return {
                route: r[0],
                stop: r[1],
                time: r[3],
                headSign: r[4],
                stopName: r[5]
            }
        });
    },
    currentTime() {
        const now = new Date();
        const day = this.days[format(now, "i")];
        const time = parseInt(format(now, "HHmm"));

        if (this.shouldRun(day, time)) {
            return {
                day: day,
                time: time,
            };
        }
        return false;
    },
    shouldRun(day, time) {
        const days = ["week", "sat", "sun"]
        return (
            this.defaults[days[day - 1] + "StartTime"] < time &&
            this.defaults[days[day - 1] + "EndTime"] > time
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
            route_short_name, stop_id, service_id, departure_time, trip_headsign, stop_name
        FROM full_routes
        WHERE 
            route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
        AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
        ORDER BY route_short_name, stop_id, service_id, departure_time
    `);

    const meta = await db.all(`
        SELECT DISTINCT route_short_name AS route,
            trip_headsign as headSign, stop_id as stopId, stop_name AS stopName,
            stop_code as stopCode, route_color AS backgroundColor, route_text_color AS textColor
        FROM full_routes
        WHERE 
            route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
        AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
    `);

    rows.map((r) => {
        suntran.routeData.push([
            r.route_short_name,
            r.stop_id,
            r.service_id, // 1 = weekday, 2 = sat, 3 = sun
            r.departure_time,
            r.trip_headsign,
            r.stop_name
        ]);
    });

    if (suntran.currentTime()) {
        suntran.defaults.routes.forEach((r) => {
            suntran.nextStopTimes.push(suntran.getNextStopTimes({
                route: r.route,
                stop: r.stop,
                ...suntran.currentTime(),
                limit: suntran.defaults.limit
            }));
        })
    }

    console.log(meta);
    console.log(suntran.nextStopTimes);
})();
