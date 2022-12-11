# Fries Quest REST API
A Node-based REST API application for the Fries Quest Twitch-Integrated RPG. Play live at [JFriesTV](https://twitch.tv/jfriestv)!

# Using the API
The API can be accessed by simply sending standard HTTP requests directly to wherever the API is hosted.

In order to perform CRUD operations, the client must have authenticated with the API beforehand.

## Authentication
`#TODO`

## Performing CRUD Operations

CRUD Operations can be performed by sending HTTP requests to the routes described in this section.

In general, a response code of `200` indicates a successful operation, while anything else suggests one or more issues with the request.

### Player Data: `/api/player/{id}`
| HTTP Method | Operation | Response Codes | Description |
| --- | --- | --- | --- |
| `PUT` | `CREATE` | `200` `400` `401` `409` | Create a new Player record with `userId: {id}` . `200` on success. `409` on record already exists. `400` on error. `401` on unauthorized.|
| `GET` | `READ` | `200` `401` `404` | Get Player record with `userId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|
| `POST` | `UPDATE` | `200` `400` `401` | Update Player record with `userId: {id}`. `200` on success. `400` on error. `401` on unauthorized.|
| `DELETE` | `DELETE` | `200` `401` `404` | Delete Player record with `userId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|

### Monster Data: `/api/monster/{id}`
| HTTP Method | Operation | Response Codes | Description |
| --- | --- | --- | --- |
| `PUT` | `CREATE` | `200` `400` `401` `409` | Create a new Monster record with `monsterId: {id}` . `200` on success. `409` on record already exists. `400` on error. `401` on unauthorized.|
| `GET` | `READ` | `200` `401` `404` | Get Monster record with `monsterId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|
| `POST` | `UPDATE` | `200` `400` `401` | Update Monster record with `monsterId: {id}`. `200` on success. `400` on error. `401` on unauthorized.|
| `DELETE` | `DELETE` | `200` `401` `404` | Delete Monster record with `monsterId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|

### Weapon Data: `/api/weapon/{id}`
| HTTP Method | Operation | Response Codes | Description |
| --- | --- | --- | --- |
| `PUT` | `CREATE` | `200` `400` `401` `409` | Create a new Weapon record with `weaponId: {id}` . `200` on success. `409` on record already exists. `400` on error. `401` on unauthorized.|
| `GET` | `READ` | `200` `401` `404` | Get Weapon record with `weaponId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|
| `POST` | `UPDATE` | `200` `400` `401` | Update Weapon record with `weaponId: {id}`. `200` on success. `400` on error. `401` on unauthorized.|
| `DELETE` | `DELETE` | `200` `401` `404` | Delete Weapon record with `weaponId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|

### Armor Data: `/api/armor/{id}`
| HTTP Method | Operation | Response Codes | Description |
| --- | --- | --- | --- |
| `PUT` | `CREATE` | `200` `400` `401` `409` | Create a new Armor record with `armorId: {id}` . `200` on success. `409` on record already exists. `400` on error. `401` on unauthorized.|
| `GET` | `READ` | `200` `401` `404` | Get Armor record with `armorId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|
| `POST` | `UPDATE` | `200` `400` `401`| Update Armor record with `armorId: {id}`. `200` on success. `400` on error. `401` on unauthorized.|
| `DELETE` | `DELETE` | `200` `401` `404` | Delete Armor record with `armorId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|

### Item Data: `/api/item/{id}`
| HTTP Method | Operation | Response Codes | Description |
| --- | --- | --- | --- |
| `PUT` | `CREATE` | `200` `400` `401` `409` | Create a new Item record with `itemId: {id}` . `200` on success. `409` on record already exists. `400` on error. `401` on unauthorized.|
| `GET` | `READ` | `200` `401` `404` | Get Item record with `itemId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|
| `POST` | `UPDATE` | `200` `400` `401` | Update Item record with `itemId: {id}`. `200` on success. `400` on error. `401` on unauthorized.|
| `DELETE` | `DELETE` | `200` `401` `404` | Delete Item record with `itemId: {id}`. `200` on success. `404` on record not found. `401` on unauthorized.|

---

# Running the API
The API can be run from any environment with Node installed, and is capable of accepting incoming HTTP requests.

### Environment Setup
The API relies on a number of environment variables, which are used to set various configuration options:

| Key | Default | Required | Description |
|---|---|---|---|
|`FRIES_REST_API_PORT`|`5000`|false|Port API listens to on the local machine.|
|`FRIES_REST_DISABLE_AUTH`|`false`|false|Allows full CRUD operation access without authentication. Warning: This should not be used for production instances!|
|`FRIES_REST_CLIENT_SECRET`|`undefined`|false*|Secret client key used to authenticate with the API. *Required if `FRIES_REST_DISABLE_AUTH` is set to `false`.|
|`FRIES_REST_MONGO_URL`|N/A|true|Full connection URL string to target MongoDB instance.|
|`FRIES_REST_MONGO_DB`|N/A|true|MongoDB Database name within the cluster located at `FRIES_REST_MONGO_URL` |



If launching through Docker (recommended), we recommend creating a `.env` file with these values defined, which can be used to provide Docker with the variables when launching a continer.

### Launch Method 1: Docker (Recommended)
A Dockerfile is already provided with this repository which can be used to easily get the API up and running without installing additional dependencies (beyond Docker). This is the preferred approach as it avoids potential environmental differences that can negatively affect the API.

#### Step 1: Build Image
An image can be built directly from this repository with one simple command:

`docker build -t fries-rest:latest https://github.com/citrus-thunder/fries-rest.git#main`

This will build a new fries-rest image from the current version of the API.

#### Step 2: Build Container
Once you have an image, you can build and run a container with the following command:

`docker run -t --env-file <path to .env file> --name fries-rest`

### Launch Method 2: Run with Node
Alternatively, the API can be built and run directly with Node.

* Step 1: Build the application with `node run build`. This will produce the final application in the `./out` directory.
* Step 2: Ensure the required environment variables are present, either defined directly in your environment or otherwise provided to the Node process during the next step.
* Step 3: Run the service with `node ./out/server.js`