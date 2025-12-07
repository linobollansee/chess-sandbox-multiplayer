// Require the Express web framework module to create and configure the web server
const express = require("express");
// Create an Express application instance that will handle HTTP requests and middleware
const app = express();
// Create an HTTP server using Node's built-in http module, wrapping the Express app to enable Socket.IO functionality
const http = require("http").createServer(app);
// Initialize Socket.IO for real-time bidirectional event-based communication, attaching it to the HTTP server
const io = require("socket.io")(http);
// Destructure and import the Pool class from the pg (node-postgres) library for PostgreSQL database connection pooling
const { Pool } = require("pg");

// Configure Express middleware to serve static files (HTML, CSS, JS, images) from the "public" directory to clients
app.use(express.static("public"));

// Define an object containing different chess variant configurations with preset piece positions for game initialization
const variants = {
  // The "standard" property contains the traditional chess starting position with all pieces in their standard locations
  standard: {
    // Array of piece objects, each representing a chess piece with id, type, color, and starting position properties
    pieces: [
      // Black rook piece with unique identifier "br1" positioned on a8 (top-left corner from white's perspective)
      { id: "br1", type: "rook", color: "black", position: "a8" },
      // Black knight piece with unique identifier "bn1" positioned on b8 (second square from left on back rank)
      { id: "bn1", type: "knight", color: "black", position: "b8" },
      // Black bishop piece with unique identifier "bb1" positioned on c8 (third square from left on back rank)
      { id: "bb1", type: "bishop", color: "black", position: "c8" },
      // Black queen piece with unique identifier "bq" positioned on d8 (fourth square from left on back rank)
      { id: "bq", type: "queen", color: "black", position: "d8" },
      // Black king piece with unique identifier "bk" positioned on e8 (fifth square from left on back rank, center file)
      { id: "bk", type: "king", color: "black", position: "e8" },
      // Black bishop piece with unique identifier "bb2" positioned on f8 (sixth square from left on back rank)
      { id: "bb2", type: "bishop", color: "black", position: "f8" },
      // Black knight piece with unique identifier "bn2" positioned on g8 (seventh square from left on back rank)
      { id: "bn2", type: "knight", color: "black", position: "g8" },
      // Black rook piece with unique identifier "br2" positioned on h8 (top-right corner from white's perspective)
      { id: "br2", type: "rook", color: "black", position: "h8" },
      // Black pawn piece with unique identifier "bp1" positioned on a7 (leftmost pawn on seventh rank)
      { id: "bp1", type: "pawn", color: "black", position: "a7" },
      // Black pawn piece with unique identifier "bp2" positioned on b7 (second pawn from left on seventh rank)
      { id: "bp2", type: "pawn", color: "black", position: "b7" },
      // Black pawn piece with unique identifier "bp3" positioned on c7 (third pawn from left on seventh rank)
      { id: "bp3", type: "pawn", color: "black", position: "c7" },
      // Black pawn piece with unique identifier "bp4" positioned on d7 (fourth pawn from left on seventh rank)
      { id: "bp4", type: "pawn", color: "black", position: "d7" },
      // Black pawn piece with unique identifier "bp5" positioned on e7 (fifth pawn from left on seventh rank, center file)
      { id: "bp5", type: "pawn", color: "black", position: "e7" },
      // Black pawn piece with unique identifier "bp6" positioned on f7 (sixth pawn from left on seventh rank)
      { id: "bp6", type: "pawn", color: "black", position: "f7" },
      // Black pawn piece with unique identifier "bp7" positioned on g7 (seventh pawn from left on seventh rank)
      { id: "bp7", type: "pawn", color: "black", position: "g7" },
      // Black pawn piece with unique identifier "bp8" positioned on h7 (rightmost pawn on seventh rank)
      { id: "bp8", type: "pawn", color: "black", position: "h7" },
      // White rook piece with unique identifier "wr1" positioned on a1 (bottom-left corner from white's perspective)
      { id: "wr1", type: "rook", color: "white", position: "a1" },
      // White knight piece with unique identifier "wn1" positioned on b1 (second square from left on first rank)
      { id: "wn1", type: "knight", color: "white", position: "b1" },
      // White bishop piece with unique identifier "wb1" positioned on c1 (third square from left on first rank)
      { id: "wb1", type: "bishop", color: "white", position: "c1" },
      // White queen piece with unique identifier "wq" positioned on d1 (fourth square from left on first rank)
      { id: "wq", type: "queen", color: "white", position: "d1" },
      // White king piece with unique identifier "wk" positioned on e1 (fifth square from left on first rank, center file)
      { id: "wk", type: "king", color: "white", position: "e1" },
      // White bishop piece with unique identifier "wb2" positioned on f1 (sixth square from left on first rank)
      { id: "wb2", type: "bishop", color: "white", position: "f1" },
      // White knight piece with unique identifier "wn2" positioned on g1 (seventh square from left on first rank)
      { id: "wn2", type: "knight", color: "white", position: "g1" },
      // White rook piece with unique identifier "wr2" positioned on h1 (bottom-right corner from white's perspective)
      { id: "wr2", type: "rook", color: "white", position: "h1" },
      // White pawn piece with unique identifier "wp1" positioned on a2 (leftmost pawn on second rank)
      { id: "wp1", type: "pawn", color: "white", position: "a2" },
      // White pawn piece with unique identifier "wp2" positioned on b2 (second pawn from left on second rank)
      { id: "wp2", type: "pawn", color: "white", position: "b2" },
      // White pawn piece with unique identifier "wp3" positioned on c2 (third pawn from left on second rank)
      { id: "wp3", type: "pawn", color: "white", position: "c2" },
      // White pawn piece with unique identifier "wp4" positioned on d2 (fourth pawn from left on second rank)
      { id: "wp4", type: "pawn", color: "white", position: "d2" },
      // White pawn piece with unique identifier "wp5" positioned on e2 (fifth pawn from left on second rank, center file)
      { id: "wp5", type: "pawn", color: "white", position: "e2" },
      // White pawn piece with unique identifier "wp6" positioned on f2 (sixth pawn from left on second rank)
      { id: "wp6", type: "pawn", color: "white", position: "f2" },
      // White pawn piece with unique identifier "wp7" positioned on g2 (seventh pawn from left on second rank)
      { id: "wp7", type: "pawn", color: "white", position: "g2" },
      // White pawn piece with unique identifier "wp8" positioned on h2 (rightmost pawn on second rank)
      { id: "wp8", type: "pawn", color: "white", position: "h2" },
    ],
  },
};

