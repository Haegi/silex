import * as mongo from "mongo-mock";
import * as Mongo from "mongodb";
import {catController} from "./logconfig";

export interface IDatabase {
  myCollection: any;
  connect(): Promise<void>;
  changeColl(collName: string): Promise<void>;
  insert(value: IMessage): Promise<void>;
  findAll(limit?: number): Promise<JSON>;
  find(searchSchema: {}, limit?: number): Promise<JSON>;
  sort(sortSchema: {}, searchSchema?: {}, limit?: number): Promise<JSON>;
  deleteOne(query: {}): Promise<void>;
  deleteMany(query: {}): Promise<void>;
}

export interface IMessage {
  topic: string;
  deviceID: string;
  messageType: string;
  timestamp: number;
  content: {};

}

export class DatabaseController implements IDatabase {
  public url: string;
  public dbname: string;
  public collName: string;
  public mongodburl: string;
  public myCollection: any;
  private db: any;
  private MongoClient: any;

  public constructor(url, dbname) {
    this.url = url;
    this.dbname = dbname;
    this.collName = "IoT";
    this.mongodburl = `mongodb://${url}/${dbname}`;
    if (process.env.NODE_ENV  === "testing") {
      this.MongoClient = mongo.MongoClient;
      catController.info(`Started in ${process.env.NODE_ENV} mode`);
    } else {
      this.MongoClient = Mongo.MongoClient;
      catController.info(`Started in ${process.env.NODE_ENV} mode`);
    }
  }

  // Connect to MongoDB
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.MongoClient.connect(this.mongodburl, { useNewUrlParser: true }, (err, db) => {
        if (err) { reject(err); }
        // logger
        catController.info(`Connected to ${this.mongodburl}`);
        this.myCollection = db.collection(this.collName);
        this.db = db;
        db.close();
        resolve();
      });
    });
  }

  // change the colletion where you work in
  public changeColl(collName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const oldCollName: string = this.myCollection.name;
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

  public getCollectionName(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (this.myCollection.name === this.collName) {
          resolve(this.collName);
        }
        reject("Collection name not sure");
    });
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
  public findAll(limit?: number): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.myCollection.find().limit(limit).toArray((err, result) => {
        if (err) { reject(err); }
        resolve(result);
      });
    });
  }

  // find data in current collection with searchSchema and optional limit
  public find(searchSchema: {}, limit?: number): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.myCollection.find(searchSchema).limit(limit).toArray((err, result) => {
        if (err) { reject(err); }
        resolve(result);
      });
    });
  }

  // Sort your search
  public sort(sortSchema: {}, searchSchema?: {}, limit?: number): Promise<JSON> {
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
  public deleteMany(query: {}): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // check if there is any value to delete
      const empty: boolean = await this.checkForValue(query);
      if (empty) {
      this.myCollection.deleteMany(query, (err, obj) => {
        if (err) { reject(err); }
        catController.info(`${obj.result.n} docuemnt(s) deleted`);
        resolve();
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