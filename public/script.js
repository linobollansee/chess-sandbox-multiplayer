// Initialize Socket.IO client connection to the server, establishing bidirectional communication channel
const socket = io();

// Define object mapping piece types and colors to their corresponding SVG image file paths
const pieceImages = {
  // White pieces sub-object containing paths to all light-colored piece SVG files
  white: {
    // Path to white king SVG image file in the images/pieces directory
    king: "/images/pieces/chess_king_light.svg",
    // Path to white queen SVG image file
    queen: "/images/pieces/chess_queen_light.svg",
    // Path to white rook SVG image file
    rook: "/images/pieces/chess_rook_light.svg",
    // Path to white bishop SVG image file
    bishop: "/images/pieces/chess_bishop_light.svg",
    // Path to white knight SVG image file
    knight: "/images/pieces/chess_knight_light.svg",
    // Path to white pawn SVG image file
    pawn: "/images/pieces/chess_pawn_light.svg",
    // Path to white elephant fairy chess piece SVG image file
    elephant: "/images/pieces/chess_elephant_light.svg",
    // Path to white giraffe fairy chess piece SVG image file
    giraffe: "/images/pieces/chess_giraffe_light.svg",
    // Path to white unicorn fairy chess piece SVG image file
    unicorn: "/images/pieces/chess_unicorn_light.svg",
    // Path to white zebra fairy chess piece SVG image file
    zebra: "/images/pieces/chess_zebra_light.svg",
    // Path to white mann fairy chess piece SVG image file
    mann: "/images/pieces/chess_mann_light.svg",
    // Path to white centaur fairy chess piece SVG image file
    centaur: "/images/pieces/chess_centaur_light.svg",
    // Path to white commoner fairy chess piece SVG image file
    commoner: "/images/pieces/chess_commoner_light.svg",
    // Path to white champion fairy chess piece SVG image file
    champion: "/images/pieces/chess_champion_light.svg",
    // Path to white wizard fairy chess piece SVG image file
    wizard: "/images/pieces/chess_wizard_light.svg",
    // Path to white fool fairy chess piece SVG image file
    fool: "/images/pieces/chess_fool_light.svg",
    // Path to white archbishop fairy chess piece SVG image file
    archbishop: "/images/pieces/chess_archbishop_light.svg",
    // Path to white chancellor fairy chess piece SVG image file
    chancellor: "/images/pieces/chess_chancellor_light.svg",
    // Path to white amazon fairy chess piece SVG image file
    amazon: "/images/pieces/chess_amazon_light.svg",
    // Path to white dragon fairy chess piece SVG image file
    dragon: "/images/pieces/chess_dragon_light.svg",
    // Path to white ship fairy chess piece SVG image file
    ship: "/images/pieces/chess_ship_light.svg",
  },
  // Black pieces sub-object containing paths to all dark-colored piece SVG files
  black: {
    // Path to black king SVG image file
    king: "/images/pieces/chess_king_dark.svg",
    // Path to black queen SVG image file
    queen: "/images/pieces/chess_queen_dark.svg",
    // Path to black rook SVG image file
    rook: "/images/pieces/chess_rook_dark.svg",
    // Path to black bishop SVG image file
    bishop: "/images/pieces/chess_bishop_dark.svg",
    // Path to black knight SVG image file
    knight: "/images/pieces/chess_knight_dark.svg",
    // Path to black pawn SVG image file
    pawn: "/images/pieces/chess_pawn_dark.svg",
    // Path to black elephant fairy chess piece SVG image file
    elephant: "/images/pieces/chess_elephant_dark.svg",
    // Path to black giraffe fairy chess piece SVG image file
    giraffe: "/images/pieces/chess_giraffe_dark.svg",
    // Path to black unicorn fairy chess piece SVG image file
    unicorn: "/images/pieces/chess_unicorn_dark.svg",
    // Path to black zebra fairy chess piece SVG image file
    zebra: "/images/pieces/chess_zebra_dark.svg",
    // Path to black mann fairy chess piece SVG image file
    mann: "/images/pieces/chess_mann_dark.svg",
    // Path to black centaur fairy chess piece SVG image file
    centaur: "/images/pieces/chess_centaur_dark.svg",
    // Path to black commoner fairy chess piece SVG image file
    commoner: "/images/pieces/chess_commoner_dark.svg",
    // Path to black champion fairy chess piece SVG image file
    champion: "/images/pieces/chess_champion_dark.svg",
    // Path to black wizard fairy chess piece SVG image file
    wizard: "/images/pieces/chess_wizard_dark.svg",
    // Path to black fool fairy chess piece SVG image file
    fool: "/images/pieces/chess_fool_dark.svg",
    // Path to black archbishop fairy chess piece SVG image file
    archbishop: "/images/pieces/chess_archbishop_dark.svg",
    // Path to black chancellor fairy chess piece SVG image file
    chancellor: "/images/pieces/chess_chancellor_dark.svg",
    // Path to black amazon fairy chess piece SVG image file
    amazon: "/images/pieces/chess_amazon_dark.svg",
    // Path to black dragon fairy chess piece SVG image file
    dragon: "/images/pieces/chess_dragon_dark.svg",
    // Path to black ship fairy chess piece SVG image file
    ship: "/images/pieces/chess_ship_dark.svg",
  },
};

