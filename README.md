# Second Brain 🧠

A modern knowledge management system built with React, Node.js, and MongoDB. Organize, tag, and share your digital content with powerful search and sharing capabilities.

## ✨ Features

- 📚 **Content Management**: Store articles, videos, images, and audio files
- 🏷️ **Smart Tagging**: Organize content with tags and filters
- 📝 **Markdown Notes**: Add rich text notes to any content
- 🔍 **Powerful Search**: Find content quickly with search functionality
- 🔗 **Public Sharing**: Share your knowledge base publicly
- 🎨 **Modern UI**: Clean, responsive design with dark/light mode
- 🔐 **Secure Auth**: Email/password and Google OAuth authentication
- 📧 **Password Reset**: Email-based password recovery system
- 🛡️ **Security**: CORS and security headers (Helmet)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/venkatkommina/second-brain.git
cd second-brain
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install

# Install common package dependencies (if needed)
cd ../common && npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update with your configuration
```

4. **Start development servers**

**Option 1: Start both servers with one command (from root directory)**
```bash
npm run dev
```

**Option 2: Start servers individually**
```bash
# Start server only
npm run dev:server

# Start client only  
npm run dev:client
```

**Option 3: Manual start (separate terminals)**
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client  
cd client && npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📖 Documentation
- [Environment Variables](./server/.env.example)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation  
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Headless UI** for components
- **React Hook Form** for forms
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for OAuth
- **Nodemailer** for emails
- **Helmet** for security headers


## 🔧 Configuration

### Required Environment Variables

#### Server (.env)
```bash
NODE_ENV=development
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/secondbrain
CLIENT_URL=http://localhost:5173
```

#### Client (.env)  
```bash
VITE_API_URL=http://localhost:3001/api/v1
```

See `.env.example` files for complete configuration options.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by second brain methodology
- Uses open source libraries and tools
