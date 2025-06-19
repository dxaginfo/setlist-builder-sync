# Setlist Builder + Sync

A comprehensive web application for musicians to create, share, and synchronize setlists across devices and band members.

![Setlist Builder Logo](https://via.placeholder.com/1200x600?text=Setlist+Builder+%2B+Sync)

## 🎵 Overview

Setlist Builder + Sync is designed to streamline the process of preparing for rehearsals and performances by providing a collaborative platform with real-time updates and role-based access to musical materials. Musicians can create and manage setlists, attach various media files to songs, and ensure that all band members always have access to the most up-to-date information.

## ✨ Features

### Setlist Management
- Create, edit, and delete setlists
- Reorder songs using drag-and-drop functionality
- Add notes to setlists (venue information, special requirements)
- Filter and search functionality for setlists

### Song Management
- Add songs to a database with metadata (title, artist, key, BPM, duration)
- Attach lyrics, chord charts, tablature
- Upload and attach audio/video files for reference
- Search and filter song database

### Real-time Synchronization
- Cloud-based storage for instant updates across devices
- Offline mode with synchronization upon reconnection
- Change tracking and version history

### Collaboration Features
- Band/group creation and management
- Invite band members via email
- Role-based permissions (admin, editor, viewer)
- Activity feed showing recent changes

### Performance Mode
- Distraction-free setlist view for live performances
- Auto-scrolling lyrics/chord sheets
- Timer/countdown between songs
- Quick navigation between songs

### Export & Sharing
- Export setlists to PDF, CSV formats
- Share setlists via unique links
- Print-friendly formatting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/dxaginfo/setlist-builder-sync.git
cd setlist-builder-sync
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create environment variables
```bash
# In the server directory
cp .env.example .env
# Edit the .env file with your MongoDB connection string and other configurations
```

4. Start the development servers
```bash
# Start backend server
cd server
npm run dev

# In another terminal, start frontend server
cd client
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## 🏗️ Tech Stack

### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **UI Library**: Material UI
- **Real-time Updates**: Socket.io (client)
- **Media Handling**: howler.js (audio), react-pdf (PDF rendering)
- **Drag and Drop**: react-beautiful-dnd

### Backend
- **Framework**: Node.js with Express
- **API Architecture**: RESTful with GraphQL for complex queries
- **Real-time Server**: Socket.io (server)
- **Authentication**: JWT with OAuth integration

### Database
- **Primary Database**: MongoDB
- **Caching**: Redis

### Storage
- **File Storage**: AWS S3
- **CDN**: Cloudfront

## 📁 Project Structure

```
setlist-builder-sync/
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and reducers
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main application component
│   └── package.json       # Frontend dependencies
│
├── server/                # Backend Node.js application
│   ├── src/               # Source code
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── app.js         # Express application
│   └── package.json       # Backend dependencies
│
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Bands
- `GET /api/bands` - Get all bands for current user
- `POST /api/bands` - Create a new band
- `GET /api/bands/:id` - Get band by ID
- `PUT /api/bands/:id` - Update band
- `DELETE /api/bands/:id` - Delete band

### Setlists
- `GET /api/setlists` - Get all setlists for current user
- `POST /api/setlists` - Create a new setlist
- `GET /api/setlists/:id` - Get setlist by ID
- `PUT /api/setlists/:id` - Update setlist
- `DELETE /api/setlists/:id` - Delete setlist
- `GET /api/bands/:bandId/setlists` - Get all setlists for a band

### Songs
- `GET /api/songs` - Get all songs for current user
- `POST /api/songs` - Create a new song
- `GET /api/songs/:id` - Get song by ID
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song
- `GET /api/bands/:bandId/songs` - Get all songs for a band

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions, feedback, or support, please open an issue in the GitHub repository or contact the project maintainer.

---

Built with ❤️ for musicians and bands.