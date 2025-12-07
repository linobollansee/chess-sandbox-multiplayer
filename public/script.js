const socket = io();

// SVG piece images
const pieceImages = {
  white: {
    king: "/images/pieces/chess_king_light.svg",
    queen: "/images/pieces/chess_queen_light.svg",
    rook: "/images/pieces/chess_rook_light.svg",
    bishop: "/images/pieces/chess_bishop_light.svg",
    knight: "/images/pieces/chess_knight_light.svg",
    pawn: "/images/pieces/chess_pawn_light.svg",
    elephant: "/images/pieces/chess_elephant_light.svg",
    giraffe: "/images/pieces/chess_giraffe_light.svg",
    unicorn: "/images/pieces/chess_unicorn_light.svg",
    zebra: "/images/pieces/chess_zebra_light.svg",
    mann: "/images/pieces/chess_mann_light.svg",
    centaur: "/images/pieces/chess_centaur_light.svg",
    commoner: "/images/pieces/chess_commoner_light.svg",
    champion: "/images/pieces/chess_champion_light.svg",
    wizard: "/images/pieces/chess_wizard_light.svg",
    fool: "/images/pieces/chess_fool_light.svg",
    archbishop: "/images/pieces/chess_archbishop_light.svg",
    chancellor: "/images/pieces/chess_chancellor_light.svg",
    amazon: "/images/pieces/chess_amazon_light.svg",
    dragon: "/images/pieces/chess_dragon_light.svg",
    ship: "/images/pieces/chess_ship_light.svg",
  },
  black: {
    king: "/images/pieces/chess_king_dark.svg",
    queen: "/images/pieces/chess_queen_dark.svg",
    rook: "/images/pieces/chess_rook_dark.svg",
    bishop: "/images/pieces/chess_bishop_dark.svg",
    knight: "/images/pieces/chess_knight_dark.svg",
    pawn: "/images/pieces/chess_pawn_dark.svg",
    elephant: "/images/pieces/chess_elephant_dark.svg",
    giraffe: "/images/pieces/chess_giraffe_dark.svg",
    unicorn: "/images/pieces/chess_unicorn_dark.svg",
    zebra: "/images/pieces/chess_zebra_dark.svg",
    mann: "/images/pieces/chess_mann_dark.svg",
    centaur: "/images/pieces/chess_centaur_dark.svg",
    commoner: "/images/pieces/chess_commoner_dark.svg",
    champion: "/images/pieces/chess_champion_dark.svg",
    wizard: "/images/pieces/chess_wizard_dark.svg",
    fool: "/images/pieces/chess_fool_dark.svg",
    archbishop: "/images/pieces/chess_archbishop_dark.svg",
    chancellor: "/images/pieces/chess_chancellor_dark.svg",
    amazon: "/images/pieces/chess_amazon_dark.svg",
    dragon: "/images/pieces/chess_dragon_dark.svg",
    ship: "/images/pieces/chess_ship_dark.svg",
  },
};

let boardState = { pieces: [] };
let selectedPiece = null;
let selectedPaletteType = null;
let selectedPaletteColor = null;
let longPressTimer = null;
let ghostPiece = null;
let longPressPieceId = null;
let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// Disable context menu globally
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

function initBoard() {
  const board = document.getElementById("chessboard");
  board.innerHTML = "";

  for (let row = 8; row >= 1; row--) {
    for (let col of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.position = col + row;

      const isLight = (row + col.charCodeAt(0)) % 2 === 0;
      square.classList.add(isLight ? "light" : "dark");

      if (isTouchDevice) {
        // Touch devices: use touchend for instant response (no 300ms delay)
        square.addEventListener("touchend", handleSquareClick, {
          passive: false,
        });
      } else {
        // Desktop: use click and hover effects
        square.addEventListener("click", handleSquareClick);
        square.addEventListener("mouseenter", handleSquareHover);
        square.addEventListener("mouseleave", handleSquareLeave);
      }
      board.appendChild(square);
    }
  }
}

