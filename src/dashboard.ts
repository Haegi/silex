import * as fs from "fs";
import * as http2 from "http2";

export interface IUserInterface {
    send(body: any): void;
    close(): void;
    reconnect(): boolean;

}

export class BrowserUI implements IUserInterface {

    public req;
    private client;
    constructor() {
        // HTTPS STREAMING
        this.client = http2.connect("https://localhost:999", {
            ca: fs.readFileSync("./localhost-cert.pem"),
        });
        console.log("Connected to UI");
        // Old HTTP version
        // this.client = http2.connect("http://localhost:999");
    }

    public send(body: any): void {
          // Unix timestamp in milliseconds
        const ts = new Date(body.timestamp);
        const time = ts.toLocaleTimeString();
        const value: number = body.content.value;
        const payload = JSON.stringify({
            data: value,
            timestamp: time,
        });
        const pathValue: string = body.deviceID ? `/${body.deviceID}` : "/";
        this.req = this.client.request({ ":method": "GET", ":path": pathValue, payload});
        this.req.on("response", (responseHeaders) => {
        // do something with the headers
        console.log(responseHeaders);
      });
        this.req.on("data", (chunk) => {
        // do something with the data
        console.log(chunk.toString("utf8"));
      });
        this.req.on("error", (error) => {
        console.log(error);
        this.client.destroy();
      });
    }

    public close(): void {
        this.client.destroy();
    }

    public reconnect(): boolean {
        try {
            this.client = http2.connect("http://localhost:999");
            console.log("Recreation successfull");
            return true;
        } catch (error) {
            console.log("Can not reconnect");
            return false;
        }
    }

      // let the connection open
      // req.on('end', () => this.client.destroy());
    }
