Welcome to my API demo built using Express, Sequelize and Docker!

This API is deployed using [Heroku](https://www.heroku.com/home) and when deployed, is configured to work with its corresponding frontend project: [choose-health-th-frontend](https://github.com/flow-state-15/choose-health-th-frontend). 

However, you can easily run this API locally using Docker.

[Visit the live site!](https://choose-health-th-frontend.vercel.app/)

## Startup Instructions

To run this app locally, first clone down this repo and install dependencies:

```
git clone https://github.com/flow-state-15/choose-health-th-api.git
```

`cd` into the project directory to install dependencies.

This project uses `pnpm` for package management. Install dependencies with
`pnpm install` or use your favorite Node package manager.

**Note:** If using `npm`, be sure to install the devDependencies manually, with `npm install -D`.

The database uses environment variables to configure the connection url. A `.env` file must be created in the project's root folder. Without the necessary environment variables present, you will get an error running the next command. An example env file is included for your convenience. Be sure to replace the example credential values with your own:

```text
DATABASE_URL=postgres://<your_db_user>:<db_user_password>@db:5432/<your_db_name>
POSTGRES_USER=<your_db_username>
POSTGRES_DB=<your_db_name>
POSTGRES_PASSWORD=<your_top_secret_password>
```

I don't recommend changing the remainder of the `.env.example` file. Once finished, simply remove the `.example` suffix on the file and your new `.env` should be ready.

>**NOTE:** Docker is used to run the Postgres database for this demo. Running the db in a container allows a tester to work around the need to install Postgres on the local machine. However, Docker needs to be installed, and I recommend using [Docker Desktop](https://docs.docker.com/desktop/) for easier container management. 

### Start the API

To spin up the docker containers, navigate to the root directory and simply run
 ```text
 docker compose up --build
 ```

By default, the API is exposed on port `8000` but you may configure this through the `.env`. 

`compose` creates an internal network and volume for the services. If you need to spin down the containers, use the Docker Desktop GUI or simply run `docker compose down` for graceful shutdown.

Spinning down the containers won't destroy the db in the persistent volume, so if you need to do that run `docker compose down -v` to remove the volume.

## API Features

This project targets these simple CRUD objectives: allow a visitor to sign up and create a new user. Users may view available Plans and optionally purchase them. If a user purchases a Plan, the user may then complete the Plan steps through the Dashboard.

This web server and database serves the following CRUD features:

- User auth (create/read)
- Plan Purchases (create/read)
- Plan Step operations (create/read/patch)

Corresponding routes for the above features are easily found in `src/index.js`.

## Using with frontend

If interested, you may clone down the [frontend project](https://github.com/flow-state-15/choose-health-th-frontend) for this api and configure it to utilize these containers. The instructions to do so are included in that repo. 

Remember to change the `fetchFromAPI` wrapper's top level domain to use `localhost` and the port number you specified in the `.env`.

---

### Notes

This API's auth system uses cookies to validate users. Some add blockers may block cross origin cookies, and when that happens the API will send `Unauthorized` messages. 

Thank you for viewing this project. Happy coding!