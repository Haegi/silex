const http2 = require("http2");
const fs = require("fs");

class H2CLient {
  constructor() {
    // start the connection and let it open
    // HTTPS
    /*this.client = http2.connect('https://192.168.0.10:8000', {
      ca: fs.readFileSync("../localhost-cert.pem")
    });*/

    //HTTP
    this.client = http2.connect('http://localhost:999');
  }

  connector() {
    const payload = JSON.stringify({
      "test": 1
    });

    const req = this.client.request({ ':method': 'GET', ':path': '/', payload});
    req.on('response', (responseHeaders) => {
      // do something with the headers
      console.log(responseHeaders)
    });
    req.on('data', (chunk) => {
      // do something with the data
      console.log(chunk.toString('utf8'));
    });
    req.on('error', (error) => {
      console.log(error);
      this.client.destroy();
    });
    // let the connection open
    // req.on('end', () => this.client.destroy());
  }
}
const h2 = new H2CLient();
setInterval(() => h2.connector(), 5*1000);