// Initialize board state object with empty pieces array to store current game state in memory
let boardState = { pieces: [] };
// Variable to track the currently selected piece ID on the board (null when no piece selected)
let selectedPiece = null;
// Variable to track the selected piece type from the palette (null when no palette piece selected)
let selectedPaletteType = null;
// Variable to track the selected piece color from the palette (null when no palette piece selected)
let selectedPaletteColor = null;
// Variable to store the timer ID for long-press detection on touch devices (null when no press active)
let longPressTimer = null;
// Variable to store reference to the ghost piece DOM element for preview (null when no ghost shown)
let ghostPiece = null;
// Variable to track which piece ID is being long-pressed on touch devices (null when no long press)
let longPressPieceId = null;
// Boolean flag to detect if the device supports touch input (checks for touch events or touch points)
let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// Add event listener to disable right-click context menu globally across the entire document
document.addEventListener("contextmenu", (e) => {
  // Prevent the default context menu from appearing when right-clicking
  e.preventDefault();
});

// Function to initialize the chessboard by creating 64 square divs in an 8x8 grid
function initBoard() {
  // Get reference to the chessboard container element by its ID
  const board = document.getElementById("chessboard");
  // Clear any existing content inside the chessboard (useful for reinitialization)
  board.innerHTML = "";

  // Outer loop iterating through ranks (rows) 8 down to 1 (chess notation has 8 at top for black)
  for (let row = 8; row >= 1; row--) {
    // Inner loop iterating through files (columns) a through h
    for (let col of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      // Create a new div element to represent a chess square
      const square = document.createElement("div");
      // Add "square" CSS class to apply square styles
      square.className = "square";
      // Set data-position attribute with chess notation (e.g., "a1", "h8") for identifying squares
      square.dataset.position = col + row;

      // Calculate if square should be light or dark based on row and column sum parity
      // Even sum = light square, odd sum = dark square (standard checkerboard pattern)
      const isLight = (row + col.charCodeAt(0)) % 2 === 0;
      // Add appropriate color class (either "light" or "dark") to the square
      square.classList.add(isLight ? "light" : "dark");

      // Check if device supports touch input to attach appropriate event handlers
      if (isTouchDevice) {
        // For touch devices: use touchend event for immediate response without 300ms click delay
        // passive: false allows preventDefault() to be called in the handler
        square.addEventListener("touchend", handleSquareClick, {
          passive: false,
        });
      } else {
        // For desktop devices: use standard click event with mouse
        square.addEventListener("click", handleSquareClick);
        // Add mouseenter event for hover effects (showing ghost pieces on desktop)
        square.addEventListener("mouseenter", handleSquareHover);
        // Add mouseleave event to remove ghost pieces when mouse leaves square
        square.addEventListener("mouseleave", handleSquareLeave);
      }
      // Append the configured square div to the chessboard container
      board.appendChild(square);
    }
  }
}

