# Energy Logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. 
The data that has been collected can be viewed in a Grafana dashboard.

## Getting started
To get going with the project you will need NodeJS for running the DSMR client script, InfluxDB for data storage and Grafana for dashboarding.

The easiest way to get all that up and running fast is to use docker on a Raspberry Pi.

### 1. Set timezone
First you will have to set the timezone of the energy meter in a `.env` file. Look here to see a [list of timezone abbreviations](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) that you can use. Then run:

`echo TZ=your-timezone > .env`

If no timezone is set UTC will likely be used as default, which might cause time shifts in the data.

### 2. Install docker
`curl -sSL https://get.docker.com | sh`

### 3. Build the images
`docker build --no-cache=true -f Dockerfile-influxdb-dsmr -t influxdb-dsmr .`

`docker build --no-cache=true -f Dockerfile-dsmr-client -t dsmr-client .`

### 4. Start collecting data
`docker compose up -d`

## Configure Grafana
Go to Grafana on [`http://localhost:3000`](`http://localhost:3000`).

The default user and password is `admin`.

### Create DSMR data source
Create a new InfluxDB data source and enter the values:
```
name : dsmr
url : http://influxdb:8086
database : dsmr
```

The collected DSMR data is put in 2 databases:
- `dsmr` contains data by the second and it has a retention time of a week (168h)
- `dsmr_hourly` contains summerized data by the hour and data is kept there indefinitly.

### Create the dashboard
NOTE: If you want to use the [`grafana-chart.json`](./grafana-chart.json) from this project, you will need to import it and then click refresh inside every chart to fix the data source not found warnings. This is due to the 

## Troubleshooting
To check if everything works as expected you can take a look at the logs using `docker logs <imagename>`.

You can also see the data in InfluxDB using `docker exec -it influxdb sh` and then execute (one at a time):

```
> influx
> use dsmr
> select * from dsmr limit 10
```

This should give you an idea what is working and what is not working correctly.