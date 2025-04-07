## SpecStory

## Backing Up Supabase PostgreSQL Database (07/04/2025, 18:50:38)

_**User**_

I have supabase with postgres db. I want to back up the current data in DB in a local sql file. What are the steps that I need to do? 

---

_**Assistant**_



---

_****_

To back up your Supabase Postgres database to a local SQL file:

1. Install the Postgres command-line tools (if not already installed):
   ```
   # macOS with Homebrew
   brew install postgresql
   ```

2. Find your Supabase connection details from the Supabase dashboard:
   - Go to Project Settings > Database
   - Look for connection string or individual credentials (host, database name, port, user, password)

3. Use pg_dump to create the backup:
   ```
   pg_dump -h [host] -p [port] -U [user] -d [database] -F p > backup.sql
   ```

4. When prompted, enter your database password

This will create a backup.sql file in your current directory with all your database contents.

---

_**User**_

I am getting the below error, how to fix this:

---

_**Assistant**_



---

_****_

The error shows a version mismatch between your Supabase PostgreSQL server (v15.8) and your local pg_dump tool (v14.17).

To fix this, install PostgreSQL 15 via Homebrew:

```
brew install postgresql@15
```

Then add it to your PATH and use the correct version of pg_dump:

```
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

Now try running pg_dump again:

```
pg_dump -h [host] -p [port] -U [user] -d [database] -F p > backup.sql
```

If you need this change to be permanent, add the export line to your ~/.zshrc file.

---



---

