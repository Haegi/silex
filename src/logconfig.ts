import {Category, CategoryConfiguration, CategoryLogger, CategoryServiceFactory, LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

// Create categories, they will autoregister themselves, one category without parent (root) and a child category.
export const catController = new Category("dbcontroller");
export const catApp = new Category("app", catController);
export const catDashboard = new Category("dashboard");
