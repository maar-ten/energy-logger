# energy-logger

This NodeJS program connects to an DSMR 5.0 compliant energy meter via the serial port and stores the data it receives in an InfluxDB database. The data that has been collected can be viewed in a dashboard.

# Gitpod usage
When importing this project on Gitpod a docker image with InfluxDB wille be dowloaded and started. The first time this is done you'll need to run a command to initialise the database that is used by this application. 

```docker exec influxdb influx setup -f -u dsmr -p dsmrdsmr -o dsmr -b dsmr -r 0 -t dsmrdsmr```
