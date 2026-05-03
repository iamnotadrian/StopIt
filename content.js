async function getBlockedSites() {
  const result = await chrome.storage.sync.get({ blockedSites: [] });
  return result.blockedSites;
}

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isBlockedSite(currentHostname, blockedSites) {
  return blockedSites.some((keyword) => {
    return currentHostname.includes(keyword);
  });
}

function showThinkTwiceOverlay() {
  if (document.getElementById("think-twice-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "think-twice-overlay";

  overlay.innerHTML = `
    <div class="think-twice-card">
      <div class="think-twice-icon">
        <span></span>
        <span></span>
      </div>
      <h1>Stop It</h1>
     <p id="think-twice-message"></p>
      <button id="think-twice-back">
        <span class="material-symbols-outlined">arrow_back</span>
        Go back
      </button>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400');
    #think-twice-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #FEF9F5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      animation: ttFadeIn 0.35s ease-out forwards;
    }

    .think-twice-card {
      padding: 34px 30px;
      background: #FEF9F5;
      border-radius: 28px;
      text-align: center;
      color: #173047;
      animation: ttFloatIn 0.45s ease-out forwards;
    }

    .think-twice-card p {
      margin: 0 0 24px;
      font-size: 48px;
      line-height: 1.25;
      color: #173047;
      font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
    }

    .tt-quote {
      display: block;
      max-width: 800px;
    }

    .tt-author {
      display: block;
      margin-top: 10px;
      font-size: 16px;
      color: #7a8a93;
      font-family: Arial, sans-serif;
    }

    #think-twice-back {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      background: #8bb8a8;
      color: #FEF9F5;
      font-size: 16px;
      font-weight: 400;
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .material-symbols-outlined {
      font-size: 18px;
      line-height: 1;
    }

    #think-twice-back:hover {
      transform: translateY(-1px);
      background: #7aa998;
    }

    @keyframes ttFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ttFloatIn {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ttBreathe {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.06); opacity: 1; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const blockMessages = [
    '"The successful warrior is the average man, with laser-like focus." — Bruce Lee',
    '"You will never reach your destination if you stop and throw stones at every dog that barks." — Winston Churchill',
    '"Discipline is choosing between what you want now and what you want most." — Abraham Lincoln',
    '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle',
    '"It is not that we have a short time to live, but that we waste a lot of it." — Seneca',
    '"The price of anything is the amount of life you exchange for it." — Henry David Thoreau',
    '"Your time is limited, so don’t waste it living someone else’s life." — Steve Jobs',
    '"He who conquers himself is the mightiest warrior." — Confucius',
    '"The future depends on what you do today." — Mahatma Gandhi',
    '"Do not squander time, for that is the stuff life is made of." — Benjamin Franklin',
  ];

  const randomMessage =
    blockMessages[Math.floor(Math.random() * blockMessages.length)];

  const [quote, author] = randomMessage.split(" — ");

  document.getElementById("think-twice-message").innerHTML = `
    <span class="tt-quote">${quote}</span>
    <span class="tt-author">— ${author}</span>
  `;

  document.getElementById("think-twice-back").onclick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "about:blank";
    }
  };
}

async function checkCurrentSite() {
  const blockedSites = await getBlockedSites();
  const currentHostname = normalizeHostname(window.location.hostname);

  if (isBlockedSite(currentHostname, blockedSites)) {
    showThinkTwiceOverlay();
  }
}

checkCurrentSite();