// Function to render all pieces from boardState onto the visual board
function renderPieces() {
  // Select all existing piece elements on the board (excluding palette pieces) and remove them
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.remove());

  // Iterate through each piece in the current board state
  boardState.pieces.forEach((piece) => {
    // Only render pieces that are on the board (not in the "offboard" position)
    if (piece.position !== "offboard") {
      // Call renderPiece to create and display this piece on the board
      renderPiece(piece);
    }
  });
}

// Function to initialize the piece palette UI with standard and fairy chess pieces
function initPalette() {
  // Get reference to the piece-palette container element
  const palette = document.getElementById("piece-palette");
  // Clear any existing palette content
  palette.innerHTML = "";

  // Define array of standard chess piece types that appear in normal chess games
  const standardPieces = ["king", "queen", "rook", "bishop", "knight", "pawn"];
  // Define array of fairy chess piece types (non-standard pieces with unique movement patterns)
  const fairyPieces = [
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
  // Define array of available piece colors
  const colors = ["white", "black"];

  // Iterate through each color to create rows of standard pieces
  colors.forEach((color) => {
    // Create a new div element to hold one row of pieces
    const row = document.createElement("div");
    // Add "piece-row" class to apply row layout styles
    row.className = "piece-row";

    // Iterate through each standard piece type to create palette pieces
    standardPieces.forEach((type) => {
      // Create a new div element to represent a palette piece
      const paletteItemElement = document.createElement("div");
      // Add multiple CSS classes for styling and functionality
      paletteItemElement.className = `piece palette-piece ${color} offboard-piece`;
      // Store the piece type in a data attribute for later retrieval
      paletteItemElement.dataset.type = type;
      // Store the piece color in a data attribute for later retrieval
      paletteItemElement.dataset.color = color;

      // Create an img element to display the piece SVG
      const img = document.createElement("img");
      // Set the image source to the corresponding SVG file path
      img.src = pieceImages[color][type];
      // Set alt text for accessibility (describes image for screen readers)
      img.alt = `${color} ${type}`;
      // Append the img element inside the piece div
      paletteItemElement.appendChild(img);
      // Set tooltip text that appears on hover (e.g., "white king")
      paletteItemElement.title = `${color} ${type}`;

      // Attach appropriate event handler based on device type
      if (isTouchDevice) {
        // For touch devices: use touchend event with passive: false
        paletteItemElement.addEventListener("touchend", handlePaletteClick, {
          passive: false,
        });
      } else {
        // For desktop: use standard click event
        paletteItemElement.addEventListener("click", handlePaletteClick);
      }

      // Append the completed palette piece to the row
      row.appendChild(paletteItemElement);
    });

    // Append the completed row to the palette container
    palette.appendChild(row);
  });

  // Define how many pieces should appear per row for fairy pieces (for better organization)
  const piecesPerRow = 5;
  // Initialize empty array to hold all fairy pieces with their colors
  let allFairyPieces = [];

  // Create array combining all fairy piece types with both colors
  colors.forEach((color) => {
    // For each color, iterate through all fairy piece types
    fairyPieces.forEach((type) => {
      // Add an object with type and color properties to the array
      allFairyPieces.push({ type, color });
    });
  });

  // Organize fairy pieces into rows with specified pieces per row
  for (let i = 0; i < allFairyPieces.length; i += piecesPerRow) {
    // Create a new div element for each row
    const row = document.createElement("div");
    // Add "piece-row" class for row layout styles
    row.className = "piece-row";

    // Extract a slice of pieces for this row (up to piecesPerRow pieces)
    const rowPieces = allFairyPieces.slice(i, i + piecesPerRow);
    // Iterate through pieces in this row
    rowPieces.forEach(({ type, color }) => {
      // Create a new div element for the palette piece
      const paletteItemElement = document.createElement("div");
      // Add classes including "fairy-piece" to distinguish from standard pieces
      paletteItemElement.className = `piece palette-piece ${color} offboard-piece fairy-piece`;
      // Store piece type in data attribute
      paletteItemElement.dataset.type = type;
      // Store piece color in data attribute
      paletteItemElement.dataset.color = color;

      // Create img element for the piece SVG
      const img = document.createElement("img");
      // Set image source path
      img.src = pieceImages[color][type];
      // Set alt text for accessibility
      img.alt = `${color} ${type}`;
      // Append img to piece div
      paletteItemElement.appendChild(img);
      // Set tooltip text
      paletteItemElement.title = `${color} ${type}`;

      // Attach event handler based on device type
      if (isTouchDevice) {
        // Touch device: use touchend event
        paletteItemElement.addEventListener("touchend", handlePaletteClick, {
          passive: false,
        });
      } else {
        // Desktop: use click event
        paletteItemElement.addEventListener("click", handlePaletteClick);
      }

      // Append piece to row
      row.appendChild(paletteItemElement);
    });

    // Append completed row to palette
    palette.appendChild(row);
  }
}

// Function to render a single piece on the board at its position
function renderPiece(piece) {
  // Find the square element that matches the piece's position using data-position attribute
  const square = document.querySelector(`[data-position="${piece.position}"]`);
  // If square doesn't exist (invalid position), exit early
  if (!square) return;

  // Create a new div element to represent the piece visually
  const boardPieceElement = document.createElement("div");
  // Add CSS classes for styling (piece class and color-specific class)
  boardPieceElement.className = `piece ${piece.color}`;
  // Create an img element to display the piece image
  const img = document.createElement("img");
  // Set the image source to the corresponding SVG file based on color and type
  img.src = pieceImages[piece.color][piece.type];
  // Set alt text for accessibility
  img.alt = `${piece.color} ${piece.type}`;
  // Append the image to the piece div
  boardPieceElement.appendChild(img);

  // Store the piece ID in a data attribute for identification in event handlers
  boardPieceElement.dataset.id = piece.id;

  // Attach appropriate event handlers based on device type
  if (isTouchDevice) {
    // Touch devices: attach touch-specific event handlers
    // touchstart: fires when user touches the piece
    boardPieceElement.addEventListener("touchstart", handlePieceTouchStart, {
      passive: false,
    });
    // touchend: fires when user lifts finger from the piece
    boardPieceElement.addEventListener("touchend", handlePieceTouchEnd, {
      passive: false,
    });
    // touchmove: fires when user drags finger while touching the piece
    boardPieceElement.addEventListener("touchmove", handlePieceTouchMove, {
      passive: false,
    });
  } else {
    // Desktop devices: attach mouse event handlers
    // click: for selecting/moving pieces
    boardPieceElement.addEventListener("click", handlePieceClick);
    // dblclick: for double-clicking to delete pieces
    boardPieceElement.addEventListener("dblclick", handlePieceDoubleClick);
  }

  // Append the configured piece element to its square on the board
  square.appendChild(boardPieceElement);
}

// Function to handle clicks on palette pieces (selecting a piece type to place)
function handlePaletteClick(e) {
  // Stop event from bubbling up to parent elements
  e.stopPropagation();
  // Prevent default browser behavior (important for touch devices)
  e.preventDefault();

  // Get the palette piece element (might need to traverse up if clicked on img child)
  const paletteItemElement = e.target.classList.contains("palette-piece")
    ? e.target // If clicked directly on palette-piece div
    : e.target.closest(".palette-piece"); // If clicked on child element like img

  // If no palette element found, exit early
  if (!paletteItemElement) return;

  // Extract the piece type from the data attribute
  const clickedType = paletteItemElement.dataset.type;
  // Extract the piece color from the data attribute
  const clickedColor = paletteItemElement.dataset.color;

  // Check if user clicked on the already-selected palette piece (toggle off behavior)
  if (
    selectedPaletteType === clickedType &&
    selectedPaletteColor === clickedColor
  ) {
    // Remove "selected" class from all palette pieces (deselect all)
    document
      .querySelectorAll(".palette-piece")
      .forEach((p) => p.classList.remove("selected"));
    // Remove any ghost piece preview from the board
    removeGhostPiece();
    // Clear the selected palette type variable
    selectedPaletteType = null;
    // Clear the selected palette color variable
    selectedPaletteColor = null;
    // Exit early after deselection
    return;
  }

  // Remove "selected" class from all palette pieces (clear previous selection)
  document
    .querySelectorAll(".palette-piece")
    .forEach((p) => p.classList.remove("selected"));
  // Remove "selected" class from all board pieces (switching from board piece to palette)
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.classList.remove("selected"));

  // On desktop, remove any ghost piece when selecting new palette piece
  if (!isTouchDevice) {
    removeGhostPiece();
  }

  // Add "selected" class to the clicked palette piece
  paletteItemElement.classList.add("selected");
  // Store the selected piece type
  selectedPaletteType = clickedType;
  // Store the selected piece color
  selectedPaletteColor = clickedColor;
  // Clear any selected board piece (can't have both palette and board piece selected)
  selectedPiece = null;
}

