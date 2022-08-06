-- get stops data
SELECT
    route_short_name, stop_id,
    service_id, departure_time
FROM full_routes
WHERE
    route_short_name IN [4, 11]
    AND stop_id IN [11150, 11109, 10981, 11610 ]
ORDER BY
    route_short_name,
    stop_id,
    service_id,
    departure_time 
    
-- get stops meta data
SELECT
    DISTINCT route_short_name AS route, stop_name AS name,
    route_color AS color
FROM full_routes
WHERE
    route_short_name IN [4, 11]
    AND stop_id IN [11150, 11109, 10981, 11610 ] 

-- create full_routes table
DROP TABLE IF EXISTS full_routes;
CREATE TABLE full_routes AS
SELECT
	r.route_short_name, r.route_text_color, r.route_color,
	t.direction_id, t.trip_headsign, c.service_id,
	replace(substr(st.arrival_time, 1, length(st.arrival_time) - 2), ":", "") as arrival_time,
	replace(substr(st.departure_time, 1, length(st.departure_time) - 2), ":", "") as departure_time,
	st.arrival_time, st.departure_time, s.stop_id, s.stop_code, s.stop_name
FROM routes r
JOIN trips t ON t.route_id = r.route_id
JOIN calendar c ON c.service_id = t.service_id
JOIN stop_times st ON st.trip_id = t.trip_id
join stops s on s.stop_id = st.stop_id;
