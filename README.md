# energy-logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. The data that has been collected can be viewed in a dashboard.

# Getting started
To get going with this project you will need InfluxDB for datat storage and Grafan for dashboarding. The easiest way to get both up and running fast is to install docker on the Raspberry Pi and pull the images for these tools.

# Installing InfluxDB
```docker run --name influxdb -p 8086:8086 -d arm32v7/influxdb```

Then create a new database

```docker exec influxdb influx -execute 'create database dsmr'```

# Installing Grafana
```docker run -d --name=grafana -p 3000:3000 grafana/grafana```

# Start collecting data
To ensure the program runs after you left the shell use

```nohup node index.js &``` 

# Gitpod usage
When importing this project on Gitpod a docker image with InfluxDB will be dowloaded and started, which comes in handy when testing the program. After the image is started for the first time you need to create the database that will store the data 

```docker exec influxdb influx setup -f -u dsmr -p dsmrdsmr -o dsmr -b dsmr -r 0 -t dsmrdsmr```
