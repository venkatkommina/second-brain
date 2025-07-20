# Second Brain 🧠

A personal knowledge management system that helps you organize, store, and manage your digital content with markdown notes support.

## Features

- 📚 **Content Management**: Store and organize articles, videos, images, and audio content
- 🏷️ **Tagging System**: Categorize your content with custom tags
- 📝 **Markdown Notes**: Add rich markdown notes to any content item
- 🔍 **Search & Filter**: Quickly find content by title or tags
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔐 **Secure Authentication**: JWT-based user authentication (might add oauth)
- 🔗 **Content Sharing**: Share your brain publicly with generated links
- 🎨 **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering
- **@uiw/react-md-editor** - Markdown editing

### Shared

- **Zod** - Schema validation
- **TypeScript** - Type safety across the stack

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas or MongoDB Compass)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/venkatkommina/second-brain.git
   cd second-brain
   ```

2. **Install dependencies for all packages**

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Install common package dependencies
   cd ../common
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   DB_URI=mongodb://localhost:27017/second-brain
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. **Build the common package**

   ```bash
   cd common
   npx tsc
   ```

5. **Start MongoDB (optional - just start a cluster online)**

   Make sure MongoDB is running on your system. If using local MongoDB:

   ```bash
   mongod
   ```

6. **Start the development servers**

   **Terminal 1 - Start the backend:**

   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Start the frontend:**

   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**

   Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
second-brain/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utility functions
│   │   └── ...
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── db.ts          # Database models and connection
│   │   ├── routes.ts      # API routes
│   │   └── index.ts       # Server entry point
│   └── package.json
├── common/                 # Shared types and validation
│   ├── src/
│   │   └── index.ts       # Zod schemas and types
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication

- `POST /api/v1/signup` - Register a new user
- `POST /api/v1/signin` - Login user

### Content Management

- `GET /api/v1/content` - Get user's content
- `POST /api/v1/content` - Create new content
- `PUT /api/v1/content/:id` - Update content
- `DELETE /api/v1/content/:id` - Delete content

### Tags

- `GET /api/v1/tag` - Get all tags
- `POST /api/v1/tag` - Create new tag

### Brain Sharing

- `POST /api/v1/brain/share` - Generate/toggle shareable link
- `GET /api/v1/brain/:hash` - Access shared brain

## Usage

1. **Sign up** for a new account or **sign in** to existing one
2. **Add content** by clicking the "Add Content" button
3. **Fill in the details**: title, link, content type, and optional markdown notes
4. **Tag your content** for better organization
5. **Search and filter** your content on the dashboard
6. **Share your brain** publicly using the share feature

```

## Future Roadmap

### 🤖 AI Integration

- **AI Chat Interface**: Add an intelligent assistant that can analyze and discuss your saved content
- **Content Summarization**: Automatically generate summaries for articles and videos
- **Smart Tagging**: AI-powered automatic tag suggestions based on content
- **Knowledge Connections**: Discover relationships between different pieces of content
- **Question Answering**: Ask questions about your saved content and get intelligent answers

## License

This project is licensed under the MIT License.

---

**Built with ❤️ by [Venkat](https://github.com/venkatkommina)**
```
