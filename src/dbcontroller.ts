import * as Mongo from "mongodb";
import {catController} from "./logconfig";

export interface IDatabase {
  connect(): Promise<void>;
  changeColl(collName: string): Promise<void>;
  insert(value: IMessage): Promise<void>;
  findAll(limit?): Promise<JSON>;
  find(searchSchema: {}, limit?): Promise<JSON>;
  sort(sortSchema: {}, searchSchema?: {}, limit?): Promise<JSON>;
  deleteOne(query: {}): Promise<void>;
  deleteMany(query: {}): Promise<string>;
  getCollectionName(): string;
}

export interface IMessage {
  topic: string;
  deviceID: string;
  messageType: string;
  timestamp: number;
  content: {};

}

export class DatabaseController implements IDatabase {
  public dbname: string;
  public mongodburl: string;
  private myCollection: any;
  private collName: string;
  private db: any;
  private MongoClient: any;
  private url: string;

  public constructor(url, dbname) {
    this.url = url;
    this.dbname = dbname;
    this.collName = "IoT";
    this.mongodburl = `mongodb://${this.url}`;
    this.MongoClient = Mongo.MongoClient;
  }

  // Connect to MongoDB
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.MongoClient.connect(this.mongodburl, { useNewUrlParser: true }, async (err, client) => {
        if (err) { reject(err); }

        const db = await client.db(this.dbname);
        this.myCollection = await db.collection(this.collName);
        this.db = db;
        catController.info(`Connected to ${this.mongodburl}/${this.dbname}`);
        resolve();
      });
    });
  }

  // change the colletion where you work in
  public changeColl(collName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const oldCollName: string = this.myCollection.s.name;
        this.collName = collName;
        this.myCollection = this.db.collection(collName);
        catController.info(`Changed Colllection from ${oldCollName} to ${collName}`);
        resolve();
      } catch (error) {
        reject("Problems to change the collection");
      }
    });
  }
  // Doesnt't work
  public deleteColl(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.myCollection.drop((err, delOK) => {
        if (err) { reject(err); }
        if (delOK) { catController.info(`Succesfully deleted ${this.myCollection.name}`); }
        resolve();
      });
    });
  }

  public getCollectionName(): string {
      if (this.myCollection &&  this.collName && this.myCollection.s.name === this.collName) {
        return(this.myCollection.s.name);
      } else {
        catController.error("ERROR", new Error("Collection name is not sure"));
      }
  }

  // insert something
  public insert(value: IMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.myCollection.insert(value, (err, result) => {
        if (err) { reject(err); }
        catController.info("Entry saved in DB");
        resolve();
      });
    });
  }

  // find all data in the current collection
  // limit is returning the newest data
  public findAll(limit = 10): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.myCollection.find().limit(limit).toArray((err, result) => {
        if (err) { reject(err); }
        resolve(result);
      });
    });
  }

  // find data in current collection with searchSchema and optional limit
  public find(searchSchema: {}, limit = 10): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.myCollection.find(searchSchema).limit(limit).toArray((err, result) => {
        if (err) { reject(err); }
        result.unshift(Object.keys(result).length);
        console.log(result);
        resolve(result);
      });
    });
  }

  // Sort your search
  public sort(sortSchema: {}, searchSchema?: {}, limit = 10): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.myCollection.find(searchSchema).limit(limit).sort(sortSchema).toArray((err, result) => {
        if (err) { reject(err); }
        resolve(result);
      });
    });
  }

  // deletion of entry
  public deleteOne(query: {}): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // check if there is any value to delete
      const empty: boolean = await this.checkForValue(query);
      if (empty) {
        this.myCollection.deleteOne(query, (err, obj) => {
          if (err) { reject(err); }
          catController.info(`Deleted one Element for query ${JSON.stringify(query)}`);
          resolve();
        });
      } else {
        // else there is no value in the collection
        reject("There is no value to delete");
      }
    });
  }

  // deletion of many entries
  // query could be regex for example
  public deleteMany(query: {}): Promise<string> {
    return new Promise(async (resolve, reject) => {
      // check if there is any value to delete
      const empty: boolean = await this.checkForValue(query);
      if (empty) {
      this.myCollection.deleteMany(query, (err, obj) => {
        if (err) { reject(err); }
        const status: string = `${obj.result.n} docuemnt(s) deleted`;
        catController.info(status);
        resolve(status);
      });
    } else {
      // else there are no values in the collection
      reject("There are no values to delete");
    }
    });
  }

  public updateOne(): void {
    catController.info("Currently not available");
  }

  public updateMany(): void {
    catController.info("Currently not available");
  }

  // close connection
  public close(): void {
    process.exit(0);
    this.db.close();
  }

  // check if there is any value to delete
  private checkForValue(searchSchema: {}): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        // find the values in the collection
        const response: JSON = await this.find(searchSchema);
        if (Object.keys(response).length) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        catController.error(error, new Error(error));
        reject(error);
      }
    });
  }
}
