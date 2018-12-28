import { DatabaseController } from "./dbcontroller";

export default class DBWrapper {
  // Singleton for Database
  public static getInstance(url: string, db: string): DatabaseController {
    if (!this.instance) {
      this.instance = new DatabaseController(url, db);
      return this.instance;
    }
    return this.instance;
  }
  private static instance: DatabaseController;
}
