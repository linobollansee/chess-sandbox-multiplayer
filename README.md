# Chess Sandbox - Multiplayer

A simple multiplayer chess sandbox where anyone with the link can move pieces freely on a shared board. Features special animal pieces and real-time synchronization.

## Features

- Real-time multiplayer synchronization via WebSocket
- Drag-and-drop piece movement
- Chess pieces + special animal pieces (scary and friendly)
- Create unlimited pieces from the piece palette
- Remove pieces with right-click
- Reset board for all users
- Persistent board state across server restarts

## Deploy to Render

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Name: `chess-sandbox-db`
4. Select **Free** plan
5. Click **Create Database**
6. Wait for database to provision

### 2. Deploy Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `chess-sandbox`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Click **Advanced** → **Add Environment Variable**:
   - Leave empty for now (will link database next)
5. Click **Create Web Service**

### 3. Link Database to Web Service

1. Go to your web service dashboard
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. From the dropdown, select your PostgreSQL database
5. This automatically sets `DATABASE_URL`
6. Your service will redeploy with database connected

### 4. Access Your App

- Your app will be available at: `https://chess-sandbox.onrender.com` (or your chosen name)
- Share this link with anyone to play together
- Board state persists for 90 days (Render's free PostgreSQL limit)

## Local Development

### Prerequisites

- Node.js 14 or higher
- PostgreSQL (optional - works without for testing)

### Setup

```bash
# Install dependencies
npm install

# Start server (runs on http://localhost:3000)
npm start
```

Without a database, the board state will reset on server restart but works fine for local testing.

### With Local PostgreSQL

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/chess_sandbox"

# Start server
npm start
```

## How to Play

1. **Move pieces**: Drag pieces from board squares to other squares
2. **Create pieces**: Drag from "Chess Pieces" or "Special Pieces" palette to the board
3. **Remove pieces**: Right-click any piece on the board
4. **Reset board**: Click "Reset Board" button (affects all users)

## Technical Details

- **Backend**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL (for persistence)
- **Real-time**: WebSocket connections for multiplayer sync
- **Frontend**: Vanilla JavaScript + HTML5 Drag & Drop API

## Free Tier Limitations

- **Render Web Service**: Spins down after 15 minutes of inactivity (~30-50 second cold start)
- **Render PostgreSQL**: Expires after 90 days (can recreate for free)
- **Solution**: For production use, upgrade to Render's paid tier ($7/month) for always-on service

## License

MIT
