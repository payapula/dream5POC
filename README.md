# Welcome to Dream5!

## What is Dream5?

Dream5 is a mobile-only web application that allows users to bet on the teams to get scores.

## Tech Stack

- React Router v7
- Tailwind CSS
- Shadcn UI
- Recharts for the beautiful charts
- Vite for the build
- Prisma as the ORM
- Supabase as the database
- Vercel for hosting and deployment

## BackUp and Restore the database

1. Install postgres@15

```bash
brew install postgresql@15
```

2. Add it to your PATH and use the correct version of pg_dump:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
```

3. Backup the database

Use the hostname starting with `aws-` and port number `6543` for supabase database.

```bash
pg_dump -h [host] -p [port] -U [user] -d [database] -F p > backup.sql
```

This will ask for password. Enter the password for the user.

4. Restore the database

```bash
psql -h [host] -p [port] -U [user] -d [database] -f backup.sql
```

Built with ❤️ using React Router.