// Function to handle clicks on pieces already on the board
function handlePieceClick(e) {
  // Stop event from propagating to parent elements (like squares)
  e.stopPropagation();
  // Extract the piece ID from the data attribute of the clicked element
  const pieceId = e.target.dataset.id;

  // Clear selection state from all palette pieces
  document
    .querySelectorAll(".palette-piece")
    .forEach((p) => p.classList.remove("selected"));
  // Clear selection state from all board pieces
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.classList.remove("selected"));

  // On desktop, remove any ghost piece previews
  if (!isTouchDevice) {
    removeGhostPiece();
  }

  // Clear palette selection state
  selectedPaletteType = null;
  selectedPaletteColor = null;

  // Check if user clicked on the already-selected piece (toggle off behavior)
  if (selectedPiece === pieceId) {
    // Deselect the piece
    selectedPiece = null;
  } else if (selectedPiece) {
    // If a different piece is already selected, capture the clicked piece
    // Find the target piece data in board state
    const targetPiece = boardState.pieces.find((p) => p.id === pieceId);
    // Verify target piece exists and is on the board (not offboard)
    if (targetPiece && targetPiece.position !== "offboard") {
      // Store the target piece's position (where selected piece will move)
      const newPosition = targetPiece.position;
      // Emit event to server to remove the captured piece
      socket.emit("removePiece", pieceId);
      // Emit event to server to move the selected piece to the target position
      socket.emit("movePiece", { pieceId: selectedPiece, newPosition });
      // Clear the selected piece after move
      selectedPiece = null;
      // Remove "selected" class from all pieces
      document
        .querySelectorAll(".piece")
        .forEach((p) => p.classList.remove("selected"));
    }
  } else {
    // No piece was selected, so select this piece
    selectedPiece = pieceId;
    // Add "selected" class to visually highlight the selected piece
    e.target.classList.add("selected");
  }
}

