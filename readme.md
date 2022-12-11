# Fries Quest REST API
A Node-based REST API application for the Fries Quest Twitch-Integrated RPG. Play live at [JFriesTV](https://twitch.tv/jfriestv)!


### Environment Setup
The API relies on a number of environment variables:

| Key | Default | Required | Description |
|---|---|---|---|
|FRIES_REST_API_PORT|5000|false|Port API listens to on the local machine.|
|FRIES_REST_MONGO_URL|null|true|Full connection URL to target MongoDB instance.|
|FRIES_REST_MONGO_DB|null|true|MongoDB Database name at the target cluster|
|FRIES_REST_CLIENT_SECRET|null|true|Secret client key used to authenticate with the API|

If launching through Docker (recommended), we recommend creating a `.env` file with these values defined, which can be used to provide Docker with the variables when launching a continer.

### Launch Method 1: Docker (Recommended)
A Dockerfile is already provided with this repository which can be used to easily get the API up and running without installing additional dependencies (beyond Docker).

#### Step 1: Build Image
An image can be built directly from this repository with one simple command:

`docker build -t fries-rest:latest https://github.com/citrus-thunder/fries-rest.git#main`

This will build a new fries-rest image from the current version of the API.

#### Step 2: Build Container
Once you have an image, you can build and run a container with the following command:

`docker run -t 

### Launch Method 2: Run with Node