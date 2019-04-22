import * as assert from "assert";
import { suite, test } from "mocha-typescript";
import { DatabaseController, IMessage } from "./dbcontroller";

@suite class DBControllerTests {

  private classUnderTest: DatabaseController;

  private async beforeEach(): Promise<void> {
    this.classUnderTest = new DatabaseController("127.0.0.1:27017", "test");
  }
  private afterEach(): void {
    this.classUnderTest.close();
  }

  @test private async testDBconnection(): Promise<void> {
    await this.classUnderTest.connect();
    const connection: string = await this.classUnderTest.mongodburl;
    assert.equal(connection, "mongodb://127.0.0.1:27017");
  }

  @test private async testChangeCollection(): Promise<void> {
    await this.classUnderTest.changeColl("ml");
    const collName: string =  this.classUnderTest.getCollectionName();
    assert.equal(collName, "ml");

  }

  /* @test private async testDeleteCollection(): Promise<void> {
    await this.classUnderTest.deleteColl();
    console.log(this.classUnderTest.myCollection);
    assert.equal("1", "1");
  }*/

  @test private async testInsert(): Promise<void> {
    const value: IMessage = { topic: "Unittest 1",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "1",
                              messageType: "message",
                              timestamp: Date.now(),
                              content: {
                                value: "This is the first message",
                              } };
    await this.classUnderTest.insert(value);
    const values: JSON = await this.classUnderTest.findAll();
    const actual: string = values[0].topic;
    assert.equal(actual, "Unittest 1");
  }

  @test private async testFindAll(): Promise<void> {
    const value: IMessage = { topic: "Unittest 2",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "2",
                              messageType: "message",
                              timestamp: Date.now(),
                              content: {
                                value: "This is the second message",
                              } };
    await this.classUnderTest.insert(value);
    const values: JSON = await this.classUnderTest.findAll();
    const actual: string = values[1].topic;
    assert.equal(actual, "Unittest 2");
  }

  @test private async testFindOne(): Promise<void> {
    const searchSchema: {} = {deviceID: "2"};
    const value: JSON = await this.classUnderTest.find(searchSchema);
    const actual: number = Object.keys(value).length;
    assert.equal(actual, 1);
  }

  @test private async testSort(): Promise<void> {
    const sortSchema: {} = {deviceID: -1};
    const values: JSON = await this.classUnderTest.sort(sortSchema);
    const actual: string = values[0].deviceID;
    assert.equal(actual, "2");
  }

  @test private async testDeleteOne(): Promise<void> {
    const query: {} = {topic: "Unittest 2"};
    await this.classUnderTest.deleteOne(query);
    const value: JSON = await this.classUnderTest.findAll();
    const actual: number = Object.keys(value).length;
    assert.equal(actual, 1);
  }

  @test private async testDeleteMany(): Promise<void> {
    const query: {} = { deviceID: "2" };
    const value1: IMessage = { topic: "Temperature",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "2",
                              messageType: "update",
                              timestamp: Date.now(),
                              content: {
                                value: "20",
                              } };
    await this.classUnderTest.insert(value1);

    const value2: IMessage = { topic: "Temperature",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "2",
                              messageType: "update",
                              timestamp: Date.now(),
                              content: {
                                value: "200",
                              } };
    await this.classUnderTest.insert(value2);
    await this.classUnderTest.deleteMany(query);
    const message: JSON = await this.classUnderTest.findAll();
    const actual: number = Object.keys(message).length;
    assert.equal(actual, 1);
  }

  @test private async test2Collections() {
    await this.classUnderTest.changeColl("IoT");
    const insertValue: IMessage = { topic: "Test",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "1",
                              messageType: "message",
                              timestamp: Date.now(),
                              content: {
                                value: "1",
                              } };
    await this.classUnderTest.insert(insertValue);
    await this.classUnderTest.changeColl("ml");
    const newCollValue: JSON = await this.classUnderTest.findAll();
    const newCollLength: number = Object.keys(newCollValue).length;
    await this.classUnderTest.changeColl("IoT");
    const IoTValue: JSON = await this.classUnderTest.findAll();
    const IoTLength: number = Object.keys(IoTValue).length;
    const actual: number = newCollLength + IoTLength;
    assert.equal(actual, 2);
  }

  @test private async testLimit(): Promise<void> {
    const insertValue1: IMessage = { topic: "Test",
                                    // tslint:disable-next-line:object-literal-sort-keys
                                    deviceID: "2",
                                    messageType: "message",
                                    timestamp: Date.now(),
                                    content: {
                                      value: "2",
                                    } };
    const insertValue2: IMessage = { topic: "Test",
                                    // tslint:disable-next-line:object-literal-sort-keys
                                    deviceID: "2",
                                    messageType: "message",
                                    timestamp: Date.now(),
                                    content: {
                                      value: "2",
                                    } };
    await this.classUnderTest.insert(insertValue1);
    await this.classUnderTest.insert(insertValue2);
    const sortSchema: {} = {deviceID: -1};
    const values: JSON = await this.classUnderTest.sort(sortSchema, undefined, 2);
    const actual: number = Object.keys(values).length;
    assert.equal(actual, 2);
  }
}