function renderPieces() {
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

  const standardPieces = ["king", "queen", "rook", "bishop", "knight", "pawn"];
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
  const colors = ["white", "black"];

  // Add standard pieces
  colors.forEach((color) => {
    const row = document.createElement("div");
    row.className = "piece-row";

    standardPieces.forEach((type) => {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece palette-piece ${color} offboard-piece`;
      pieceEl.dataset.type = type;
      pieceEl.dataset.color = color;

      const img = document.createElement("img");
      img.src = pieceImages[color][type];
      img.alt = `${color} ${type}`;
      pieceEl.appendChild(img);
      pieceEl.title = `${color} ${type}`;

      if (isTouchDevice) {
        pieceEl.addEventListener("touchend", handlePaletteClick, {
          passive: false,
        });
      } else {
        pieceEl.addEventListener("click", handlePaletteClick);
      }

      row.appendChild(pieceEl);
    });

    palette.appendChild(row);
  });

  // Add fairy pieces - 5 per row for better organization
  const piecesPerRow = 5;
  let allFairyPieces = [];

  // Create array of all fairy pieces with their colors
  colors.forEach((color) => {
    fairyPieces.forEach((type) => {
      allFairyPieces.push({ type, color });
    });
  });

  // Organize into rows
  for (let i = 0; i < allFairyPieces.length; i += piecesPerRow) {
    const row = document.createElement("div");
    row.className = "piece-row";

    const rowPieces = allFairyPieces.slice(i, i + piecesPerRow);
    rowPieces.forEach(({ type, color }) => {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece palette-piece ${color} offboard-piece fairy-piece`;
      pieceEl.dataset.type = type;
      pieceEl.dataset.color = color;

      const img = document.createElement("img");
      img.src = pieceImages[color][type];
      img.alt = `${color} ${type}`;
      pieceEl.appendChild(img);
      pieceEl.title = `${color} ${type}`;

      if (isTouchDevice) {
        pieceEl.addEventListener("touchend", handlePaletteClick, {
          passive: false,
        });
      } else {
        pieceEl.addEventListener("click", handlePaletteClick);
      }

      row.appendChild(pieceEl);
    });

    palette.appendChild(row);
  }
}

function renderPiece(piece) {
  const square = document.querySelector(`[data-position="${piece.position}"]`);
  if (!square) return;

  const pieceEl = document.createElement("div");
  pieceEl.className = `piece ${piece.color}`;
  const img = document.createElement("img");
  img.src = pieceImages[piece.color][piece.type];
  img.alt = `${piece.color} ${piece.type}`;
  pieceEl.appendChild(img);

  pieceEl.dataset.id = piece.id;

  if (isTouchDevice) {
    // Touch devices: only touch events
    pieceEl.addEventListener("touchstart", handlePieceTouchStart, {
      passive: false,
    });
    pieceEl.addEventListener("touchend", handlePieceTouchEnd, {
      passive: false,
    });
    pieceEl.addEventListener("touchmove", handlePieceTouchMove, {
      passive: false,
    });
  } else {
    // Desktop: only mouse events
    pieceEl.addEventListener("click", handlePieceClick);
    pieceEl.addEventListener("dblclick", handlePieceDoubleClick);
  }

  square.appendChild(pieceEl);
}

function handlePaletteClick(e) {
  e.stopPropagation();
  e.preventDefault();

  // Get the palette piece element (in case user clicked on img)
  const paletteEl = e.target.classList.contains("palette-piece")
    ? e.target
    : e.target.closest(".palette-piece");

  if (!paletteEl) return;

  const clickedType = paletteEl.dataset.type;
  const clickedColor = paletteEl.dataset.color;

  // If clicking the already selected palette piece, deselect it
  if (
    selectedPaletteType === clickedType &&
    selectedPaletteColor === clickedColor
  ) {
    document
      .querySelectorAll(".palette-piece")
      .forEach((p) => p.classList.remove("selected"));
    removeGhostPiece();
    selectedPaletteType = null;
    selectedPaletteColor = null;
    return;
  }

  document
    .querySelectorAll(".palette-piece")
    .forEach((p) => p.classList.remove("selected"));
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.classList.remove("selected"));

  if (!isTouchDevice) {
    removeGhostPiece();
  }

  paletteEl.classList.add("selected");
  selectedPaletteType = clickedType;
  selectedPaletteColor = clickedColor;
  selectedPiece = null;
}

