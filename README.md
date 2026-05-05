# ProjectM - Project Management Web App

ProjectM is a modern, responsive project management application featuring role-based access control (Admin/Member) and a Kanban-style task tracking board. Built with a stunning glassmorphic UI.

## Features
- **Authentication**: Secure Signup and Login using NextAuth and bcryptjs.
- **Role-Based Access Control**: Admins can manage projects and assign tasks. Members can update their assigned tasks.
- **Projects**: Create projects and assign members.
- **Kanban Board**: Drag-and-drop task tracking with "Todo", "In Progress", and "Done" statuses.
- **Dashboard**: Quick overview of statistics and upcoming tasks.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Vanilla CSS (Glassmorphism)
- **Backend**: Next.js API Routes (REST APIs)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials Provider)

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Railway (Mandatory Instructions)

1. **Push to GitHub**: Make sure this project is pushed to a public or private GitHub repository.
2. **Create Railway Account**: Go to [Railway.app](https://railway.app/) and sign in with GitHub.
3. **Add Database**: 
   - Click "New Project" -> "Provision MongoDB".
   - This creates a MongoDB instance for your app.
4. **Deploy Application**:
   - In your Railway project, click "New" -> "GitHub Repo" and select your repository.
   - Railway will automatically detect the Next.js framework.
5. **Set Environment Variables**:
   - Go to your Next.js application service in Railway -> "Variables" tab.
   - Add `NEXTAUTH_SECRET` (generate a random string).
   - Add `NEXTAUTH_URL` (set this to the public domain Railway generates for your app).
   - Add `MONGODB_URI`. You can use Railway's reference variables to automatically link the MongoDB plugin you created in step 3 (e.g., `${{MongoDB.MONGO_URL}}`).
6. **Generate Domain**:
   - In your Next.js service settings, click "Generate Domain" to get your live URL!

## Demo Video
*(Please replace this section with your 2-5 min demo video link prior to submission)*