// Function to handle double-clicks on pieces (to delete them)
function handlePieceDoubleClick(e) {
  // Stop event from propagating to parent elements
  e.stopPropagation();
  // Extract the piece ID from the clicked element's data attribute
  const pieceId = e.target.dataset.id;

  // Show browser confirmation dialog asking user to confirm deletion
  if (confirm("Delete this piece?")) {
    // If user confirms, emit event to server to remove the piece
    socket.emit("removePiece", pieceId);
  }

  // Clear any selected piece state
  selectedPiece = null;
  // Remove any ghost piece previews
  removeGhostPiece();
  // Remove "selected" class from all pieces
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));
}

// Function to handle the start of a touch event on a piece (long-press for delete on mobile)
function handlePieceTouchStart(e) {
  // Prevent default touch behavior (prevents scrolling, zooming, etc.)
  e.preventDefault();
  // Try to get piece ID from target element or traverse up to find piece element
  const pieceId = e.target.dataset.id || e.target.closest(".piece")?.dataset.id;
  // If no piece ID found, exit early
  if (!pieceId) return;

  // Remove any existing ghost pieces before starting long-press
  removeGhostPiece();

  // Store the piece ID that's being long-pressed
  longPressPieceId = pieceId;

  // Set a timer to trigger after 800ms for long-press detection
  longPressTimer = setTimeout(() => {
    // If device supports vibration API, provide haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50 milliseconds
    }

    // Show confirmation dialog to delete the piece
    if (confirm("Delete this piece?")) {
      // If confirmed, emit event to server to remove the piece
      socket.emit("removePiece", pieceId);
      // Clear selected piece state
      selectedPiece = null;
      // Remove any ghost pieces
      removeGhostPiece();
      // Remove "selected" class from all pieces
      document
        .querySelectorAll(".piece")
        .forEach((p) => p.classList.remove("selected"));
    }

    // Clear the long-press piece ID
    longPressPieceId = null;
  }, 800); // 800ms long-press threshold
}

