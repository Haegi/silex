import * as express from "express";
import {Application, Request, Response} from "express";
import * as asyncHandler from "express-async-handler";
import * as fs from "fs";
import * as spdy from "spdy";
import { DatabaseController } from "./dbcontroller";
import DBWrapper from "./dbwrapper";
import {catApp} from "./logconfig";

export class App {
// Express app
public app: Application;
public db: DatabaseController;

// Constants
private readonly PORT: number = 8080;
private readonly HOST: string = "0.0.0.0";

public constructor() {
  this.app = express();
  this.app.use(express.json());
  this.db = DBWrapper.getInstance("mongo-0.mongo:27017", "test");

  this.app.get("/", (req: Request, res: Response) => {
    res.send("Hello world\n");
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
public async start(): Promise<void> {
  await this.db.connect();
  const options: {} = {
    key: fs.readFileSync("./server.key"),
    // tslint:disable-next-line:object-literal-sort-keys
    cert: fs.readFileSync("./server.crt"),
  };

  // this.app.listen(this.PORT, this.HOST);
  spdy
  .createServer(options, this.app)
  .listen(this.PORT, this.HOST, (err) => {
    if (err) {
      catApp.error(err, new Error(err));
    }
    catApp.info(`Running on http://${this.HOST}:${this.PORT}`);
  });
}

}
// instanciate class and start http/2 express server
new App().start();