function handlePieceClick(e) {
  e.stopPropagation();
  const pieceId = e.target.dataset.id;

  document
    .querySelectorAll(".palette-piece")
    .forEach((p) => p.classList.remove("selected"));
  document
    .querySelectorAll(".piece:not(.palette-piece)")
    .forEach((p) => p.classList.remove("selected"));

  if (!isTouchDevice) {
    removeGhostPiece();
  }

  selectedPaletteType = null;
  selectedPaletteColor = null;

  if (selectedPiece === pieceId) {
    selectedPiece = null;
  } else if (selectedPiece) {
    const targetPiece = boardState.pieces.find((p) => p.id === pieceId);
    if (targetPiece && targetPiece.position !== "offboard") {
      const newPosition = targetPiece.position;
      socket.emit("removePiece", pieceId);
      socket.emit("movePiece", { pieceId: selectedPiece, newPosition });
      selectedPiece = null;
      document
        .querySelectorAll(".piece")
        .forEach((p) => p.classList.remove("selected"));
    }
  } else {
    selectedPiece = pieceId;
    e.target.classList.add("selected");
  }
}

function handlePieceDoubleClick(e) {
  e.stopPropagation();
  const pieceId = e.target.dataset.id;

  if (confirm("Delete this piece?")) {
    socket.emit("removePiece", pieceId);
  }

  selectedPiece = null;
  removeGhostPiece();
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));
}

function handlePieceTouchStart(e) {
  e.preventDefault();
  const pieceId = e.target.dataset.id || e.target.closest(".piece")?.dataset.id;
  if (!pieceId) return;

  // Remove any ghost pieces that might exist
  removeGhostPiece();

  longPressPieceId = pieceId;

  longPressTimer = setTimeout(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (confirm("Delete this piece?")) {
      socket.emit("removePiece", pieceId);
      selectedPiece = null;
      removeGhostPiece();
      document
        .querySelectorAll(".piece")
        .forEach((p) => p.classList.remove("selected"));
    }

    longPressPieceId = null;
  }, 800);
}

function handlePieceTouchEnd(e) {
  e.preventDefault();
  e.stopPropagation();

  // Remove any ghost pieces
  removeGhostPiece();

  // If long press timer is still active, this is a tap (not a long press)
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;

    // Treat tap like a click - select/deselect piece
    const pieceId = longPressPieceId;
    longPressPieceId = null;

    if (pieceId) {
      // Directly handle the piece selection instead of simulating click
      document
        .querySelectorAll(".palette-piece")
        .forEach((p) => p.classList.remove("selected"));
      document
        .querySelectorAll(".piece:not(.palette-piece)")
        .forEach((p) => p.classList.remove("selected"));

      selectedPaletteType = null;
      selectedPaletteColor = null;

      if (selectedPiece === pieceId) {
        selectedPiece = null;
      } else if (selectedPiece) {
        const targetPiece = boardState.pieces.find((p) => p.id === pieceId);
        if (targetPiece && targetPiece.position !== "offboard") {
          const newPosition = targetPiece.position;
          socket.emit("removePiece", pieceId);
          socket.emit("movePiece", { pieceId: selectedPiece, newPosition });
          selectedPiece = null;
        }
      } else {
        selectedPiece = pieceId;
        e.target.closest(".piece")?.classList.add("selected");
      }
    }
  } else {
    longPressPieceId = null;
  }
}
function handlePieceTouchMove(e) {
  e.preventDefault();
  // Cancel long press if user moves finger (they're scrolling, not tapping)
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  longPressPieceId = null;
}

