## SpecStory

## Debugging Form Submission Issue (31/03/2025, 21:29:48)

_**User**_

@AddMatchForm.tsx @FormFieldSelect.tsx @dashboard.tsx 

I am noticing a issue where, when I submit the form `AddMatchDetailsForm`, in the action on the page @dashboard.tsx , I am seeing only the values entered on text input. The value selected on @FormFieldSelect.tsx is not showing inside action.

When I debugged, I can see the value of `matchId` is correctly saved in hook-form state. Can you help me debug this issue?

---

_**Assistant**_

I can help you debug this issue with the form submission not including the value from your `FormFieldSelect` component.

The primary problem is that your `AddMatchDetailsForm` component doesn't actually handle form submission correctly. You have a submit button, but no `onSubmit` handler to process the form data.

Here's how to fix it:

```tsx:app/components/common/AddMatchForm.tsx
// ... existing code ...

export function AddMatchDetailsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matchId: "",
      User1: "",
      User2: "",
      User3: "",
      User4: "",
      User5: "",
    },
  });

  console.log("watch", form.watch());
  
  // Add this function to handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create a FormData object
    const formData = new FormData();
    
    // Add all form values to the FormData object
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Submit the form - assuming you're using this in a route with action
    submit(formData, { method: "post" });
  }

  return (
    <Form {...form}>
      {/* Add the onSubmit handler to the form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldSelect form={form} name="matchId" />
        <div className="mt-8 mb-8 border-t border-gray-200 border-dashed"></div>
        
        {/* ... existing code for other form fields ... */}
        
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

You need to make two key changes:

1. Import the `submit` function from `react-router-dom` at the top of your file:
```tsx
import { submit } from "react-router-dom";
```

2. Create an `onSubmit` handler function that:
   - Takes the form values
   - Creates a FormData object 
   - Adds all your form values to it
   - Uses the React Router `submit` function to post the data

Also, your current form is using the Shadcn UI `Form` component, but you still need to add an actual HTML `<form>` element inside it with the proper `onSubmit` handler.

The reason your select value isn't showing up in the action is that you're not properly collecting and submitting the form data - there's no connection between your React Hook Form state and what gets sent to your action.

---

_**User**_

When I start the app, I am getting this message in terminal, What does it mean and is it good to have 21 connections?

---

_**Assistant**_

This message "Starting a sqlite pool with 21 connections" means that your application is initializing a connection pool for SQLite database with 21 connections available.

## What is a connection pool?

A connection pool is a cache of database connections maintained by your application. Instead of opening and closing a new database connection each time one is needed (which is resource-intensive), your app maintains a pool of open connections that can be reused.

## About the 21 connections:

The number 21 is likely a default value set by whatever database library you're using (possibly Prisma, based on your code). Connection pools typically include:

- A minimum number of idle connections kept open
- A maximum number of connections the pool can grow to
- A default initial size (in this case, 21)

## Is 21 connections good?

Whether 21 connections is appropriate depends on your specific application:

### Advantages:
- For a moderately busy application, this should be plenty of connections to handle concurrent requests
- Having multiple connections ready allows your app to handle simultaneous database operations

### Potential concerns:
- For very small applications with few users, this might be more connections than needed
- For extremely high-traffic applications, you might eventually need more

## Considerations:

1. **Memory usage**: Each connection consumes some memory, so having too many for your needs wastes resources.

2. **SQLite specifics**: Unlike client-server databases, SQLite is a file-based database. It has some limitations with concurrent writes (though reads can happen concurrently).

3. **Application needs**: The ideal number depends on how many concurrent database operations your application performs.

For most small to medium applications, the default of 21 connections is perfectly reasonable and shouldn't cause any issues. You generally only need to adjust this if you're experiencing specific performance problems or resource constraints.

Unless you're seeing errors or performance issues, you can safely leave this at the default setting.

---

_**User**_

@package.json  How do I build and test this app locally before deploying? This is a react-router web app which has features like server side render, etc. How to build and preview the app in my local? 

It has dependencies like BE with Prisma and SQLiteDB. Tell me the steps, on how to proceed.

---

_**Assistant**_



---

_****_

# Building and Testing Your React Router App Locally

Based on your package.json, you're using React Router v7 with server-side rendering capabilities, Prisma, and SQLite. Here's how to set up, build, and test your app locally:

## Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

## Step 1: Install Dependencies

First, install all the required dependencies:

```bash
npm install
# or
yarn
```

## Step 2: Set Up the Database

Since you're using Prisma with SQLite:

1. Generate the Prisma client based on your schema:
   ```bash
   npx prisma generate
   ```

2. Create and migrate your database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Seed your database with initial data:
   ```bash
   npx prisma db seed
   ```

## Step 3: Development Mode

For active development with hot reloading:

```bash
npm run dev
# or
yarn dev
```

This will start the development server, typically at http://localhost:3000.

## Step 4: Build for Production

When you want to create a production build:

```bash
npm run build
# or
yarn build
```

## Step 5: Preview Production Build

To preview the production build locally:

```bash
npm run start
# or
yarn start
```

This will serve your built application using the React Router serve functionality.

## Step 6: Type Checking

Before deploying, it's good to run type checking:

```bash
npm run typecheck
# or
yarn typecheck
```

## Additional Tips

1. **Database Management**: You can inspect your SQLite database using:
   ```bash
   npx prisma studio
   ```

2. **Environment Variables**: Create a `.env` file in your project root for any environment-specific configurations. The database connection string is likely defined there.

3. **Debugging**: Check the terminal output for any errors during startup. The React Router dev server provides useful error messages.

4. **Database Path**: By default, SQLite will create a file in your project directory. Make sure the directory is writable.

This should give you a complete workflow for developing, building, and testing your application locally before deployment.

---

_**User**_

I am getting this warning after running build and start command.  Please help me fix this

---

_**Assistant**_

# Fixing the Missing Module Error

The error you're seeing indicates that the build process didn't create the expected output files. The server is looking for `/build/server/index.js`, but this file doesn't exist.

## The Problem

The error message shows that when you run `npm run start` (which executes `react-router-serve ./build/server/index.js`), the system can't find the server build file. This typically happens when:

1. The build command didn't run successfully
2. The build output directory structure is different than expected
3. There might be an issue with your build configuration

## Solution Steps

### 1. Ensure the build runs successfully

First, make sure your build command completes without errors:

```bash
npm run build
```

Look for any error messages or warnings during the build process.

### 2. Check the build output directory

After running build, examine your project directory to verify what was actually created:

```bash
ls -la build/
```

See if there's a `server` directory inside `build`. If the directory structure is different, you'll need to update your start script.

### 3. Update your start script if necessary

If your build is creating files in a different location, update the `start` script in your package.json to point to the correct location:

```json:package.json
"scripts": {
  "start": "react-router-serve ./build/server/index.js" // Change this path if needed
}
```

### 4. Try the complete build and start sequence

```bash
# Clean any previous build artifacts
rm -rf build/

# Run the build
npm run build

# Check what was created
ls -la build/

# Start the server with the correct path
npm run start
```

### 5. Check for issues with React Router configuration

Make sure your React Router setup includes proper server export configuration. In your main server file (often index.js or server.js), ensure you're correctly exporting the handler for server-side rendering.

## If Problems Persist

1. **Try with dev mode first**: Run `npm run dev` to make sure the application can run in development mode.

2. **Check React Router version compatibility**: Ensure all your `@react-router` packages

---



---

