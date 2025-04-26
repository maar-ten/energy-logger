const http = require('http');

const influxdbHost = process.env.INFLUXDB_HOST || 'http://localhost';
const influxdbPort = process.env.INFLUXDB_PORT || 8086;

// Function to check InfluxDB status using Promises
function checkInfluxDBStatus(maxRetries, delay) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const makeRequest = () => {
      const options = {
        hostname: influxdbHost,
        port: influxdbPort,
        path: '/ping',
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 204) {
          console.log('InfluxDB instance is accepting requests.');
          resolve(true); // Resolve the Promise successfully
        } else {
          console.log(`Unexpected response: ${res.statusCode}`);
          retry();
        }
      });

      req.on('error', (error) => {
        console.error(`Attempt ${attempt + 1}: Error connecting to InfluxDB - ${error.message}`);
        retry();
      });

      req.end();
    };

    const retry = () => {
      attempt++;
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay} ms...`);
        setTimeout(makeRequest, delay);
      } else {
        console.log(`Failed to connect after ${maxRetries} attempts.`);
        reject(new Error('Failed to connect to InfluxDB after maximum retries.'));
      }
    };

    // Initial attempt
    makeRequest();
  });
}

// Use the async function to wait for the operation to complete
(async function main() {
  try {
    // Wait for the InfluxDB status check to complete
    await checkInfluxDBStatus(5, 2000);
    console.log('Proceeding with the rest of the program.');
    
    // Place the rest of your program logic here
  } catch (error) {
    console.error(`Program halted due to error: ${error.message}`);
    // Handle the error or clean up resources if necessary
  }
})();