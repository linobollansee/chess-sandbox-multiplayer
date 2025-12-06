const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

// Serve static files
app.use(express.static("public"));

// Variant presets
const variants = {
  standard: {
    pieces: [
      { id: "br1", type: "rook", color: "black", position: "a8" },
      { id: "bn1", type: "knight", color: "black", position: "b8" },
      { id: "bb1", type: "bishop", color: "black", position: "c8" },
      { id: "bq", type: "queen", color: "black", position: "d8" },
      { id: "bk", type: "king", color: "black", position: "e8" },
      { id: "bb2", type: "bishop", color: "black", position: "f8" },
      { id: "bn2", type: "knight", color: "black", position: "g8" },
      { id: "br2", type: "rook", color: "black", position: "h8" },
      { id: "bp1", type: "pawn", color: "black", position: "a7" },
      { id: "bp2", type: "pawn", color: "black", position: "b7" },
      { id: "bp3", type: "pawn", color: "black", position: "c7" },
      { id: "bp4", type: "pawn", color: "black", position: "d7" },
      { id: "bp5", type: "pawn", color: "black", position: "e7" },
      { id: "bp6", type: "pawn", color: "black", position: "f7" },
      { id: "bp7", type: "pawn", color: "black", position: "g7" },
      { id: "bp8", type: "pawn", color: "black", position: "h7" },
      { id: "wr1", type: "rook", color: "white", position: "a1" },
      { id: "wn1", type: "knight", color: "white", position: "b1" },
      { id: "wb1", type: "bishop", color: "white", position: "c1" },
      { id: "wq", type: "queen", color: "white", position: "d1" },
      { id: "wk", type: "king", color: "white", position: "e1" },
      { id: "wb2", type: "bishop", color: "white", position: "f1" },
      { id: "wn2", type: "knight", color: "white", position: "g1" },
      { id: "wr2", type: "rook", color: "white", position: "h1" },
      { id: "wp1", type: "pawn", color: "white", position: "a2" },
      { id: "wp2", type: "pawn", color: "white", position: "b2" },
      { id: "wp3", type: "pawn", color: "white", position: "c2" },
      { id: "wp4", type: "pawn", color: "white", position: "d2" },
      { id: "wp5", type: "pawn", color: "white", position: "e2" },
      { id: "wp6", type: "pawn", color: "white", position: "f2" },
      { id: "wp7", type: "pawn", color: "white", position: "g2" },
      { id: "wp8", type: "pawn", color: "white", position: "h2" },
    ],
  },
  horde: {
    pieces: [
      { id: "br1", type: "rook", color: "black", position: "a8" },
      { id: "bn1", type: "knight", color: "black", position: "b8" },
      { id: "bb1", type: "bishop", color: "black", position: "c8" },
      { id: "bq", type: "queen", color: "black", position: "d8" },
      { id: "bk", type: "king", color: "black", position: "e8" },
      { id: "bb2", type: "bishop", color: "black", position: "f8" },
      { id: "bn2", type: "knight", color: "black", position: "g8" },
      { id: "br2", type: "rook", color: "black", position: "h8" },
      { id: "bp1", type: "pawn", color: "black", position: "a7" },
      { id: "bp2", type: "pawn", color: "black", position: "b7" },
      { id: "bp3", type: "pawn", color: "black", position: "c7" },
      { id: "bp4", type: "pawn", color: "black", position: "d7" },
      { id: "bp5", type: "pawn", color: "black", position: "e7" },
      { id: "bp6", type: "pawn", color: "black", position: "f7" },
      { id: "bp7", type: "pawn", color: "black", position: "g7" },
      { id: "bp8", type: "pawn", color: "black", position: "h7" },
      // White horde (36 pawns)
      { id: "wp1", type: "pawn", color: "white", position: "a1" },
      { id: "wp2", type: "pawn", color: "white", position: "b1" },
      { id: "wp3", type: "pawn", color: "white", position: "c1" },
      { id: "wp4", type: "pawn", color: "white", position: "d1" },
      { id: "wp5", type: "pawn", color: "white", position: "e1" },
      { id: "wp6", type: "pawn", color: "white", position: "f1" },
      { id: "wp7", type: "pawn", color: "white", position: "g1" },
      { id: "wp8", type: "pawn", color: "white", position: "h1" },
      { id: "wp9", type: "pawn", color: "white", position: "a2" },
      { id: "wp10", type: "pawn", color: "white", position: "b2" },
      { id: "wp11", type: "pawn", color: "white", position: "c2" },
      { id: "wp12", type: "pawn", color: "white", position: "d2" },
      { id: "wp13", type: "pawn", color: "white", position: "e2" },
      { id: "wp14", type: "pawn", color: "white", position: "f2" },
      { id: "wp15", type: "pawn", color: "white", position: "g2" },
      { id: "wp16", type: "pawn", color: "white", position: "h2" },
      { id: "wp17", type: "pawn", color: "white", position: "a3" },
      { id: "wp18", type: "pawn", color: "white", position: "b3" },
      { id: "wp19", type: "pawn", color: "white", position: "c3" },
      { id: "wp20", type: "pawn", color: "white", position: "d3" },
      { id: "wp21", type: "pawn", color: "white", position: "e3" },
      { id: "wp22", type: "pawn", color: "white", position: "f3" },
      { id: "wp23", type: "pawn", color: "white", position: "g3" },
      { id: "wp24", type: "pawn", color: "white", position: "h3" },
      { id: "wp25", type: "pawn", color: "white", position: "a4" },
      { id: "wp26", type: "pawn", color: "white", position: "b4" },
      { id: "wp27", type: "pawn", color: "white", position: "c4" },
      { id: "wp28", type: "pawn", color: "white", position: "d4" },
      { id: "wp29", type: "pawn", color: "white", position: "e4" },
      { id: "wp30", type: "pawn", color: "white", position: "f4" },
      { id: "wp31", type: "pawn", color: "white", position: "g4" },
      { id: "wp32", type: "pawn", color: "white", position: "h4" },
      { id: "wp33", type: "pawn", color: "white", position: "b5" },
      { id: "wp34", type: "pawn", color: "white", position: "c5" },
      { id: "wp35", type: "pawn", color: "white", position: "f5" },
      { id: "wp36", type: "pawn", color: "white", position: "g5" },
    ],
  },
};

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        state JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