// Function to handle the end of a touch event on a piece (finger lifted)
function handlePieceTouchEnd(e) {
  // Prevent default touch behavior
  e.preventDefault();
  // Stop event from bubbling to parent elements
  e.stopPropagation();

  // Remove any ghost piece previews
  removeGhostPiece();

  // Check if long-press timer is still active (means this was a tap, not a long-press)
  if (longPressTimer) {
    // Clear the timeout to prevent long-press action from firing
    clearTimeout(longPressTimer);
    // Reset the timer variable
    longPressTimer = null;

    // Get the piece ID that was tapped
    const pieceId = longPressPieceId;
    // Clear the long-press piece ID
    longPressPieceId = null;

    // If a valid piece was tapped, handle it like a click event
    if (pieceId) {
      // Clear selection from all palette pieces
      document
        .querySelectorAll(".palette-piece")
        .forEach((p) => p.classList.remove("selected"));
      // Clear selection from all board pieces
      document
        .querySelectorAll(".piece:not(.palette-piece)")
        .forEach((p) => p.classList.remove("selected"));

      // Clear palette selection state
      selectedPaletteType = null;
      selectedPaletteColor = null;

      // Check if tapped piece is already selected (toggle off)
      if (selectedPiece === pieceId) {
        // Deselect the piece
        selectedPiece = null;
      } else if (selectedPiece) {
        // If another piece is selected, capture the tapped piece
        // Find the target piece in board state
        const targetPiece = boardState.pieces.find((p) => p.id === pieceId);
        // Verify target exists and is on board
        if (targetPiece && targetPiece.position !== "offboard") {
          // Get the target's position
          const newPosition = targetPiece.position;
          // Emit event to remove captured piece
          socket.emit("removePiece", pieceId);
          // Emit event to move selected piece to target position
          socket.emit("movePiece", { pieceId: selectedPiece, newPosition });
          // Clear selected piece
          selectedPiece = null;
        }
      } else {
        // No piece was selected, so select this piece
        selectedPiece = pieceId;
        // Add "selected" class to the piece element
        e.target.closest(".piece")?.classList.add("selected");
      }
    }
  } else {
    // Long-press completed, just clear the piece ID
    longPressPieceId = null;
  }
}

// Function to handle touch move events (finger dragging on piece)
function handlePieceTouchMove(e) {
  // Prevent default touch behavior
  e.preventDefault();
  // If long-press timer is active, cancel it (user is scrolling, not long-pressing)
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  // Clear the long-press piece ID
  longPressPieceId = null;
}

