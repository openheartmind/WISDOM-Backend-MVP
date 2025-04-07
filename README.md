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

Once Supabase was successfully initialized and running, we run the Drizzle migration command to make sure we get the latest database schemas. This command generates the database based on the local SQL files.
```
npx drizzle-kit generate
```

Finally, we are ready to run the development environment by running the following command:
```
npm run start:dev
```

At this point, your backend should be running.


## Troubleshooting