function handleSquareClick(e) {
  // Prevent default and stop propagation on touch devices
  if (isTouchDevice) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Find the square - it might be the target itself, or we need to traverse up
  let targetSquare = null;

  if (e.target.classList.contains("square")) {
    targetSquare = e.target;
  } else if (e.target.closest) {
    // If clicked on a piece or img, find the square
    const piece = e.target.closest(".piece:not(.palette-piece)");
    if (
      piece &&
      piece.parentElement &&
      piece.parentElement.classList.contains("square")
    ) {
      targetSquare = piece.parentElement;
    } else {
      targetSquare = e.target.closest(".square");
    }
  }

  if (!targetSquare || !targetSquare.dataset.position) return;

  const newPosition = targetSquare.dataset.position;

  // Only use ghost pieces on desktop
  if (!isTouchDevice) {
    removeGhostPiece();
  }

  if (selectedPaletteType && selectedPaletteColor) {
    const existingPiece = boardState.pieces.find(
      (p) => p.position === newPosition
    );

    if (!existingPiece) {
      socket.emit("createPiece", {
        type: selectedPaletteType,
        color: selectedPaletteColor,
        position: newPosition,
      });
    }
    return;
  }

  if (!selectedPiece) return;

  const existingPiece = boardState.pieces.find(
    (p) => p.position === newPosition && p.id !== selectedPiece
  );

  if (existingPiece) {
    socket.emit("removePiece", existingPiece.id);
  }

  socket.emit("movePiece", { pieceId: selectedPiece, newPosition });

  selectedPiece = null;
  document
    .querySelectorAll(".piece")
    .forEach((p) => p.classList.remove("selected"));
}

function handleSquareHover(e) {
  // Ghost pieces disabled on touch devices
  if (isTouchDevice) return;

  const targetSquare = e.target.classList.contains("square")
    ? e.target
    : e.target.closest(".square");

  if (!targetSquare) return;

  const position = targetSquare.dataset.position;

  removeGhostPiece();

  if (selectedPaletteType && selectedPaletteColor) {
    const existingPiece = boardState.pieces.find(
      (p) => p.position === position
    );

    if (!existingPiece) {
      showGhostPiece(targetSquare, selectedPaletteType, selectedPaletteColor);
    }
    return;
  }

  if (selectedPiece) {
    const piece = boardState.pieces.find((p) => p.id === selectedPiece);
    if (piece) {
      showGhostPiece(targetSquare, piece.type, piece.color);
    }
  }
}

function handleSquareLeave(e) {
  removeGhostPiece();
}

function showGhostPiece(square, type, color) {
  // Never show ghost pieces on touch devices
  if (isTouchDevice) return;

  const ghostEl = document.createElement("div");
  ghostEl.className = `piece ghost-piece ${color}`;
  const img = document.createElement("img");
  img.src = pieceImages[color][type];
  img.alt = `${color} ${type}`;
  ghostEl.appendChild(img);

  square.appendChild(ghostEl);
  ghostPiece = ghostEl;
}

function removeGhostPiece() {
  if (ghostPiece) {
    ghostPiece.remove();
    ghostPiece = null;
  }
  document.querySelectorAll(".ghost-piece").forEach((el) => el.remove());
}

// Socket event handlers
socket.on("boardState", (state) => {
  boardState = state;
  renderPieces();
});

socket.on("pieceMove", ({ pieceId, newPosition }) => {
  const piece = boardState.pieces.find((p) => p.id === pieceId);
  if (piece) {
    piece.position = newPosition;

    const pieceEl = document.querySelector(`[data-id="${pieceId}"]`);
    if (pieceEl) {
      pieceEl.remove();
    }

    if (newPosition !== "offboard") {
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

resetModal.addEventListener("click", (e) => {
  if (e.target === resetModal) {
    resetModal.style.display = "none";
  }
});

initBoard();
initPalette();
