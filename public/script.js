const socket = io();

const pieceSymbols = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
  special: {
    // Scary animals
    scorpion: "🦂",
    spider: "🕷️",
    snake: "🐍",
    bat: "🦇",
    wolf: "🐺",
    dragon: "🐉",
    skull: "💀",
    trex: "🦖",
    // Friendly animals
    dog: "🐶",
    cat: "🐱",
    rabbit: "🐰",
    fox: "🦊",
    penguin: "🐧",
    owl: "🦉",
    dolphin: "🐬",
    elephant: "🐘",
  },
};

let boardState = { pieces: [] };
let draggedPiece = null;
let selectedPiece = null; // For click-to-move on mobile

// Disable context menu globally
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Initialize the board
function initBoard() {
  const board = document.getElementById("chessboard");
  board.innerHTML = "";

  // Create squares
  for (let row = 8; row >= 1; row--) {
    for (let col of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.position = col + row;

      // Alternate colors
      const isLight = (row + col.charCodeAt(0)) % 2 === 0;
      square.classList.add(isLight ? "light" : "dark");

      // Add drop handlers
      square.addEventListener("dragover", handleDragOver);
      square.addEventListener("drop", handleDrop);
      square.addEventListener("click", handleSquareClick);

      board.appendChild(square);
    }
  }
}

// Render all pieces
function renderPieces() {
  // Clear all board pieces
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.remove());

  boardState.pieces.forEach((piece) => {
    if (piece.position !== "offboard") {
      renderPiece(piece);
    }
  });
}

