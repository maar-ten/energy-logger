# energy-logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. The data that has been collected can be viewed in a dashboard.

# Installing InfluxDB
Install docker and then pull the InfluxDB image

```docker run --name influxdb -p 8086:8086 -d arm32v7/influxdb```

Then create a new database

```docker exec influxdb influx -execute 'create database dsmr'```

# Collecting data
To ensure the program runs after you left the shell use

```nohup node index.js &``` 

# Gitpod usage
When importing this project on Gitpod a docker image with InfluxDB will be dowloaded and started. Then create the database that will store the data 

```docker exec influxdb influx setup -f -u dsmr -p dsmrdsmr -o dsmr -b dsmr -r 0 -t dsmrdsmr```