// Function to handle clicks on board squares (for moving pieces or placing from palette)
function handleSquareClick(e) {
  // On touch devices, prevent default behavior and stop propagation
  if (isTouchDevice) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Initialize variable to store the target square element
  let targetSquare = null;

  // Check if the clicked element is a square
  if (e.target.classList.contains("square")) {
    targetSquare = e.target; // Direct click on square
  } else if (e.target.closest) {
    // If clicked on a piece or img inside a square, find the square
    const piece = e.target.closest(".piece:not(.palette-piece)");
    if (
      piece &&
      piece.parentElement &&
      piece.parentElement.classList.contains("square")
    ) {
      // Piece found, get its parent square
      targetSquare = piece.parentElement;
    } else {
      // Try to find closest square element
      targetSquare = e.target.closest(".square");
    }
  }

  // If no valid square found, exit early
  if (!targetSquare || !targetSquare.dataset.position) return;

  // Extract the position from the square's data attribute
  const newPosition = targetSquare.dataset.position;

  // On desktop, remove ghost pieces after click
  if (!isTouchDevice) {
    removeGhostPiece();
  }

  // Check if user is placing a piece from the palette
  if (selectedPaletteType && selectedPaletteColor) {
    // Find if a piece already exists at the target position
    const existingPiece = boardState.pieces.find(
      (p) => p.position === newPosition
    );

    // Only create new piece if square is empty
    if (!existingPiece) {
      // Emit event to server to create the new piece
      socket.emit("createPiece", {
        type: selectedPaletteType,
        color: selectedPaletteColor,
        position: newPosition,
      });
    }
    // Exit after attempting to place from palette
    return;
  }

  // If no piece is selected, exit early
  if (!selectedPiece) return;

  // Find if a piece already exists at target position (excluding the selected piece itself)
  const existingPiece = boardState.pieces.find(
    (p) => p.position === newPosition && p.id !== selectedPiece
  );

  // If a piece exists at target position, capture it
  if (existingPiece) {
    // Emit event to remove the captured piece
    socket.emit("removePiece", existingPiece.id);
  }

  // Emit event to move the selected piece to the new position
  socket.emit("movePiece", { pieceId: selectedPiece, newPosition });

  // Clear selected piece state
  selectedPiece = null;
  // Remove "selected" class from all pieces
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));
}

// Function to handle mouse hover over squares (for showing ghost piece previews on desktop)
function handleSquareHover(e) {
  // Ghost pieces are disabled on touch devices, so exit early
  if (isTouchDevice) return;

  // Get the target square element (might be the target itself or need to find it)
  const targetSquare = e.target.classList.contains("square")
    ? e.target
    : e.target.closest(".square");

  // If no valid square found, exit early
  if (!targetSquare) return;

  // Extract the position from the square's data attribute
  const position = targetSquare.dataset.position;

  // Remove any existing ghost pieces before showing new one
  removeGhostPiece();

  // Check if user has a palette piece selected
  if (selectedPaletteType && selectedPaletteColor) {
    // Find if a piece already exists at this position
    const existingPiece = boardState.pieces.find(
      (p) => p.position === position
    );

    // Only show ghost piece if square is empty
    if (!existingPiece) {
      // Show ghost piece preview of the palette selection
      showGhostPiece(targetSquare, selectedPaletteType, selectedPaletteColor);
    }
    // Exit after handling palette ghost
    return;
  }

  // Check if user has a board piece selected
  if (selectedPiece) {
    // Find the selected piece data in board state
    const piece = boardState.pieces.find((p) => p.id === selectedPiece);
    // If piece found, show ghost preview at hover position
    if (piece) {
      showGhostPiece(targetSquare, piece.type, piece.color);
    }
  }
}

// Function to handle mouse leaving a square (remove ghost piece preview)
function handleSquareLeave(e) {
  // Remove any ghost piece when mouse leaves the square
  removeGhostPiece();
}

