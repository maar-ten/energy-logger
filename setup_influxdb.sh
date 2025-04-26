# This setup script should be run once when the influxdb container is started (see the Dockerfile)

# create databases
influx -execute 'CREATE DATABASE dsmr WITH DURATION 7d REPLICATION 1'
influx -execute 'CREATE DATABASE dsmr_hourly'

# create continuous query for downsampling dsmr by the hour
influx -execute 'CREATE CONTINUOUS QUERY sample_by_hour ON dsmr BEGIN SELECT min(receivedTariff1) AS receivedTariff1_min, max(receivedTariff1) AS receivedTariff1_max, min(receivedTariff2) AS receivedTariff2_min, max(receivedTariff2) AS receivedTariff2_max, mean(power) INTO dsmr_hourly.autogen.dsmr_hourly FROM dsmr.autogen.dsmr GROUP BY time(1h) END' 
