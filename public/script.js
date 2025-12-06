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
let touchDraggedElement = null;
let touchStartPos = { x: 0, y: 0 };
let touchMoved = false;
let touchStartTime = 0;
let longPressTimer = null;

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
      pieceEl.addEventListener("touchstart", handlePaletteTouchStart, {
        passive: false,
      });
      pieceEl.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      pieceEl.addEventListener("touchend", handleTouchEnd, { passive: false });

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
    pieceEl.addEventListener("touchstart", handlePaletteTouchStart, {
      passive: false,
    });
    pieceEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    pieceEl.addEventListener("touchend", handleTouchEnd, { passive: false });

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
    pieceEl.addEventListener("touchstart", handlePaletteTouchStart, {
      passive: false,
    });
    pieceEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    pieceEl.addEventListener("touchend", handleTouchEnd, { passive: false });

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
  pieceEl.addEventListener("touchstart", handleTouchStart, { passive: false });
  pieceEl.addEventListener("touchmove", handleTouchMove, { passive: false });
  pieceEl.addEventListener("touchend", handleTouchEnd, { passive: false });

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

// Touch event handlers for mobile
function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartPos = { x: touch.clientX, y: touch.clientY };
  touchStartTime = Date.now();
  touchMoved = false;
  touchDraggedElement = e.target;
  draggedPiece = e.target.dataset.id;

  // Set up long press for deletion (only for board pieces, not palette)
  if (!e.target.classList.contains("palette-piece")) {
    longPressTimer = setTimeout(() => {
      if (!touchMoved && touchDraggedElement) {
        // Long press detected - remove piece
        const pieceId = touchDraggedElement.dataset.id;
        if (pieceId && confirm("Delete this piece?")) {
          socket.emit("removePiece", pieceId);
        }
        touchDraggedElement = null;
        draggedPiece = null;
      }
    }, 500); // 500ms for long press
  }
}

function handlePaletteTouchStart(e) {
  const touch = e.touches[0];
  touchStartPos = { x: touch.clientX, y: touch.clientY };
  touchStartTime = Date.now();
  touchMoved = false;
  touchDraggedElement = e.target;
  draggedPiece = null; // Palette piece, not an existing board piece
}

function handleTouchMove(e) {
  if (!touchDraggedElement) return;

  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartPos.x);
  const deltaY = Math.abs(touch.clientY - touchStartPos.y);

  // Only start dragging if moved more than 10px
  if (deltaX > 10 || deltaY > 10) {
    touchMoved = true;

    // Cancel long press if user starts dragging
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    e.preventDefault(); // Prevent scrolling only when actually dragging

    touchDraggedElement.style.opacity = "0.5";
    touchDraggedElement.style.zIndex = "1000";
    touchDraggedElement.style.position = "fixed";
    touchDraggedElement.style.left =
      touch.clientX - touchDraggedElement.offsetWidth / 2 + "px";
    touchDraggedElement.style.top =
      touch.clientY - touchDraggedElement.offsetHeight / 2 + "px";
    touchDraggedElement.style.pointerEvents = "none";
  }
}

function handleTouchEnd(e) {
  // Clear long press timer
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  if (!touchDraggedElement) return;

  const touchDuration = Date.now() - touchStartTime;

  // If it was a quick tap (less than 200ms) and didn't move much, treat as click
  if (!touchMoved && touchDuration < 200) {
    // Reset and let the click handler deal with it
    touchDraggedElement = null;
    draggedPiece = null;
    touchMoved = false;
    return;
  }

  e.preventDefault();

  const touch = e.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

  // Reset styles
  touchDraggedElement.style.opacity = "1";
  touchDraggedElement.style.zIndex = "";
  touchDraggedElement.style.position = "";
  touchDraggedElement.style.left = "";
  touchDraggedElement.style.top = "";
  touchDraggedElement.style.pointerEvents = "";

  // Find the target square
  const targetSquare = targetElement?.classList.contains("square")
    ? targetElement
    : targetElement?.closest(".square");

  if (targetSquare && touchMoved) {
    const newPosition = targetSquare.dataset.position;

    // Check if dragging from palette
    if (
      draggedPiece === null &&
      touchDraggedElement.classList.contains("palette-piece")
    ) {
      const type = touchDraggedElement.dataset.type;
      const color = touchDraggedElement.dataset.color;

      // Check if square is occupied
      const existingPiece = boardState.pieces.find(
        (p) => p.position === newPosition
      );

      if (!existingPiece) {
        socket.emit("createPiece", { type, color, position: newPosition });
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

  // Reset
  touchDraggedElement = null;
  draggedPiece = null;
  touchMoved = false;
} // Socket event handlers
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
