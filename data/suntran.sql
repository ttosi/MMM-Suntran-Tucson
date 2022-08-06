-- stop data
SELECT
    route_short_name, stop_id,
    day, departure_time
FROM full_routes
WHERE
    route_short_name IN [4, 11]
    AND stop_id IN [11150, 11109, 10981, 11610 ]
ORDER BY
    route_short_name,
    stop_id,
    DAY,
    departure_time 
    
-- get stops meta data
SELECT
    DISTINCT route_short_name AS route, stop_name AS name,
    route_color AS color
FROM full_routes
WHERE
    route_short_name IN [4, 11]
    AND stop_id IN [11150, 11109, 10981, 11610 ] 

-- update db data
/*
UPDATE full_routes SET DAY = 'week' WHERE service_id = 1;
UPDATE full_routes SET DAY = 'sat' WHERE service_id = 2;
UPDATE full_routes SET DAY = 'sun' WHERE service_id = 3;
*/