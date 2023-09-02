# Config Service Documentation

The **Config service** is a part of the Paas-Shack project, providing a straightforward way to manage configuration settings for your microservices-based application. With this service, you can store, retrieve, and update configuration settings, ensuring your services are configured correctly and consistently.

## Table of Contents

1. [Introduction](#introduction)
2. [Service Settings](#service-settings)
3. [Actions](#actions)
    - [Get Configurations](#get-configurations)
    - [Set Configuration Values](#set-configuration-values)
    - [Get All Config Settings](#get-all-config-settings)
    - [Run Configuration Migration](#run-configuration-migration)
4. [Methods](#methods)
    - [Get Configurations by Key(s)](#get-configurations-by-keys)
    - [Get Configurations by One Key (with Wildcards)](#get-configurations-by-one-key-with-wildcards)
    - [Get Configurations by Key Mask](#get-configurations-by-key-mask)
    - [Set a Configuration Value](#set-a-configuration-value)
5. [Service Lifecycle Events](#service-lifecycle-events)
6. [Getting Started](#getting-started)
7. [Support and Feedback](#support-and-feedback)

## Introduction

The Config service is designed to simplify the management of configuration settings within your microservices application. It provides the following key features:

- Storing configuration settings in a database.
- Retrieving configuration values by key(s).
- Setting configuration values by key(s).
- Running a configuration migration to add missing keys.

## Service Settings

The Config service has various settings to define how it operates. Here are some important settings:

- **defaultConfig**: An object containing default configuration values.
- **fields**: Defines the structure of configuration entries.
- **indexes**: Specifies the indexes used for efficient querying.

## Actions

The Config service exposes the following actions:

### Get Configurations

- **Action Name**: `get`
- **Parameters**:
    - `key` (String or Array of Strings): The configuration key(s) to retrieve.
- **Description**: Retrieve one or more configuration settings by key(s).

### Set Configuration Values

- **Action Name**: `set`
- **Parameters**:
    - `key` (String): The configuration key.
    - `value` (Any): The new value to set.
- **Description**: Set the value of a configuration setting by key.

### Get All Config Settings

- **Action Name**: `all`
- **Description**: Get all configuration settings. This action is protected and meant for internal use.

### Run Configuration Migration

- **Action Name**: `migrate`
- **Description**: Run a configuration migration to add missing keys. This action is protected and meant for internal use.

## Methods

In addition to actions, the Config service provides several methods for working with configurations programmatically.

### Get Configurations by Key(s)

- **Method Name**: `get`
- **Parameters**: 
    - `key` (String or Array of Strings): The configuration key(s) to retrieve.
- **Description**: Get configurations by key(s). Returns an object or an array of objects representing the configurations.

### Get Configurations by One Key (with Wildcards)

- **Method Name**: `getOne`
- **Parameters**:
    - `key` (String): The configuration key, which can contain wildcards (`*` or `?`).
- **Description**: Get configurations by one key, including the ability to use wildcards. Returns an object or an array of objects representing the configurations.

### Get Configurations by Key Mask

- **Method Name**: `getByMask`
- **Parameters**:
    - `mask` (String): The key mask to filter configurations.
- **Description**: Get configurations by a key mask. Returns an array of objects representing the configurations.

### Set a Configuration Value

- **Method Name**: `set`
- **Parameters**:
    - `key` (String): The configuration key.
    - `value` (Any): The new value to set.
    - `isDefault` (Boolean, optional): Indicates whether the configuration is a default value.
- **Description**: Set a configuration value by key. Returns an object with information about the change.

## Service Lifecycle Events

The Config service handles the following lifecycle events:

- **started**: When the service starts, it automatically runs the configuration migration to add any missing keys.

## Getting Started

To get started with the Config service, follow these steps:

1. Clone the Paas-Shack GitHub repository to your local development environment:

   ```bash
   git clone https://github.com/Paas-Shack/config.git
   ```

2. Explore the project structure and services provided, including the Config service.

3. Customize the Config service to suit your specific configuration needs.

4. Integrate the Config service into your microservices application to manage configuration settings efficiently.

5. Utilize the provided actions and methods to retrieve, set, and manage configurations.

6. If needed, contribute to the project by submitting pull requests, reporting issues, or suggesting improvements. Your contributions are welcome!

## Support and Feedback

If you have any questions, encounter issues, or would like to provide feedback about the Config service or any other part of the Paas-Shack project, please don't hesitate to reach out. You can open issues in the respective service repositories or contact us through our GitHub organization.

Thank you for choosing the Config service from Paas-Shack. We hope this service simplifies your configuration management and enhances the functionality of your microservices-based applications. Happy coding!