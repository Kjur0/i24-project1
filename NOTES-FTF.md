# Environmental Variables

Either in `.env` (or `.env.<environment>`) or in your hosting provider's environment variable settings, set the following variables:

- `MONGO_URI` - your MongoDB connection string (e.g. `mongodb+srv://<db_username>:<db_password>@<db_host>/<db_name>`)
- `MONGO_USER` - your MongoDB username (used if `MONGO_URI` contains `<db_username>` or `MONGO_URI` is not set)
- `MONGO_PASS` - your MongoDB password (used if `MONGO_URI` contains `<db_password>` or `MONGO_URI` is not set)
- `MONGO_URL` - your MongoDB cluster URL (only used if `MONGO_URI` is not set)
