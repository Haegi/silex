import * as http2 from "http2";
import {catDashboard} from "./logconfig";

export interface IUserInterface {
    send(body: any): void;
    close(): void;
    reconnect(): boolean;

}

export class BrowserUI implements IUserInterface {

    public req;
    private client;
    constructor() {
        // HTTP STREAMING
        this.client = http2.connect("http://silex-dashboard:999");
        catDashboard.info("Connected to UI");
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
          // console.log(responseHeaders);
      });
        this.req.on("data", (chunk) => {
          // do something with the data
          catDashboard.info(chunk.toString("utf8"));
      });
        this.req.on("error", (error) => {
          catDashboard.error("ERROR!", new Error(error));
          this.client.destroy();
      });
    }

    public close(): void {
        this.client.destroy();
    }

    public reconnect(): boolean {
        try {
          this.client = http2.connect("http://silex-dashboard:999");
          catDashboard.info("Recreation successfull");
          return true;
        } catch (error) {
          catDashboard.error("ERROR! Can't reconnect", new Error(error));
          return false;
        }
    }

      // let the connection open
      // req.on('end', () => this.client.destroy());
    }
