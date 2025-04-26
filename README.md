# Energy Logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. 
The data that has been collected can be viewed in a Grafana dashboard.

## Getting started
To get going with the project you will need NodeJS for running the DSMR client script, InfluxDB for data storage and Grafana for dashboarding.
The easiest way to get all that up and running fast is to install docker on a Raspberry Pi and run the docker commands:

```curl -sSL https://get.docker.com | sh```

```docker build --no-cache=true -f Dockerfile-influxdb-dsmr -t influxdb-dsmr .```

```docker build --no-cache=true -f Dockerfile-dsmr-client -t dsmr-client .```

```docker compose up -d```

Go to Grafana on [`http://localhost:3000`](`http://localhost:3000`) and create the data sources for InfluxDB.

The default user and password is `admin`.

The url of the data source is `http://influxdb:8086`. 

The collected data is put in 2 databases:
- `dsmr` contains data by the second and it has a retention time of a week (168h)
- `dsmr_hourly` contains summerized data by the hour and data is kept there indefinitly.

NOTE: If you want to use the [`grafana-chart.json`](./grafana-chart.json) from this project, you will need to import it and then click refresh inside every chart to fix the data source not found warnings. This is due to the 

For more information about configuring the data source see [InfluxDB docs](https://docs.influxdata.com/influxdb/v1.8/tools/grafana/)

## Start collecting data
Data collection is started automatically when the dsmr client image is run.
