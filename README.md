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

After resetting the database, all data will be removed and you will need to recreate the tables by running the migration again. Best to run the generate command as well to make sure all the latest schema changes are present -

```
npx drizzle-kit migrate
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

### Automated Tests
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Manual Workflows - User Creation
The creation of a new user in the app has 2 steps:
1. Creation of a user record inside Supabase Auth module
2. Creation of a user record inside Supabase public database

As part of our security mechanism, a user is active in the system only after it has been verified with a One-Time-Password sent via email after step one.

After the creation of a user in Supabase Auth module, a secret token is assigned to that user, which needs to be verified in a short period of time.

The verification process of that token can be done either through the front-end or backend verification endpoints.

First, we get extract the token. There are a few options to do so:
1. Use a valid email address for the user, which will receive the token as part of the email body and a link for activation - This option requires all environmental parameters to use a valid SMTP server to send the email.

2. Use the InBucket service to see the content of the email that is sent. The InBucket is a fake SMTP service for testing purposes and is accessible as part of the development environment URLs list mentioned in this document.

3. Connect to your local database instance with an PostgresSQL client and extract that value from the _auth_ schema in the _users_ table.


## Development URLs

When running the project in development environment, you can access local insances of the different parts through:

- Swagger/OpenAPI docs: http://localhost:3000/docs
- Supabase Studio: http://localhost:54323
- Inbucket (test email): http://localhost:5050


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

### Error message - Database connection failed
First, make sure you know how to connect to the database locally with a database client as specified for your instance in the DB Url when running the following command -
```
npx supabase status
```

If for some reason your local database instance is no longer able to connect, use the following commands to reinitialize it -
```
npx supabase stop
npx supabase start
```
This will restart the Docker container of Supabase and will download 
and reinstall any broken components of the instance.

After restarting your instance, try once again to reconnect to your database

### Error message - Failing to recreate Drizzle migration files
It's most likely that you have conflicts. The following command should resolve it all, but it will reset the content of the database -

```
npx supabase db reset
```

After resetting the database, all data will be removed and you will need to recreate the tables by running the migration again. Best to run the generate command as well to make sure all the latest schema changes are present -

```
npx drizzle-kit generate
npx drizzle-kit migrate
```
