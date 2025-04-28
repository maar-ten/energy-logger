# Energy Logger

This Docker application stack connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. 
The data that has been collected can then be viewed in a Grafana dashboard.

## Getting started
To get going with the project you will need NodeJS for running the DSMR client script, InfluxDB for data storage and Grafana for dashboarding.

The easiest way to get all that up and running fast is to use docker on a Raspberry Pi.

### 1. Set timezone
First you will have to set the timezone of the energy meter in a `.env` file. Take a look at the [list of timezone abbreviations](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) that you can use. Then run:

`echo TZ=your-timezone > .env`

If no timezone is set UTC will likely be used as default, which might cause time shifts in the data.

### 2. Install docker
`curl -sSL https://get.docker.com | sh`

### 4. Start collecting data
`docker compose up -d`

### 5. View the dashboard
Go to Grafana on [`http://localhost:3000`](`http://localhost:3000`).

To make changes to the dashboard you will have to login.
The username and password is `admin`.

## Architecture
There are 3 docker images that together make up the energy logger application.
- `influxdb` is a time series database that stores the data and can run data queries.
- `grafana` is an interactive data visualisation web application.
- `dsmr-client` is a NodeJS application that connects to the smart meter and sends the data to the database.

These images are specified in [docker-compose.yml](docker-compose.yml).

#### InfluxDB
InfluxDB is configured with 2 databases:
- `dsmr` contains data at 1 second resolution and has a retention policy of a week (168h)
- `dsmr_hourly` contains downsampled data at 1 hour resolution and it is kept forever

The configuration file for the database is [setup_influxdb.sh](./setup_influxdb.sh). This file is copied into the container when the image is build.

The database is stored in `/influx-data` if you don't change the location in the docker-compose.yml file.

#### Grafana
Grafana is configured with 2 data sources and a dashboard
- [datasources.yml](./grafana-provisioning/datasources/datasources.yml)
- [dashboards.yml](./grafana-provisioning/dashboards/dashboards.yml) (the config)
- [electriciteitsverbruikt.json](./dashboards/electriciteitsverbruik.json) (the dashboard json)

#### Dsmr client
This is a NodeJS application that I wrote myself. It connects via USB to the smart meter and collects the OBIS messages.

It parses the data from the message and sends it to InfluxDB. Data that it collects are:
- timestamp
- power usage (Watt)
- electricity used low rate (kW)
- electricity used normal rate (kW)

The entry point for the application is [dsmr-client/index.js](./dsmr-client/index.js).

## My setup
This application can run on a Raspberry Pi 2 Model B from 2015 with a A 900MHz quad-core ARM Cortex-A7 CPU and 1GB RAM and a 12GB memory card without any problems.

Because the amount of data gathered can become quite large so I store the Influx-data on an 8GB external USB thumb drive.

If you mount that drive to `/mnt/usb` you can change the volume mount in the docker-compose.yml file from `./influx-data` to `./mnt/usb/influx-data`.

## Troubleshooting
To check if everything works as expected you can take a look at the logs using `docker logs <imagename>`.

You can also see the data in InfluxDB using `docker exec -it influxdb sh` and then execute (one at a time):

```
> influx
> use dsmr
> precision rfc3339 // to see human readable times
> select * from dsmr limit 10
```

This should give you an idea what is working and what is not working correctly.