// Load board state from database or use default
async function loadBoardState() {
  try {
    const result = await pool.query(
      "SELECT state FROM board_state WHERE id = 1"
    );
    if (result.rows.length > 0) {
      return result.rows[0].state;
    }
  } catch (err) {
    console.error("Error loading board state:", err);
  }
  return JSON.parse(JSON.stringify(variants.standard));
}

// Save board state to database
async function saveBoardState() {
  try {
    await pool.query(
      `INSERT INTO board_state (id, state, updated_at)
       VALUES (1, $1, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET state = $1, updated_at = CURRENT_TIMESTAMP`,
      [boardState]
    );
  } catch (err) {
    console.error("Error saving board state:", err);
  }
}

// Store the current board state
let boardState;

// WebSocket connection
io.on("connection", (socket) => {
  const userIP =
    socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
    socket.handshake.address;
  console.log("User connected:", socket.id, "IP:", userIP);

  // Send current board state to new user
  socket.emit("boardState", boardState);

  // Broadcast user count to all clients
  io.emit("userCount", io.engine.clientsCount);

  // Handle piece movement
  socket.on("movePiece", (data) => {
    const { pieceId, newPosition } = data;

    // Update board state
    const piece = boardState.pieces.find((p) => p.id === pieceId);
    if (piece) {
      piece.position = newPosition;

      // Broadcast to all clients
      io.emit("pieceMove", { pieceId, newPosition });
      saveBoardState();
    }
  });

  // Handle piece removal
  socket.on("removePiece", (pieceId) => {
    boardState.pieces = boardState.pieces.filter((p) => p.id !== pieceId);
    io.emit("pieceRemoved", pieceId);
    saveBoardState();
  });

  // Handle adding piece back
  socket.on("addPiece", (piece) => {
    boardState.pieces.push(piece);
    io.emit("pieceAdded", piece);
    saveBoardState();
  });

  // Handle creating new piece
  socket.on("createPiece", (data) => {
    const newPiece = {
      id: data.color[0] + data.type[0] + Date.now(),
      type: data.type,
      color: data.color,
      position: data.position,
    };
    boardState.pieces.push(newPiece);
    io.emit("pieceAdded", newPiece);
    saveBoardState();
  });

  // Handle reset board
  socket.on("resetBoard", () => {
    boardState = JSON.parse(JSON.stringify(variants.standard));
    io.emit("boardState", boardState);
    saveBoardState();
  });

  socket.on("disconnect", () => {
    const userIP =
      socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
      socket.handshake.address;
    console.log("User disconnected:", socket.id, "IP:", userIP);
    // Broadcast updated user count
    io.emit("userCount", io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
  await initDatabase();
  boardState = await loadBoardState();

  http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