// Initialize piece palette
function initPalette() {
  const palette = document.getElementById("piece-palette");
  palette.innerHTML = "";

  const pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
  const colors = ["white", "black"];

  colors.forEach((color) => {
    // Create a row for each color
    const row = document.createElement("div");
    row.className = "piece-row";

    pieceTypes.forEach((type) => {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece palette-piece ${color} offboard-piece`;
      pieceEl.dataset.type = type;
      pieceEl.dataset.color = color;
      pieceEl.draggable = true;
      pieceEl.textContent = pieceSymbols[color][type];
      pieceEl.title = `${color} ${type}`;

      pieceEl.addEventListener("dragstart", handlePaletteDragStart);
      pieceEl.addEventListener("dragend", handleDragEnd);

      row.appendChild(pieceEl);
    });

    palette.appendChild(row);
  });
}

// Initialize aquatic palette
function initAquaticPalette() {
  const palette = document.getElementById("aquatic-palette");
  palette.innerHTML = "";

  const scaryTypes = [
    "scorpion",
    "spider",
    "snake",
    "bat",
    "wolf",
    "dragon",
    "skull",
    "trex",
  ];
  const friendlyTypes = [
    "dog",
    "cat",
    "rabbit",
    "fox",
    "penguin",
    "owl",
    "dolphin",
    "elephant",
  ];

  // Scary animals row
  const scaryRow = document.createElement("div");
  scaryRow.className = "piece-row";

  scaryTypes.forEach((type) => {
    const pieceEl = document.createElement("div");
    pieceEl.className = "piece palette-piece special offboard-piece";
    pieceEl.dataset.type = type;
    pieceEl.dataset.color = "special";
    pieceEl.draggable = true;
    pieceEl.textContent = pieceSymbols.special[type];
    pieceEl.title = type;

    pieceEl.addEventListener("dragstart", handlePaletteDragStart);
    pieceEl.addEventListener("dragend", handleDragEnd);

    scaryRow.appendChild(pieceEl);
  });

  palette.appendChild(scaryRow);

  // Friendly animals row
  const friendlyRow = document.createElement("div");
  friendlyRow.className = "piece-row";

  friendlyTypes.forEach((type) => {
    const pieceEl = document.createElement("div");
    pieceEl.className = "piece palette-piece special offboard-piece";
    pieceEl.dataset.type = type;
    pieceEl.dataset.color = "special";
    pieceEl.draggable = true;
    pieceEl.textContent = pieceSymbols.special[type];
    pieceEl.title = type;

    pieceEl.addEventListener("dragstart", handlePaletteDragStart);
    pieceEl.addEventListener("dragend", handleDragEnd);

    friendlyRow.appendChild(pieceEl);
  });

  palette.appendChild(friendlyRow);
}

// Render a single piece on the board
function renderPiece(piece) {
  const square = document.querySelector(`[data-position="${piece.position}"]`);
  if (!square) return;

  const pieceEl = document.createElement("div");
  // Check if it's a special piece and add the special class
  if (pieceSymbols.special && pieceSymbols.special[piece.type]) {
    pieceEl.className = `piece special ${piece.color}`;
    pieceEl.textContent = pieceSymbols.special[piece.type];
  } else {
    pieceEl.className = `piece ${piece.color}`;
    pieceEl.textContent = pieceSymbols[piece.color][piece.type];
  }

  pieceEl.dataset.id = piece.id;
  pieceEl.draggable = true;

  pieceEl.addEventListener("dragstart", handleDragStart);
  pieceEl.addEventListener("dragend", handleDragEnd);
  pieceEl.addEventListener("contextmenu", handleRightClick);
  pieceEl.addEventListener("click", handlePieceClick);

  square.appendChild(pieceEl);
}

// Drag handlers
function handlePaletteDragStart(e) {
  draggedPiece = null; // Not dragging an existing piece
  const pieceData = {
    type: e.target.dataset.type,
    color: e.target.dataset.color,
  };
  e.dataTransfer.setData("text/plain", JSON.stringify(pieceData));
  e.dataTransfer.effectAllowed = "copy";
  document.body.classList.add("dragging");
}

function handleDragStart(e) {
  draggedPiece = e.target.dataset.id;
  e.target.style.opacity = "0.5";
  e.dataTransfer.effectAllowed = "move";
  document.body.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  // Allow both move and copy operations
  if (e.dataTransfer.effectAllowed === "copy") {
    e.dataTransfer.dropEffect = "copy";
  } else {
    e.dataTransfer.dropEffect = "move";
  }
}

function handleDrop(e) {
  e.preventDefault();

  const targetSquare = e.target.classList.contains("square")
    ? e.target
    : e.target.closest(".square");

  if (targetSquare) {
    const newPosition = targetSquare.dataset.position;

    // Check if dragging from palette (draggedPiece will be null for palette pieces)
    if (draggedPiece === null) {
      // This is a palette drag - get data from dataTransfer
      const paletteData = e.dataTransfer.getData("text/plain");

      if (paletteData) {
        const { type, color } = JSON.parse(paletteData);

        // Check if square is occupied
        const existingPiece = boardState.pieces.find(
          (p) => p.position === newPosition
        );

        if (!existingPiece) {
          socket.emit("createPiece", { type, color, position: newPosition });
        }
      }
    } else if (draggedPiece) {
      // Moving existing piece
      const existingPiece = boardState.pieces.find(
        (p) => p.position === newPosition && p.id !== draggedPiece
      );

      if (!existingPiece) {
        socket.emit("movePiece", { pieceId: draggedPiece, newPosition });
      }
    }
  }

  // Reset dragged piece
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => (p.style.opacity = "1"));
  document.body.classList.remove("dragging");
  draggedPiece = null;
}

function handleDragEnd(e) {
  // Ensure cleanup happens even if drop doesn't fire
  document.querySelectorAll(".piece").forEach((p) => (p.style.opacity = "1"));
  document.body.classList.remove("dragging");
}

// Right-click to remove piece
function handleRightClick(e) {
  e.preventDefault();
  const pieceId = e.target.dataset.id;

  // Remove piece from board
  socket.emit("removePiece", pieceId);
}

// Click-to-move handlers for mobile
function handlePieceClick(e) {
  e.stopPropagation();
  const pieceId = e.target.dataset.id;

  // Clear previous selection styling
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));

  if (selectedPiece === pieceId) {
    // Deselect if clicking the same piece
    selectedPiece = null;
  } else if (selectedPiece) {
    // Try to move the previously selected piece to this piece's position (capture/swap)
    const targetPiece = boardState.pieces.find((p) => p.id === pieceId);
    if (targetPiece && targetPiece.position !== "offboard") {
      // Can't move to occupied square
      selectedPiece = pieceId;
      e.target.classList.add("selected");
    } else {
      selectedPiece = pieceId;
      e.target.classList.add("selected");
    }
  } else {
    // Select this piece
    selectedPiece = pieceId;
    e.target.classList.add("selected");
  }
}

function handleSquareClick(e) {
  if (!selectedPiece) return;

  const targetSquare = e.target.classList.contains("square")
    ? e.target
    : e.target.closest(".square");

  if (!targetSquare) return;

  const newPosition = targetSquare.dataset.position;

  // Check if square is already occupied
  const existingPiece = boardState.pieces.find(
    (p) => p.position === newPosition && p.id !== selectedPiece
  );

  if (!existingPiece) {
    socket.emit("movePiece", { pieceId: selectedPiece, newPosition });
  }

  // Clear selection
  selectedPiece = null;
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));
}

// Socket event handlers
socket.on("userCount", (count) => {
  const userCountEl = document.getElementById("user-count");
  userCountEl.textContent = `${count} user${count !== 1 ? "s" : ""} connected`;
});

socket.on("boardState", (state) => {
  boardState = state;
  renderPieces();
});

socket.on("pieceMove", ({ pieceId, newPosition }) => {
  const piece = boardState.pieces.find((p) => p.id === pieceId);
  if (piece) {
    const oldPosition = piece.position;
    piece.position = newPosition;

    // Only re-render the moved piece instead of everything
    const pieceEl = document.querySelector(`[data-id="${pieceId}"]`);
    if (pieceEl) {
      pieceEl.remove();
    }

    if (newPosition === "offboard") {
      renderOffboardPiece(piece);
    } else {
      renderPiece(piece);
    }
  }
});

socket.on("pieceRemoved", (pieceId) => {
  boardState.pieces = boardState.pieces.filter((p) => p.id !== pieceId);
  renderPieces();
});

socket.on("pieceAdded", (piece) => {
  boardState.pieces.push(piece);
  renderPieces();
});

// Reset button handler
const resetModal = document.getElementById("reset-modal");
const resetBtn = document.getElementById("reset-btn");
const confirmReset = document.getElementById("confirm-reset");
const cancelReset = document.getElementById("cancel-reset");

resetBtn.addEventListener("click", () => {
  resetModal.style.display = "flex";
});

confirmReset.addEventListener("click", () => {
  socket.emit("resetBoard");
  resetModal.style.display = "none";
});

cancelReset.addEventListener("click", () => {
  resetModal.style.display = "none";
});

// Close modal when clicking outside
resetModal.addEventListener("click", (e) => {
  if (e.target === resetModal) {
    resetModal.style.display = "none";
  }
});

// Initialize
initBoard();
initPalette();
initAquaticPalette();