// Function to create and display a ghost piece preview on a square
function showGhostPiece(square, type, color) {
  // Never show ghost pieces on touch devices (prevents visual clutter)
  if (isTouchDevice) return;

  // Create a new div element for the ghost piece
  const ghostPieceElement = document.createElement("div");
  // Add classes for ghost piece styling (includes opacity and pointer-events)
  ghostPieceElement.className = `piece ghost-piece ${color}`;
  // Create an img element for the piece image
  const img = document.createElement("img");
  // Set the image source to the corresponding SVG file
  img.src = pieceImages[color][type];
  // Set alt text for accessibility
  img.alt = `${color} ${type}`;
  // Append the image to the ghost piece div
  ghostPieceElement.appendChild(img);

  // Append the ghost piece to the target square
  square.appendChild(ghostPieceElement);
  // Store reference to the ghost piece for later removal
  ghostPiece = ghostPieceElement;
}

// Function to remove any ghost piece previews from the board
function removeGhostPiece() {
  // If a ghost piece reference exists, remove it from DOM
  if (ghostPiece) {
    ghostPiece.remove();
    // Clear the reference
    ghostPiece = null;
  }
  // Also query for any ghost-piece elements and remove them (fallback cleanup)
  document.querySelectorAll(".ghost-piece").forEach((el) => el.remove());
}

// Register Socket.IO event handler for receiving full board state from server
socket.on("boardState", (state) => {
  // Update local board state with the received state
  boardState = state;
  // Re-render all pieces on the board
  renderPieces();
});

// Register Socket.IO event handler for when a piece moves
socket.on("pieceMove", ({ pieceId, newPosition }) => {
  // Find the piece in local board state
  const piece = boardState.pieces.find((p) => p.id === pieceId);
  // If piece found, update its position
  if (piece) {
    piece.position = newPosition;

    // Find the piece's DOM element
    const boardPieceElement = document.querySelector(`[data-id="${pieceId}"]`);
    // If found, remove it from its old position
    if (boardPieceElement) {
      boardPieceElement.remove();
    }

    // If new position is on the board (not offboard), render it
    if (newPosition !== "offboard") {
      renderPiece(piece);
    }
  }
});

// Register Socket.IO event handler for when a piece is removed
socket.on("pieceRemoved", (pieceId) => {
  // Remove the piece from local board state array
  boardState.pieces = boardState.pieces.filter((p) => p.id !== pieceId);
  // Re-render all pieces to reflect the removal
  renderPieces();
});

// Register Socket.IO event handler for when a piece is added
socket.on("pieceAdded", (piece) => {
  // Add the new piece to local board state array
  boardState.pieces.push(piece);
  // Re-render all pieces to show the new piece
  renderPieces();
});

// Get reference to the reset modal element
const resetModal = document.getElementById("reset-modal");
// Get reference to the reset button element
const resetBtn = document.getElementById("reset-btn");
// Get reference to the confirm reset button inside modal
const confirmReset = document.getElementById("confirm-reset");
// Get reference to the cancel reset button inside modal
const cancelReset = document.getElementById("cancel-reset");

// Add click event listener to reset button to show the confirmation modal
resetBtn.addEventListener("click", () => {
  // Set modal display to flex to make it visible
  resetModal.style.display = "flex";
});

// Add click event listener to confirm button to execute the reset
confirmReset.addEventListener("click", () => {
  // Emit event to server to reset the board
  socket.emit("resetBoard");
  // Hide the modal by setting display to none
  resetModal.style.display = "none";
});

// Add click event listener to cancel button to close modal without resetting
cancelReset.addEventListener("click", () => {
  // Hide the modal by setting display to none
  resetModal.style.display = "none";
});

// Add click event listener to modal backdrop to close modal when clicking outside
resetModal.addEventListener("click", (e) => {
  // Check if the click target is the modal itself (not the modal-content)
  if (e.target === resetModal) {
    // Hide the modal
    resetModal.style.display = "none";
  }
});

// Call initialization function to create the 8x8 board grid
initBoard();
// Call initialization function to populate the piece palette
initPalette();
