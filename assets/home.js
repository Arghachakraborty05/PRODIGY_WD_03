function init() {

  const touched = { player1: false, player2: false };
  let lastFocusedField = null;

  // --- HOME PAGE LOGIC ---
  document.getElementById("single-btn").onclick = () => {
    localStorage.setItem("mode", "AI");
    localStorage.setItem("player1", "You");
    localStorage.setItem("player2", "AI");
    window.location.href = "game.html";
  };

  document.getElementById("multi-btn").onclick = () => {
    const popup = document.getElementById("name-popup");
    const p1 = document.getElementById("player1");
    const p2 = document.getElementById("player2");

    if (p1) p1.value = "";
    if (p2) p2.value = "";

    const err1 = document.getElementById("error-player1");
    const err2 = document.getElementById("error-player2");
    if (err1) err1.classList.remove("show");
    if (err2) err2.classList.remove("show");

    if (popup) {
      popup.classList.remove("hidden");
      document.body.classList.add("no-scroll");
      setTimeout(() => {
        if (p1) requestAnimationFrame(() => p1.focus());
      }, 100);
    }
  };

  // --- FORM VALIDATION ---
  function closeAndResetPopup() {
    const popup = document.getElementById("name-popup");
    if (popup) {
      popup.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    }
  }

  function validateNames(p1Input, p2Input, errorP1, errorP2, touched, isSubmit = false) {
    const name1 = p1Input && p1Input.value ? p1Input.value : "";
    const name2 = p2Input && p2Input.value ? p2Input.value : "";

    let isValid = true;

    function checkName(name) {
      if (name === "") return { valid: false, message: isSubmit ? "This is a required field." : "" };
      if (/^[\s\t]+$/.test(name)) return { valid: false, message: "Enter valid name." };
      if (!/^[A-Za-z]/.test(name)) return { valid: false, message: "Enter valid name." };
      if (/^[^A-Za-z]*$/.test(name)) return { valid: false, message: "Enter valid name." };
      if (name.length > 10) return { valid: false, message: "Max 10 characters is allowed." };
      return { valid: true, message: "" };
    }

    const res1 = checkName(name1);
    const res2 = checkName(name2);

    if ((touched.player1 || isSubmit) && errorP1) {
      if (!res1.valid) {
        errorP1.textContent = res1.message;
        errorP1.classList.add("show");
        isValid = false;
      } else {
        errorP1.textContent = "";
        errorP1.classList.remove("show");
      }
    }

    if ((touched.player2 || isSubmit) && errorP2) {
      if (!res2.valid) {
        errorP2.textContent = res2.message;
        errorP2.classList.add("show");
        isValid = false;
      } else {
        errorP2.textContent = "";
        errorP2.classList.remove("show");
      }
    }

    if (
      res1.valid &&
      res2.valid &&
      (touched.player1 || isSubmit) &&
      (touched.player2 || isSubmit) &&
      name1.trim().toLowerCase() === name2.trim().toLowerCase()
    ) {
      const activeField = document.activeElement;
      if (activeField === p1Input && errorP1) {
        errorP1.textContent = "Player names must be different.";
        errorP1.classList.add("show");
        isValid = false;
      } else if (activeField === p2Input && errorP2) {
        errorP2.textContent = "Player names must be different.";
        errorP2.classList.add("show");
        isValid = false;
      }
    }

    return isValid;
  }

  const form = document.getElementById("player-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const p1Input = document.getElementById("player1");
      const p2Input = document.getElementById("player2");
      const errorP1 = document.getElementById("error-player1");
      const errorP2 = document.getElementById("error-player2");

      const p1 = p1Input.value.trim();
      const p2 = p2Input.value.trim();

      touched.player1 = true;
      touched.player2 = true;

      const valid = validateNames(p1Input, p2Input, errorP1, errorP2, touched, true);

      if (valid) {
        localStorage.setItem("mode", "1v1");
        localStorage.setItem("player1", p1);
        localStorage.setItem("player2", p2);
        window.location.href = "game.html";
      }
    });
  }

  const p1Input = document.getElementById("player1");
  const p2Input = document.getElementById("player2");

  if (p1Input) p1Input.addEventListener("focus", () => (lastFocusedField = p1Input));
  if (p2Input) p2Input.addEventListener("focus", () => (lastFocusedField = p2Input));

  ["player1", "player2"].forEach((id) => {
    const input = document.getElementById(id);
    const error = document.getElementById(`error-${id}`);
    const otherId = id === "player1" ? "player2" : "player1";
    const otherInput = document.getElementById(otherId);
    const otherError = document.getElementById(`error-${otherId}`);

    if (input) {
      input.addEventListener("input", () => {
        touched[id] = true;
        validateNames(input, otherInput, error, otherError, touched);
      });
    }
  });

  // --- CANCEL / CLOSE POPUP ---
  const cancelBtn = document.getElementById("cancel-game");
  if (cancelBtn) cancelBtn.addEventListener("click", closeAndResetPopup);

  const closeIcon = document.getElementById("close-popup");
  if (closeIcon) closeIcon.addEventListener("click", closeAndResetPopup);

  const namePopup = document.getElementById("name-popup");
  if (namePopup) {
    namePopup.addEventListener("click", function (e) {
      const container = document.querySelector(".popup-container");
      if (container && !container.contains(e.target)) closeAndResetPopup();
    });
  }

  // --- ESC KEY POPUP CLOSE ---
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const namePopup = document.getElementById("name-popup");
    const leaderboardPopup = document.getElementById("leaderboard-popup");

    if (namePopup && !namePopup.classList.contains("hidden")) closeAndResetPopup();
    if (leaderboardPopup && !leaderboardPopup.classList.contains("lb-hidden")) {
      leaderboardPopup.classList.add("lb-hidden");
      document.body.classList.remove("no-scroll");
    }
  });

  // --- LEADERBOARD ---
  const lbBtn = document.getElementById("leaderboard-btn");
  if (lbBtn) {
    lbBtn.addEventListener("click", () => {
      const popup = document.getElementById("leaderboard-popup");
      if (popup) {
        popup.classList.remove("lb-hidden");
        document.body.classList.add("no-scroll");
        setTimeout(() => populateLeaderboard(), 50);
      }
    });
  }

  const closeLb = document.getElementById("close-leaderboard");
  if (closeLb) {
    closeLb.addEventListener("click", () => {
      const lbPopup = document.getElementById("leaderboard-popup");
      if (lbPopup) {
        lbPopup.classList.add("lb-hidden");
        document.body.classList.remove("no-scroll");
      }
    });
  }

  const lbPopup = document.getElementById("leaderboard-popup");
  if (lbPopup) {
    lbPopup.addEventListener("click", function (e) {
      const container = document.querySelector(".lb-modal-container");
      if (container && !container.contains(e.target)) {
        lbPopup.classList.add("lb-hidden");
        document.body.classList.remove("no-scroll");
      }
    });
  }


  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  }

  function formatLastUpdated(date) {
    const latestDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - latestDate) / 1000);

    if (diffInSeconds < 0 || diffInSeconds < 60) {
      return "Last updated: Just now";
    }


    const isToday = latestDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = latestDate.toDateString() === yesterday.toDateString();

    let hours = latestDate.getHours();
    const minutes = String(latestDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    if (isToday) {
      return `Last updated: Today at ${timeStr}`;
    } else if (isYesterday) {
      return `Last updated: Yesterday at ${timeStr}`;
    } else {
      const day = String(latestDate.getDate()).padStart(2, '0');
      const month = String(latestDate.getMonth() + 1).padStart(2, '0');
      const year = latestDate.getFullYear();
      return `Last updated: ${day}/${month}/${year} at ${timeStr}`;
    }
  }



  // ============ POPULATE LEADERBOARD ============

  function populateLeaderboard() {
    const rawData = JSON.parse(localStorage.getItem("leaderboard")) || [];

    const validData = rawData.filter(entry =>
      entry.playerX && entry.playerO && entry.score && entry.date
    );

    // Sort match history by latest date first
    validData.sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastUpdatedEl = document.querySelector(".lb-modal-footer");

    if (validData.length && lastUpdatedEl) {
      const latestDate = new Date(validData[0].date);
      const now = new Date();
      const diffInSeconds = Math.floor((now - latestDate) / 1000);

      lastUpdatedEl.textContent = formatLastUpdated(latestDate);

    }

    const leaderboardContainer = document.getElementById("leaderboardBody");
    const matchHistoryContainer = document.getElementById("matchHistoryBody");
    leaderboardContainer.innerHTML = "";
    matchHistoryContainer.innerHTML = "";
    // If no valid data, show fallback messages
    if (validData.length === 0) {
      leaderboardContainer.innerHTML = `<div class="no-data">No Data Present</div>`;
      matchHistoryContainer.innerHTML = `<div class="no-data">No Recent Match Found</div>`;
      if (lastUpdatedEl) lastUpdatedEl.textContent = "";
      return; // Exit early to skip rendering
    }


    // ==============================
    // Compute Wins & Match Metadata
    // ==============================
    // Iterate through each match to:
    // 1. Initialize player stats if not already present.
    // 2. Update the most recent match time for both players.
    // 3. Increment the win count for the winning player.
    // 4. Record the earliest index of a win for each player.
    //
    const playerStats = {};

    validData.forEach((match, index) => {
      const { playerX, playerO, score, date } = match;
      const [xScore, oScore] = score.split("-").map(s => parseInt(s.trim(), 10) || 0);
      const matchTime = new Date(date).getTime();

      [playerX, playerO].forEach(player => {
        if (!playerStats[player]) {
          playerStats[player] = { name: player, wins: 0, lastWinIndex: -1, lastMatchTime: 0 };
        }
        playerStats[player].lastMatchTime = Math.max(playerStats[player].lastMatchTime, matchTime);
      });

      if (xScore > oScore) {
        playerStats[playerX].wins++;
        if (playerStats[playerX].lastWinIndex === -1 || index < playerStats[playerX].lastWinIndex) {
          playerStats[playerX].lastWinIndex = index;
        }
      } else if (oScore > xScore) {
        playerStats[playerO].wins++;
        if (playerStats[playerO].lastWinIndex === -1 || index < playerStats[playerO].lastWinIndex) {
          playerStats[playerO].lastWinIndex = index;
        }
      }
    });


    // Sort rules for leaderboard:
    // 1. More wins = higher
    // 2. Earlier win = higher
    // 3. More recent match = higher
    // 4. Name alphabetical fallback
    const sorted = Object.values(playerStats)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (a.lastWinIndex !== b.lastWinIndex) return a.lastWinIndex - b.lastWinIndex;
        if (b.lastMatchTime !== a.lastMatchTime) return b.lastMatchTime - a.lastMatchTime;
        return a.name.localeCompare(b.name);
      });

    // Render Leaderboard
    sorted.forEach(({ name, wins }, i) => {
      const row = document.createElement("div");
      row.className = "lb-table-row";
      row.innerHTML = `
        <div class="row-rank"><span class="rank-circle">${i + 1}</span></div>
        <div class="row-player">${name}</div>
        <div class="row-score">${wins}</div>
      `;
      leaderboardContainer.appendChild(row);
    });

    // Render Match History
    validData.forEach(({ playerX, playerO, score, date }) => {
      const [xScore, oScore] = score.split("-").map(Number);
      const resultClass = xScore > oScore ? "win" : xScore < oScore ? "loss" : "draw";
      const resultText = xScore > oScore ? "Win" : xScore < oScore ? "Loss" : "Draw";

      const matchItem = document.createElement("div");
      matchItem.className = "lb-match-row";
      matchItem.innerHTML = `
        <div class="lb-player">${playerX}</div>
        <div class="lb-result ${resultClass}">${resultText}</div>
        <div class="lb-vs">vs</div>
        <div class="lb-player">${playerO}</div>
        <div class="lb-score">Score: ${score}</div>
        <div class="lb-date">${formatDateTime(date)}</div>

      `;
      matchHistoryContainer.appendChild(matchItem);
    });
  }

  // --- TAB SWITCHING ---
  const tabUnderline = document.querySelector(".lb-tab-underline");

  const leaderboardTab = document.getElementById("leaderboardTab");
  const matchHistoryTab = document.getElementById("matchHistoryTab");

  if (leaderboardTab) {
    leaderboardTab.addEventListener("click", () => {
      const lbSection = document.getElementById("leaderboardSection");
      const mhSection = document.getElementById("matchHistorySection");
      if (lbSection) lbSection.classList.remove("lb-hidden");
      if (mhSection) mhSection.classList.add("lb-hidden");

      leaderboardTab.classList.add("lb-tab-active");
      if (matchHistoryTab) matchHistoryTab.classList.remove("lb-tab-active");

      if (tabUnderline) tabUnderline.style.transform = "translateX(0%)";
    });
  }

  if (matchHistoryTab) {
    matchHistoryTab.addEventListener("click", () => {
      const lbSection = document.getElementById("leaderboardSection");
      const mhSection = document.getElementById("matchHistorySection");
      if (lbSection) lbSection.classList.add("lb-hidden");
      if (mhSection) mhSection.classList.remove("lb-hidden");

      matchHistoryTab.classList.add("lb-tab-active");
      if (leaderboardTab) leaderboardTab.classList.remove("lb-tab-active");

      if (tabUnderline) tabUnderline.style.transform = "translateX(100%)";
    });
  }

  // --- ENTRANCE ANIMATION ---
  window.addEventListener("load", () => {
    const content = document.querySelector(".content");
    const preview = document.querySelector(".preview");
    const winLine = document.getElementById("winLine");

    if (content) content.classList.add("slide-in-left");
    if (preview) preview.classList.add("slide-in-right");

    setTimeout(() => {
      if (winLine) winLine.classList.add("animated");
    }, 1400);
  });


  // --- ENTER KEY TO FOCUS NEXT FIELD IF VALID ---
  p1Input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      touched.player1 = true;

      const errorP1 = document.getElementById("error-player1");

      const name = p1Input.value.trim();
      let message = "";

      if (name === "") {
        message = "This is a required field.";
      } else if (/^[\s\t]+$/.test(name)) {
        message = "Enter valid name.";
      } else if (!/^[A-Za-z]/.test(name)) {
        message = "Enter valid name.";
      } else if (/^[^A-Za-z]*$/.test(name)) {
        message = "Enter valid name.";
      } else if (name.length > 10) {
        message = "Max 10 characters is allowed.";
      }

      if (message !== "") {
        errorP1.textContent = message;
        errorP1.classList.add("show");
      } else {
        errorP1.textContent = "";
        errorP1.classList.remove("show");
        p2Input?.focus();
      }
    }
  });


  if (p2Input) {
    p2Input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        touched.player2 = true;

        const errorP1 = document.getElementById("error-player1");
        const errorP2 = document.getElementById("error-player2");

        // Temporarily copy the current touched state
        const touchedCopy = { ...touched };

        // Only mark player1 as touched if it has an error
        const res1 = validateNames(p1Input, p2Input, errorP1, errorP2, touchedCopy, true);

        if (res1) {
          form?.requestSubmit();
        }
      }
    });
  }


}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}





