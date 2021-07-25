# energy-logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. 
The data that has been collected can be viewed in a dashboard.

# Getting started
To get going with this project you will need InfluxDB for data storage and Grafana for dashboarding.
The easiest way to get both up and running fast is to install docker on the Raspberry Pi and run the docker compose command

```docker-compose up -d```

After that you will need to create a new InfluxDB database

```docker exec influxdb influx -execute 'create database dsmr'```

Now you can login to Grafana with a web browser and create a data source for InfluxDB

```http://localhost:3000```

The default user and password is 'admin'

The url of the data source should be `http://influxdb:8086`. 
For more information see [InfluxDB docs](https://docs.influxdata.com/influxdb/v1.8/tools/grafana/)

# Start collecting data
Start collecting data with a background process

```nohup node index.js &``` 

# Gitpod usage
When importing this project on [Gitpod](https://gitpod.io/#https://github.com/maar-ten/energy-logger) a docker image with InfluxDB will be dowloaded and started, which might come in handy when testing the program. After the image is started for the first time you need to create the database that will store the data. 
See [getting started](#Getting-started) for more information.
