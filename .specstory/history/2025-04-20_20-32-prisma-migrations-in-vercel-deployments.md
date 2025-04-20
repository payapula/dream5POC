## SpecStory

## Prisma Migrations in Vercel Deployments (20/04/2025, 20:32:43)

_**User**_

@package.json  I am deploying this react-router app in vercel. Do I have to run npx prisma migrate deploy during each deployment? Please advice.

---

_**Assistant**_

Let me help you understand how to handle Prisma migrations during Vercel deployments.

Looking at your `package.json`, I notice you have a build script that includes Prisma migrations:

```json
"build": "npx prisma generate && npx prisma migrate deploy && react-router build"
```

For Vercel deployments with Prisma, here's what you need to know:

1. **Prisma Generate**: Yes, you should keep `prisma generate` in your build script as it generates the Prisma Client, which is necessary for your application to interact with the database.

2. **Prisma Migrate Deploy**: Running `prisma migrate deploy` during each deployment can be risky in a production environment for several reasons:
   - If you have multiple deployments running simultaneously, it could cause race conditions
   - It can lead to deployment failures if the database is temporarily unavailable
   - It's generally considered a better practice to manage database migrations separately from application deployments

Here are my recommendations:

1. Modify your build script to only include necessary build steps:
```json
"build": "npx prisma generate && react-router build"
```

2. Handle database migrations separately through one of these approaches:
   - Run migrations manually using your production database URL
   - Use a CI/CD pipeline step dedicated to database migrations
   - Use Vercel's database helpers or deployment hooks if needed

3. For Vercel specifically, you can:
   - Set up a deployment hook that runs migrations before the actual deployment
   - Use Vercel's environment variables to store your database URL securely
   - Consider using Vercel's integration with database providers if available

The safer approach is to manage your database migrations as a separate process from your application deployments. This gives you more control and reduces the risk of deployment issues caused by database operations.

Would you like me to provide more specific guidance on setting up a separate migration process for your Vercel deployments?

---

_**User**_

What does prisma migrate deploy command will do? Can you please explain me in simple terms? 

---

_**Assistant**_

Let me explain `prisma migrate deploy` in simple terms.

`prisma migrate deploy` is like a "database update installer" that does three main things:

1. **Applies Pending Migrations**: 
   - It looks at your migration history folder (`prisma/migrations`)
   - Checks which migrations haven't been applied to your database yet
   - Applies these pending migrations in the correct order
   - Think of it like installing updates that are waiting in queue

2. **Production-Safe**:
   - It's designed to be safe for production environments
   - Only runs migrations that have been committed to your migration history
   - Won't create new migrations (unlike `prisma migrate dev`)
   - Won't modify your schema or generate new migrations

3. **Keeps Track**:
   - Maintains a record of which migrations have been applied
   - Uses a special table in your database (usually called `_prisma_migrations`)
   - This helps prevent running the same migration twice

Here's a real-world analogy:
- Think of your database as a house
- Your migrations are like renovation plans
- `prisma migrate deploy` is like a contractor who:
  - Looks at all your approved renovation plans
  - Checks which renovations haven't been done yet
  - Executes only those pending renovations
  - Keeps a checklist of completed work

Important to note:
- It won't make any schema changes that aren't already in your migration files
- It's meant to be predictable and safe
- If a migration fails, it will roll back that specific migration to keep your database consistent

Would you like me to explain any specific aspect of this command in more detail?

---



---