// Create a new PostgreSQL connection pool for managing database connections efficiently
// Using let instead of const to allow setting to null if database connection fails
let pool = new Pool({
  // Set the database connection string from environment variable (used for production deployment like Heroku)
  connectionString: process.env.DATABASE_URL,
  // Enable SSL connection if DATABASE_URL is set (production), with rejectUnauthorized false for compatibility
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Async function to initialize the database schema by creating the board_state table if it doesn't exist
async function initDatabase() {
  // Try-catch block to handle any database connection or query errors gracefully
  try {
    // Execute SQL query to create board_state table with id, state (JSONB), and timestamp columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        state JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database connected successfully");
  } catch (err) {
    // Log warning that database is unavailable (app will continue without persistence)
    console.warn("Database unavailable - board state will not persist across restarts");
    // Set pool to null to prevent further connection attempts
    pool = null;
  }
}

// Async function to load the persisted board state from the database, or return default if none exists
async function loadBoardState() {
  // Skip database query if pool is null (database unavailable)
  if (!pool) {
    return JSON.parse(JSON.stringify(variants.standard));
  }
  // Try-catch block to handle database query errors when loading saved state
  try {
    // Query the database for the board state with id = 1 (single-row pattern for global state)
    const result = await pool.query(
      "SELECT state FROM board_state WHERE id = 1"
    );
    // Check if any rows were returned from the query
    if (result.rows.length > 0) {
      // Return the state property from the first (and only) row as the loaded board state
      return result.rows[0].state;
    }
  } catch (err) {}
  // If no saved state exists or query failed, return a deep copy of the standard chess variant
  // JSON.parse(JSON.stringify()) is used to create a complete clone without object references
  return JSON.parse(JSON.stringify(variants.standard));
}

// Async function to persist the current in-memory board state to the PostgreSQL database
async function saveBoardState() {
  // Skip database save if pool is null (database unavailable)
  if (!pool) return;
  // Try-catch block to handle any errors during the database save operation
  try {
    // Execute an UPSERT query (INSERT or UPDATE) to save the current board state
    await pool.query(
      `INSERT INTO board_state (id, state, updated_at)
       VALUES (1, $1, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET state = $1, updated_at = CURRENT_TIMESTAMP`,
      // Pass the current boardState as a parameterized query argument to prevent SQL injection
      [boardState]
    );
  } catch (err) {}
}

// Declare a variable to store the current board state in memory (will be initialized on server start)
let boardState;

// Register a WebSocket connection event handler that fires whenever a new client connects
io.on("connection", (socket) => {
  // Extract the client's IP address from the x-forwarded-for header (for proxies) or direct connection
  const userIP =
    // Split the x-forwarded-for header by comma and take the first IP (original client IP)
    socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
    // If no x-forwarded-for header, use the direct socket connection address
    socket.handshake.address;
  // Log the connection event with the socket ID and IP address to the console for monitoring
  console.log("User connected:", socket.id, "IP:", userIP);

  // Emit the current board state to the newly connected client so they can initialize their UI
  socket.emit("boardState", boardState);

  // Register event handler for "movePiece" events sent from clients when they move a piece
  socket.on("movePiece", (data) => {
    // Destructure the pieceId and newPosition properties from the received data object
    const { pieceId, newPosition } = data;

    // Validate that newPosition matches the chess notation pattern (a-h for columns, 1-8 for rows)
    if (!/^[a-h][1-8]$/.test(newPosition)) {
      // If validation fails, exit early without processing the move (security measure)
      return;
    }

    // Find the piece object in the boardState.pieces array that matches the provided pieceId
    const piece = boardState.pieces.find((p) => p.id === pieceId);
    // Check if the piece was found in the board state
    if (piece) {
      // Update the piece's position property to the new validated position
      piece.position = newPosition;

      // Broadcast the piece move to ALL connected clients (including the sender) so everyone sees the update
      io.emit("pieceMove", { pieceId, newPosition });
      // Persist the updated board state to the database for recovery after server restart
      saveBoardState();
    }
  });

  // Register event handler for "removePiece" events when a client wants to delete a piece from the board
  socket.on("removePiece", (pieceId) => {
    // Filter the pieces array to exclude the piece with the matching pieceId, effectively removing it
    boardState.pieces = boardState.pieces.filter((p) => p.id !== pieceId);
    // Broadcast the piece removal to all connected clients so they remove it from their UI
    io.emit("pieceRemoved", pieceId);
    // Persist the updated board state to the database
    saveBoardState();
  });

  // Register event handler for "createPiece" events when a client creates a new piece from the palette
  socket.on("createPiece", (data) => {
    // Define an array of all valid piece types including standard and fairy chess pieces
    const validTypes = [
      "king",
      "queen",
      "rook",
      "bishop",
      "knight",
      "pawn",
      "elephant",
      "giraffe",
      "unicorn",
      "zebra",
      "mann",
      "centaur",
      "commoner",
      "champion",
      "wizard",
      "fool",
      "archbishop",
      "chancellor",
      "amazon",
      "dragon",
      "ship",
    ];
    // Define an array of all valid piece colors (white, black, and special for custom pieces)
    const validColors = ["white", "black", "special"];

    // Validate that the piece type and color are in the allowed lists (security check)
    if (!validTypes.includes(data.type) || !validColors.includes(data.color)) {
      // If validation fails, exit early without creating the piece
      return;
    }

    // Validate that the position follows chess notation format (a-h for columns, 1-8 for rows)
    if (!/^[a-h][1-8]$/.test(data.position)) {
      // If position validation fails, exit early without creating the piece
      return;
    }

    // Create a new piece object with all required properties
    const newPiece = {
      // Generate a unique ID by combining first letter of color, first letter of type, and current timestamp
      id: data.color[0] + data.type[0] + Date.now(),
      // Set the piece type from the validated data
      type: data.type,
      // Set the piece color from the validated data
      color: data.color,
      // Set the piece position from the validated data
      position: data.position,
    };
    // Add the newly created piece to the boardState.pieces array
    boardState.pieces.push(newPiece);
    // Broadcast the new piece to all connected clients so they render it in their UI
    io.emit("pieceAdded", newPiece);
    // Persist the updated board state to the database
    saveBoardState();
  });

  // Register event handler for "resetBoard" events when a client wants to reset to standard chess setup
  socket.on("resetBoard", () => {
    // Replace the current board state with a deep copy of the standard variant (reset to initial position)
    boardState = JSON.parse(JSON.stringify(variants.standard));
    // Broadcast the new board state to all connected clients so they reset their UI
    io.emit("boardState", boardState);
    // Persist the reset board state to the database
    saveBoardState();
  });

  // Register event handler for "disconnect" events when a client closes their connection
  socket.on("disconnect", () => {
    // Extract the client's IP address from headers or direct connection (same as connection handler)
    const userIP =
      socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
      socket.handshake.address;
    // Log the disconnection event with socket ID and IP address to the console for monitoring
    console.log("User disconnected:", socket.id, "IP:", userIP);
  });
});

// Define the server port, using environment variable PORT (for cloud deployment) or defaulting to 3000
const PORT = process.env.PORT || 3000;

// Async function to initialize the database and start the HTTP/WebSocket server
async function startServer() {
  // Call initDatabase to ensure the database table exists before the server accepts connections
  await initDatabase();
  // Load the persisted board state from the database (or default) and store it in memory
  boardState = await loadBoardState();

  // Start the HTTP server listening on the specified PORT
  http.listen(PORT, () => {
    // Log a message to the console indicating the server is running and where to access it
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Invoke the startServer function to kick off the entire server initialization and startup process
startServer();
