import * as express from "express";
import {Application, Request, Response} from "express";
import * as asyncHandler from "express-async-handler";
import * as fs from "fs";
import * as isPortReachable from "is-port-reachable";
import * as spdy from "spdy";
import { BrowserUI, IUserInterface } from "./dashboard";
import { DatabaseController, IDatabase } from "./dbcontroller";
import {catApp} from "./logconfig";

export class App {
// Express app
public app: Application;
public db: IDatabase;

// Constants
private readonly RESTPORT: number = 8080;
private readonly HOST: string = "0.0.0.0";
private UI: IUserInterface;

public constructor(db: IDatabase, UIConnection: boolean) {
  this.app = express();
  // const router = express.Router();
  this.app.use(express.json());
  this.db = db;
  // check for connection to UI on port 999
  if (UIConnection) {
    try {
      this.checkConnection("10.244.1.72", 999);
    } catch (e) {
      catApp.warn(`catch triggered with exception ${e}`);
    }
  } else {
    catApp.info("Startup without UI");
  }

  this.app.get("/ping", (req: Request, res: Response) => {
    res.send("pong\n");
  });

  // Gets
  this.app.get("/messaging/:collection/find", asyncHandler(async (req: Request, res: Response) => {
    // looks if parames :collection needs a other collection
    const collection: string = req.params.collection;
    if (this.db.myCollection.name !== collection) {
      // try/catch to switch the collection
      try {
        await this.db.changeColl(collection);
      } catch (error) {
        res.sendStatus(500);
        catApp.error(error, new Error(error));
      }
    }
    // look what the user wants to get back
    try {
      if (req.body.search) {
        const response: JSON = await this.db.find(req.body.search, req.body.limit);
        res.status(200).send(response);
      } else if (req.body.sort) {
        const sortResponse: JSON = await this.db.sort(req.body.sort, req.body.search, req.body.limit);
        res.status(200).send(sortResponse);
      } else {
        const responseAll: JSON = await this.db.findAll(req.body.limit);
        res.status(200).send(responseAll);
      }
    } catch (err) {
      res.status(500).send(err);
      catApp.error(err, new Error(err));
    }
  }));

  // Posts/Inserts
  this.app.post("/messaging/:collection/insert", asyncHandler(async (req: Request, res: Response) => {
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("You need to insert something to insert");
      res.end();
    } else if (Object.keys(req.body).length === 5) {
    // looks if parames :collection needs a other collection
    const collection: string = req.params.collection;
    if (this.db.myCollection.name !== collection) {
      // try/catch to switch the collection
      try {
        await this.db.changeColl(collection);
      } catch (error) {
        res.sendStatus(500);
        catApp.error(error, new Error(error));
      }
    }
    try {
      await this.db.insert(req.body);
      res.status(201).send("Created");

      // Send update to UI
      if (this.UI) {
        this.updateOnChanges(req.body);
      } else {
        catApp.info("No UI available");
      }
    } catch (err) {
      res.status(500).send("Something with the insert went wrong.");
      catApp.error(err, new Error(err));
    }
    } else {
      res.status(400).send("You need to pass in the right data structure");
      res.end();
    }
  }));

  this.app.delete("/messaging/:collection/delete", asyncHandler(async (req: Request, res: Response) => {
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("You need to insert something to delete");
      res.end();
    } else if (Object.keys(req.body).length === 2) {
      // looks if parames :collection needs a other collection
    const collection: string = req.params.collection;
    if (this.db.myCollection.name !== collection) {
      // try/catch to switch the collection
      try {
        await this.db.changeColl(collection);
      } catch (error) {
        res.sendStatus(500);
        catApp.error(error, new Error(error));
      }
    }
    try {
      if (req.body.type === "one") {
        await this.db.deleteOne(req.body.query);
        res.status(200).send("Deleted");
      } else if (req.body.type === "many") {
        await this.db.deleteMany(req.body.query);
        res.status(200).send("Deleted");
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      res.status(500).send(err);
      catApp.error(err, new Error(err));
    }
    } else {
      res.status(400).send("You need to pass in the right data structure");
      res.end();
    }
  }));
}

// start Expressserver
public async startREST(): Promise<void> {
  await this.db.connect();
  const options: {} = {
    key: fs.readFileSync("./server.key"),
    // tslint:disable-next-line:object-literal-sort-keys
    cert: fs.readFileSync("./server.crt"),
  };

  await spdy
  .createServer(options, this.app)
  .listen(this.RESTPORT, (err) => {
    if (err) {
      catApp.error(err, new Error(err));
    }
    catApp.info(`REST Endpoint is running on https://${this.HOST}:${this.RESTPORT}`);
  });
}

// start HTTP/2 Streaming Server
public async startStream(): Promise<void> {
  // for https
  /*const options = {
    key: fs.readFileSync("./localhost-privkey.pem"),
    // tslint:disable-next-line:object-literal-sort-keys
    cert: fs.readFileSync("./localhost-cert.pem"),
  };
  // createSecureServer(options);
  const server = http2.createServer();
  server.on("stream", (stream, requestHeaders) => {
    // only for dev
    console.log(requestHeaders);
    stream.respond({
      ":status": 200,
      "content-type": "text/html",
    });
    stream.end("secured hello world!");
  });
  server.listen(this.STREAMINGPORT);
  catApp.info(`Streaming is running on http://${this.HOST}:${this.STREAMINGPORT}`);*/

}

private async checkConnection(host: string, port: number): Promise<void> {
  isPortReachable(port, {host: {host}}).then((reachable: boolean) => {
    catApp.info(`${host}:${port} is ${reachable}`);
    if (reachable) {
      this.UI = new BrowserUI();
    } else {
      catApp.info("No connection to the UI possible");
    }
});
}

private async updateOnChanges(body: any): Promise<void> {
  try {
    this.UI.send(body);
  } catch (error) {
    catApp.error("ERROR", new Error(error));
    catApp.info("Maybe the UI is not available");
    if (this.UI) {
        await this.UI.close();
        try {
          catApp.info("Try to recreate UI");
          const reconStatus: boolean = await this.UI.reconnect();
          if (reconStatus) {
            this.UI.send(body);
          }
        } catch (e) {
          catApp.info("Recreation not possible: ");
          catApp.error("Error", new Error(e));
        }
      }
    }
  }
}

// instanciate class and start http/2 express server and http/2 streaming
const DBController: IDatabase = new DatabaseController("mongo-0.mongo:27017", "test");
const Webserver: App = new App(DBController, true);
Webserver.startREST();

// Webserver.startStream();
