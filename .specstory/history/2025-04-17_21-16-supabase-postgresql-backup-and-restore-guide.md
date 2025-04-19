## SpecStory

## Supabase PostgreSQL Backup and Restore Guide (17/04/2025, 21:16:27)

_**User**_

Go through the codebase to understand the structure and explore the current @schema.prisma . 

I am hosting this DB in Supabase which is a postgreql DB. I don't have subscription in Supabase, but I want to safely backup and restore my DB incase if anything goes wrong. Provide me with the complete steps to backup the database and guide me like I am a beginner. Write a comprehensive list of steps to do. 

---

_**Assistant**_

Here’s a beginner‐friendly, step‑by‑step guide to safely back up and restore your Supabase PostgreSQL database. We’ll cover two approaches:

  •  Using the native PostgreSQL tools (`pg_dump` / `pg_restore`)  
  •  (Optionally) Using the Supabase CLI  

---  
## A. Prerequisites  
1. **macOS/Postgres client installed**  
   On macOS you can install the PostgreSQL client tools (which include `psql`, `pg_dump`, `pg_restore`) via Homebrew:  
     ```shell
     brew install libpq       # installs just the client tools
     brew link --force libpq  # makes psql, pg_dump, etc. available in $PATH
     ```  
   Alternatively, install the full Postgres server package:  
     ```shell
     brew install postgresql
     ```  

2. **Locate your Supabase connection info**  
   1. Go to your Supabase project → **Settings** → **Database** → **Connection string**.  
   2. Copy the “URI” value, which looks like:  
      ```
      postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name>
      ```  

3. (Optional) **Supabase CLI**  
   If you’d rather use Supabase’s own commands, install it globally:  
     ```shell
     # via Homebrew
     brew install supabase/tap/supabase
     # – OR –
     npm install -g supabase
     ```  
   Then run `supabase login` and follow the prompts.

---  
## B. Backing Up with `pg_dump`  
We’ll use the **custom format** dump (`-Fc`), which is compressed and ideal for `pg_restore`.  

1. **Export your connection string into an environment variable**  
   In your terminal:  
   ```shell
   export DATABASE_URL="postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name>"
   ```  
   Replace the placeholder with the URI you copied.

2. **Run the backup**  
   ```shell
   pg_dump \
     --format=custom \       # compressed, non‐plain text
     --blobs \               # include large objects
     --verbose \             # show detailed progress
     --file=backup_$(date +%F).dump \
     "$DATABASE_URL"
   ```  
   • This creates `backup_YYYY‑MM‑DD.dump` in your current folder.  
   • If it prompts for a password, re‑paste your `<db_pass>`.

3. **Verify the backup**  
   ```shell
   ls -lh backup_*.dump
   ```  
   You should see a file of several megabytes, depending on your data size.

---  
## C. Restoring with `pg_restore`  
You have two main options: restore into a **new** database, or **overwrite** your existing one.

### C.1 Restore into a fresh database  
1. **Create a new database** (you must have permissions):  
   ```shell
   psql "$DATABASE_URL" \
     --command="CREATE DATABASE ${NEW_DB:=restored_db};"
   ```  
   Or, if your user cannot create DBs on Supabase, restore into a local or staging instance.

2. **Restore**  
   ```shell
   pg_restore \
     --verbose \
     --clean \               # drop objects before recreating
     --no-owner \            # don’t attempt to set ownership
     --dbname=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/${NEW_DB} \
     backup_2023-08-02.dump
   ```  
   Adjust `NEW_DB` and filename to match.

3. **Connect & verify**  
   ```shell
   psql postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/${NEW_DB}
   \dt    -- list tables
   ```

### C.2 Overwrite the existing database  
> **Warning**: This will erase all current data!  
```shell
pg_restore \
  --verbose \
  --clean \
  --no-owner \
  --dbname="$DATABASE_URL" \
  backup_2023-08-02.dump
```  
After it finishes, your Supabase DB will match exactly what was in that dump.

---

## D. (Optional) Supabase CLI Workflow  
If you installed the Supabase CLI, you can also do:

1. **Link your project**  
   ```shell
   supabase login
   supabase link --project-ref <YOUR_PROJECT_REF>
   ```

2. **Dump**  
   ```shell
   supabase db dump --file supabase-backup.sql
   ```  
   This produces a plain‑text SQL dump.

3. **Restore**  
   ```shell
   supabase db restore supabase-backup.sql
   ```  

---

## E. Automating Your Backups  
1. **Write a simple shell script** (e.g. `~/backup-scripts/supabase-backup.sh`):  
   ```bash
   #!/usr/bin/env bash
   export DATABASE_URL="postgresql://<...>"
   pg_dump --format=custom --verbose \
     --file="$HOME/backups/supabase-$(date +%F).dump" \
     "$DATABASE_URL"
   ```  
2. **Make it executable**  
   ```shell
   chmod +x ~/backup-scripts/supabase-backup.sh
   ```  
3. **Schedule with `cron`**  
   ```shell
   crontab -e
   ```  
   Add a line to run nightly at 2 AM:  
   ```
   0 2 * * * /Users/you/backup-scripts/supabase-backup.sh >> /Users/you/backup-scripts/log.txt 2>&1
   ```  

---

## F. Best Practices & Tips  
- **Store backups off‑site** (e.g. push to a private GitHub repo, S3, or another cloud).  
- **Encrypt sensitive dumps** if they contain production‐level PII.  
- **Test your restore** occasionally on a staging environment to ensure your scripts work.  
- Supabase Free includes automatic daily snapshots (7-day retention), but they are not directly downloadable—owning your backups gives you extra safety.

With these steps in place you’ll have full control over backing up and restoring your Supabase PostgreSQL database, even on the free tier—no paid subscription required. Good luck!

---

_**User**_

This command `supabase db dump --file supabase-backup.sql` is just backing up the schema and not any data inside the DB. How do we backup the Data?

---

_**Assistant**_

There are two simple ways to get your _data_ out of Supabase/Postgres. Supabase’s own `db dump` command today only emits the _schema_ (it calls `pg_dump --schema-only` under the hood), so if you want the actual row‑data you must either:

  1. Use the Supabase CLI as a thin wrapper over `pg_dump` and pass it the “data‐only” switch, or  
  2. Bypass the CLI and call `pg_dump` yourself.  

–––  
## 1) Using Supabase CLI + extra pg_dump args  

Because `supabase db dump` lets you pass any extra `pg_dump` flags after `--`, you can tell it to only pull data:

```bash
# 1. export your DATABASE_URL if you haven’t already
export DATABASE_URL="postgresql

---



---

