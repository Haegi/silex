import * as assert from "assert";
import { suite, test } from "mocha-typescript";
import { DatabaseController, IMessage } from "./dbcontroller";

@suite class DBControllerTests {

  private static classUnderTest: DatabaseController;

  private static before(): void {
    this.classUnderTest = new DatabaseController("127.0.0.1:27017", "test");
  }

  @test private async testDBconnection(): Promise<void> {
    await DBControllerTests.classUnderTest.connect();
    const connection: string = await DBControllerTests.classUnderTest.mongodburl;
    assert.equal(connection, "mongodb://127.0.0.1:27017");
  }

  @test private async testChangeCollection(): Promise<void> {
    await DBControllerTests.classUnderTest.changeColl("ml");
    const collName: string =  DBControllerTests.classUnderTest.getCollectionName();
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
    await DBControllerTests.classUnderTest.insert(value);
    const values: JSON = await DBControllerTests.classUnderTest.findAll();
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
    await DBControllerTests.classUnderTest.insert(value);
    const values: JSON = await DBControllerTests.classUnderTest.findAll();
    const actual: string = values[1].topic;
    assert.equal(actual, "Unittest 2");
  }

  @test private async testFindOne(): Promise<void> {
    const searchSchema: {} = {deviceID: "2"};
    const value: JSON = await DBControllerTests.classUnderTest.find(searchSchema);
    assert.equal(value[0].topic, "Unittest 2");
  }

  @test private async testSort(): Promise<void> {
    const sortSchema: {} = {deviceID: -1};
    const values: JSON = await DBControllerTests.classUnderTest.sort(sortSchema);
    const actual: string = values[0].deviceID;
    assert.equal(actual, "2");
  }

  @test private async testDeleteOne(): Promise<void> {
    const query: {} = {topic: "Unittest 2"};
    await DBControllerTests.classUnderTest.deleteOne(query);
    const value: JSON = await DBControllerTests.classUnderTest.findAll();
    const actual: number = value["total"];
    console.log(actual);
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
    await DBControllerTests.classUnderTest.insert(value1);

    const value2: IMessage = { topic: "Temperature",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "2",
                              messageType: "update",
                              timestamp: Date.now(),
                              content: {
                                value: "200",
                              } };
    await DBControllerTests.classUnderTest.insert(value2);
    await DBControllerTests.classUnderTest.deleteMany(query);
    const message: JSON = await DBControllerTests.classUnderTest.findAll();
    const actual: number = message["total"];
    assert.equal(actual, 1);
  }

  @test private async test2Collections() {
    await DBControllerTests.classUnderTest.changeColl("IoT");
    const insertValue: IMessage = { topic: "Test",
                              // tslint:disable-next-line:object-literal-sort-keys
                              deviceID: "1",
                              messageType: "message",
                              timestamp: Date.now(),
                              content: {
                                value: "1",
                              } };
    await DBControllerTests.classUnderTest.insert(insertValue);
    await DBControllerTests.classUnderTest.changeColl("ml");
    const newCollValue: JSON = await DBControllerTests.classUnderTest.findAll();
    const newCollLength: number = Object.keys(newCollValue).length;
    await DBControllerTests.classUnderTest.changeColl("IoT");
    const IoTValue: JSON = await DBControllerTests.classUnderTest.findAll();
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
    await DBControllerTests.classUnderTest.insert(insertValue1);
    await DBControllerTests.classUnderTest.insert(insertValue2);
    const sortSchema: {} = {deviceID: -1};
    const values: JSON = await DBControllerTests.classUnderTest.sort(sortSchema, undefined, 2);
    const actual: number = Object.keys(values).length;
    assert.equal(actual, 2);
  }

  // tslint:disable-next-line:member-ordering
  private static after(): void {
    this.classUnderTest.close();
  }
}
