# Energy Logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. 
The data that has been collected can be viewed in a Grafana dashboard.

## Getting started
To get going with the project you will need NodeJS for running the DSMR client script, InfluxDB for data storage and Grafana for dashboarding.
The easiest way to get all that up and running fast is to install docker on the Raspberry Pi and run the docker commands

```curl -sSL https://get.docker.com | sh```

```docker build --no-cache=true -f Dockerfile-influxdb-dsmr -t influxdb-dsmr .```

```docker build --no-cache=true -f Dockerfile-dsmr-client -t dsmr-client .```

```docker-compose up -d```

Now you can login to Grafana with a web browser and create a data source for InfluxDB

```http://localhost:3000```

The default user and password is 'admin'

The url of the data source should be `http://influxdb:8086`. 
For more information about configuring the data source see [InfluxDB docs](https://docs.influxdata.com/influxdb/v1.8/tools/grafana/)

## Start collecting data
Start collecting data with a background process

```nohup node index.js &``` 
