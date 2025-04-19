# Wisdom Backend

## Initial Setup

Prerequisites:
* Git
* Code IDE (e.g. VS Code)
* Docker
* NodeJS

First, we clone the repository by executing the following command at your desired file path:

```
git clone https://github.com/openheartmind/WISDOM-Backend-MVP
```

Next, open the cloned repository with your IDE and in the terminal window, execute the installation command:
```
npm i
```

Next, we install Supabase as a local copy. Run the following command to initialize it on your machine:
```
npx supabase init
```

** If the Supabase was already initialized, it might be different than the latest version and you might need to reset it with the following command:
```
npx supabase db reset
```

To be able to complete the setup of the backend, we need to configure all the environmental variables.

Make a copy of the file _.env.example_ and name it _.env_

Next, populate all the example values of the variables with the right input. Most of these values will be presented once the Supabase instance runs locally.

To start the Supabase instance and get the environmental variables, execute the following command.:
```
npx supabase start
```

The output should indicate whether a local Supabase instance is running or not, but if you're unsure and would like to check again, you can run the following command:
```
npx supabase status
```

Make sure that the value of SUPABASE_KEY corresponds to the "anon key" from and SUPABASE_SERVICE_KEY correspond to "service_role key"

Once Supabase was successfully initialized and running, we run the Drizzle migration command to make sure we set the database schemas to match the file-based schemas. This command runs the SQL migration files which will align the database based on the local SQL files.
```
npx drizzle-kit migrate
```

If any changes are made to the local schema files, the following command needs to be executed to re-create the SQL files with these changes, followed by the command to apply it on the database.
```
npx drizzle-kit generate
npx drizzle-kit migrate
```

Finally, we are ready to run the development environment by running the following command:
```
npm run start:dev
```

At this point, your backend should be running.

To complie the project for production, run the following:
```
npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Development URLs

When running the project in development environment, you can access local insances of the different parts through:

- Swagger/OpenAPI docs: http://localhost:3000/docs
- Supabase Studio: http://localhost:54323
- Inbucket (test email): http://loclhost:5050


## Database Maintenance

As part of setting up Supabase locally, you receive the connection string to connect into the database. This allows managing the content manually using any postgres client software.

Authentication is managed both by Supabase and our own custom table.

The _users_ table of Supabase is stored under the _auth_ schema.

Our custom _users_ table is stored under the _public_ schema.

## Troubleshooting
### Error message - Invalid JWT: unable to parse or verify signature. token signature is invalid...
Run the command:
```
npx supabase status
```
and re-assign the keys to your _.env_ file as they may be incorrect.
