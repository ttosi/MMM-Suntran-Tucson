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
        limit: 6,
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
    routeMeta: [],
    nextStopTimes: [],
    dbConn: undefined,
    // open sqlite database called suntran.db
    // from data folder
    async openDatabase() {
        this.dbConn = await sqlite.open({
            filename: "./data/suntran.db",
            driver: sqlite3.Database,
        });
    },
    async closeDatabase() {
        await this.dbConn.close();
    },
    // load rows from full_routes (a derived table)
    // filtered by routeid and stopid into memory
    async loadRouteData() {
        const rows = await this.dbConn.all(`
            SELECT
                route_short_name, stop_id, service_id, departure_time, trip_headsign, stop_name
            FROM full_routes
            WHERE 
                route_short_name IN (${this.defaults.routes.map(r => r.route)})
            AND stop_id IN (${this.defaults.routes.map(s => s.stop)})
            ORDER BY route_short_name, stop_id, service_id, departure_time
        `);

        // load route/stop data into memory
        rows.map((r) => {
            this.routeData.push([
                r.route_short_name,
                r.stop_id,
                r.service_id, // 1 = weekday, 2 = sat, 3 = sun
                r.departure_time,
                r.trip_headsign,
                r.stop_name
            ]);
        });
    },
    // get a row for each route/stop that will be
    // used for displaying on mirror
    //! refactor to not set data directly, should return values
    async loadRouteMetaData() {
        this.routeMeta = await this.dbConn.all(`
            SELECT DISTINCT route_short_name AS route,
                trip_headsign as headSign, stop_id as stopId, stop_name AS stopName,
                stop_code as stopCode, route_color AS backgroundColor, route_text_color AS textColor
            FROM full_routes
            WHERE 
                route_short_name IN (${this.defaults.routes.map(r => r.route)})
            AND stop_id IN (${this.defaults.routes.map(s => s.stop)})
        `);
    },
    // loop through routes and stop to get the next stop times
    //! refactor to not set data directly, should return values
    loadNextStopTimes() {
        if (this.currentTime()) {
            this.defaults.routes.forEach((r) => {
                this.nextStopTimes.push(this.findNextStopTimes({
                    route: r.route,
                    stop: r.stop,
                    ...this.currentTime(),
                    limit: this.defaults.limit
                }));
            })
        }
    },
    // given the current time, day, route and stops loop
    // until the next valid departure time is found
    // and return that row + limit (number of future
    // departure times)
    findNextStopTimes(data) {
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
                time: r[3],
                headSign: r[4],
                stopName: r[5]
            }
        });
    },
    // get the current time and day (day 
    // can be week = 1, sat = 2 or sun = 2
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
    // check if the current time is in between
    // startTimes (20 minutes before 1st bus) and 
    // endTimes (5 minutes after last bus) that
    // are configured in suntran.defaults
    //! TODO replace startTimes and endTimes with db query
    shouldRun(day, time) {
        const days = ["week", "sat", "sun"]
        return (
            this.defaults[days[day - 1] + "StartTime"] < time &&
            this.defaults[days[day - 1] + "EndTime"] > time
        );
    },
};

(async () => {
    // open sqlite database called suntran.db
    // from data folder
    // const db = await sqlite.open({
    //     filename: "./data/suntran.db",
    //     driver: sqlite3.Database,
    // });

    // // get rows from full_routes (a derived table)
    // // filtered by routeid and stopid
    // const rows = await db.all(`
    //     SELECT
    //         route_short_name, stop_id, service_id, departure_time, trip_headsign, stop_name
    //     FROM full_routes
    //     WHERE 
    //         route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
    //     AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
    //     ORDER BY route_short_name, stop_id, service_id, departure_time
    // `);

    // // get a row for each route/stop that will be
    // // used for displaying on mirror
    // const meta = await db.all(`
    //     SELECT DISTINCT route_short_name AS route,
    //         trip_headsign as headSign, stop_id as stopId, stop_name AS stopName,
    //         stop_code as stopCode, route_color AS backgroundColor, route_text_color AS textColor
    //     FROM full_routes
    //     WHERE 
    //         route_short_name IN (${suntran.defaults.routes.map(r => r.route)})
    //     AND stop_id IN (${suntran.defaults.routes.map(s => s.stop)})
    // `);

    // await db.close();
    await suntran.openDatabase();
    await suntran.loadRouteData();
    await suntran.loadRouteMetaData();
    await suntran.closeDatabase();
    suntran.loadNextStopTimes();
    // suntran.nextStopTimes = suntran.loadNextStopTimes();

    // // load the rows from db quesry into memory
    // rows.map((r) => {
    //     suntran.routeData.push([
    //         r.route_short_name,
    //         r.stop_id,
    //         r.service_id, // 1 = weekday, 2 = sat, 3 = sun
    //         r.departure_time,
    //         r.trip_headsign,
    //         r.stop_name
    //     ]);
    // });


    // if (suntran.currentTime()) {
    //     suntran.defaults.routes.forEach((r) => {
    //         suntran.nextStopTimes.push(suntran.findNextStopTimes({
    //             route: r.route,
    //             stop: r.stop,
    //             ...suntran.currentTime(),
    //             limit: suntran.defaults.limit
    //         }));
    //     })
    // }
    // console.log(suntran.routeData)
    // console.log(suntran.routeMeta);
    console.log(suntran.nextStopTimes);
})();
