// =====================
// 1. NETWORK SWITCHING
// =====================
async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
    });
  } catch (switchError) {
    // If the chain is not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia Test Network",
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://sepolia.infura.io/v3/"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// =====================
// 2. CONFIG
// =====================

// !! REPLACE THIS WITH YOUR REAL SEPOLIA CONTRACT ADDRESS !!
const CONTRACT_ADDRESS = "0x2eAE0Aa0d393C7Af3f27B81A419890921cb23e1A";

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "shortCode", type: "bytes32" },
      { internalType: "string", name: "originalUrl", type: "string" },
      { internalType: "uint8", name: "durationId", type: "uint8" },
    ],
    name: "createShortUrl",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "shortCode", type: "bytes32" }],
    name: "deleteShortUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "shortCode", type: "bytes32" },
      { internalType: "uint8", name: "durationId", type: "uint8" },
    ],
    name: "renewShortUrl",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "durationId", type: "uint8" },
      { internalType: "uint256", name: "secondsAmount", type: "uint256" },
      { internalType: "uint256", name: "feeAmount", type: "uint256" },
    ],
    name: "setDurationConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "shortCode",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "urlOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "originalUrl",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    name: "ShortUrlCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "shortCode",
        type: "bytes32",
      },
    ],
    name: "ShortUrlDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "shortCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newExpiry",
        type: "uint256",
      },
    ],
    name: "ShortUrlRenewed",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address payable", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "durationToFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "durationToSeconds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "shortCode", type: "bytes32" }],
    name: "getExpiry",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "shortCode", type: "bytes32" }],
    name: "getOriginalUrl",
    outputs: [
      { internalType: "string", name: "url", type: "string" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "shortCode", type: "bytes32" }],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "shortCode", type: "bytes32" }],
    name: "isActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "shortUrls",
    outputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "string", name: "originalUrl", type: "string" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "expiresAt", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// =====================
// 3. GLOBALS
// =====================
let provider;
let signer;
let contract;
let currentAccount = null;

// Helpers

function generateSlug(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}

function toBytes32FromText(text) {
  if (text.startsWith("0x") && text.length === 66) {
    return text;
  }
  const bytes = ethers.toUtf8Bytes(text);
  const hash = ethers.keccak256(bytes);
  return hash;
}

function formatTimestamp(ts) {
  if (!ts || ts === 0) return "--";
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString();
}

// Robust fee fetching
async function getFeeFromContractOrFallback(durationId) {
  try {
    if (!contract) throw new Error("Contract not ready");

    const feeWei = await contract.durationToFee(durationId);
    return feeWei;
  } catch (err) {
    console.warn("durationToFee() failed or reverted. Using fallback...", err);

    if (durationId === 1) {
      return ethers.parseEther("0.001"); // 30 days
    } else if (durationId === 2) {
      return ethers.parseEther("0.0018"); // 60 days
    } else {
      throw new Error("Invalid durationId");
    }
  }
}

// =====================
// 4. WALLET CONNECT
// =====================
async function connectWallet() {
  const connectBtn = document.getElementById("connectBtn");
  const walletStatus = document.getElementById("walletStatus");

  if (!window.ethereum) {
    walletStatus.textContent = "MetaMask not found";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    currentAccount = accounts[0];

    // 🔑 make sure we are on Sepolia
    await switchToSepolia();

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    walletStatus.textContent = `Connected: ${currentAccount.slice(
      0,
      6
    )}...${currentAccount.slice(-4)}`;
    connectBtn.textContent = "Connected";
    connectBtn.disabled = true;
  } catch (err) {
    console.error(err);
    walletStatus.textContent = "Connection failed";
  }
}

// =====================
// 5. NAV SETUP
// =====================
function setupNav() {
  const buttons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.section;

      sections.forEach((sec) => {
        if (sec.id === `section-${target}`) sec.classList.add("visible");
        else sec.classList.remove("visible");
      });
    });
  });
}

// =====================
// 6. CREATE SHORT URL
// =====================
async function handleCreate() {
  const originalUrlInput = document.getElementById("originalUrl");
  const durationSelect = document.getElementById("durationSelect");
  const createStatus = document.getElementById("createStatus");
  const resultBox = document.getElementById("createdResult");
  const shortCodeText = document.getElementById("shortCodeText");
  const shareLinkText = document.getElementById("shareLinkText");
  const shortExpiryText = document.getElementById("shortExpiryText");

  createStatus.textContent = "";
  createStatus.className = "status";
  resultBox.classList.add("hidden");

  if (!contract || !signer) {
    createStatus.textContent = "Connect wallet first.";
    createStatus.classList.add("error");
    return;
  }

  const url = originalUrlInput.value.trim();
  if (!url) {
    createStatus.textContent = "Please enter a URL.";
    createStatus.classList.add("error");
    return;
  }

  const durationId = Number(durationSelect.value);

  try {
    const feeWei = await getFeeFromContractOrFallback(durationId);
    const feeEth = ethers.formatEther(feeWei);

    createStatus.textContent = `Creating short URL... (fee: ${feeEth} ETH)`;

    // 2. Generate a short human-friendly slug
    const slug = generateSlug(8); // like "aB7kP2xQ"
    const shortCode = toBytes32FromText(slug); // bytes32 for the contract

    // 3. Send transaction with explicit gasLimit
    const tx = await contract.createShortUrl(shortCode, url, durationId, {
      value: feeWei,
      gasLimit: 500000,
    });

    createStatus.textContent = "Waiting for confirmation...";
    const receipt = await tx.wait();
    console.log("Tx mined:", receipt);

    const expiryTs = await contract.getExpiry(shortCode);

    // Show the short slug to the user, not the bytes32 hex
    shortCodeText.textContent = slug;
    shortExpiryText.textContent = formatTimestamp(expiryTs);

    // Share the slug in the URL
    const shareLink = `${window.location.origin}${
      window.location.pathname
    }?code=${encodeURIComponent(slug)}`;
    shareLinkText.textContent = shareLink;

    resultBox.classList.remove("hidden");

    createStatus.textContent = "Short URL created!";
    createStatus.classList.add("success");
  } catch (err) {
    console.error("Creation failed:", err);

    if (err.code === "ACTION_REJECTED") {
      createStatus.textContent = "Transaction rejected by user.";
    } else if (err.data && err.data.message) {
      createStatus.textContent = `Contract Error: ${err.data.message}`;
    } else {
      createStatus.textContent =
        err.reason || err.message || "Transaction failed.";
    }
    createStatus.classList.add("error");
  }
}

// =====================
// 7. RESOLVE SHORT URL
// =====================
async function handleResolve() {
  const resolveInput = document.getElementById("resolveCode");
  const resolveStatus = document.getElementById("resolveStatus");
  const resolveResult = document.getElementById("resolveResult");
  const resolvedUrlEl = document.getElementById("resolvedUrl");
  const resolvedActiveEl = document.getElementById("resolvedActive");

  resolveStatus.textContent = "";
  resolveStatus.className = "status";
  resolveResult.classList.add("hidden");

  if (!provider) {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } else {
      resolveStatus.textContent = "No provider found.";
      resolveStatus.classList.add("error");
      return;
    }
  }

  const inputText = resolveInput.value.trim();
  if (!inputText) {
    resolveStatus.textContent = "Enter a short code.";
    resolveStatus.classList.add("error");
    return;
  }

  try {
    const shortCode = toBytes32FromText(inputText);
    const [url, isActive] = await contract.getOriginalUrl(shortCode);

    if (!url) {
      resolveStatus.textContent = "Short URL not found.";
      resolveStatus.classList.add("error");
      return;
    }

    resolvedUrlEl.textContent = url;
    resolvedUrlEl.href = url;
    resolvedActiveEl.textContent = isActive ? "Yes" : "No (Expired)";

    resolveResult.classList.remove("hidden");
    resolveStatus.textContent = "Resolved successfully.";
    resolveStatus.classList.add("success");
  } catch (err) {
    console.error(err);
    resolveStatus.textContent =
      err?.reason || err?.message || "Failed to resolve.";
    resolveStatus.classList.add("error");
  }
}

function setupVisitButton() {
  const visitBtn = document.getElementById("visitBtn");
  const resolvedUrlEl = document.getElementById("resolvedUrl");

  visitBtn.addEventListener("click", () => {
    const url = resolvedUrlEl.href;
    if (url) window.open(url, "_blank");
  });
}

// =====================
// 8. MANAGE URL
// =====================
async function handleCheckOwner() {
  const manageCodeInput = document.getElementById("manageCode");
  const manageStatus = document.getElementById("manageStatus");
  const manageInfo = document.getElementById("manageInfo");
  const ownerEl = document.getElementById("manageOwner");
  const expiryEl = document.getElementById("manageExpiry");
  const activeEl = document.getElementById("manageActive");

  manageStatus.textContent = "";
  manageStatus.className = "status";
  manageInfo.classList.add("hidden");

  if (!contract) {
    manageStatus.textContent = "Connect wallet first.";
    manageStatus.classList.add("error");
    return;
  }

  const codeText = manageCodeInput.value.trim();
  if (!codeText) {
    manageStatus.textContent = "Enter a short code.";
    manageStatus.classList.add("error");
    return;
  }

  try {
    const shortCode = toBytes32FromText(codeText);
    const owner = await contract.getOwner(shortCode);
    const expiry = await contract.getExpiry(shortCode);
    const isActive = await contract.isActive(shortCode);

    if (owner === ethers.ZeroAddress) {
      manageStatus.textContent = "Short URL not found.";
      manageStatus.classList.add("error");
      return;
    }

    ownerEl.textContent = owner;
    expiryEl.textContent = formatTimestamp(expiry);
    activeEl.textContent = isActive ? "Yes" : "No";

    manageInfo.classList.remove("hidden");

    if (
      currentAccount &&
      owner.toLowerCase() === currentAccount.toLowerCase()
    ) {
      manageStatus.textContent = "You are the owner of this URL.";
      manageStatus.classList.add("success");
    } else {
      manageStatus.textContent = "You are NOT the owner of this URL.";
      manageStatus.classList.add("error");
    }
  } catch (err) {
    console.error(err);
    manageStatus.textContent =
      err?.reason || err?.message || "Error fetching owner.";
    manageStatus.classList.add("error");
  }
}

async function handleRenew() {
  const manageCodeInput = document.getElementById("manageCode");
  const renewDurationSelect = document.getElementById("renewDurationSelect");
  const manageStatus = document.getElementById("manageStatus");

  manageStatus.textContent = "";
  manageStatus.className = "status";

  if (!contract || !signer) {
    manageStatus.textContent = "Connect wallet first.";
    manageStatus.classList.add("error");
    return;
  }

  const codeText = manageCodeInput.value.trim();
  if (!codeText) {
    manageStatus.textContent = "Enter a short code.";
    manageStatus.classList.add("error");
    return;
  }

  const durationId = Number(renewDurationSelect.value);

  try {
    const shortCode = toBytes32FromText(codeText);
    const feeWei = await getFeeFromContractOrFallback(durationId);
    const feeEth = ethers.formatEther(feeWei);

    manageStatus.textContent = `Renewing URL... (fee: ${feeEth} ETH)`;

    const tx = await contract.renewShortUrl(shortCode, durationId, {
      value: feeWei,
    });
    const receipt = await tx.wait();
    console.log("Renew tx:", receipt);

    manageStatus.textContent = "URL renewed successfully.";
    manageStatus.classList.add("success");

    await handleCheckOwner();
  } catch (err) {
    console.error(err);
    manageStatus.textContent =
      err?.reason || err?.message || "Failed to renew.";
    manageStatus.classList.add("error");
  }
}

async function handleDelete() {
  const manageCodeInput = document.getElementById("manageCode");
  const manageStatus = document.getElementById("manageStatus");
  const manageInfo = document.getElementById("manageInfo");

  manageStatus.textContent = "";
  manageStatus.className = "status";

  if (!contract || !signer) {
    manageStatus.textContent = "Connect wallet first.";
    manageStatus.classList.add("error");
    return;
  }

  const codeText = manageCodeInput.value.trim();
  if (!codeText) {
    manageStatus.textContent = "Enter a short code.";
    manageStatus.classList.add("error");
    return;
  }

  if (!confirm("Are you sure you want to delete this short URL?")) {
    return;
  }

  try {
    const shortCode = toBytes32FromText(codeText);
    manageStatus.textContent = "Deleting URL...";
    const tx = await contract.deleteShortUrl(shortCode);
    const receipt = await tx.wait();
    console.log("Delete tx:", receipt);

    manageStatus.textContent = "URL deleted.";
    manageStatus.classList.add("success");
    manageInfo.classList.add("hidden");
  } catch (err) {
    console.error(err);
    manageStatus.textContent =
      err?.reason || err?.message || "Failed to delete.";
    manageStatus.classList.add("error");
  }
}

// =====================
// 9. HANDLE ?code= AUTO-RESOLVE
// =====================
async function handleQueryCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;

  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelector('[data-section="resolve"]').classList.add("active");

  document.querySelectorAll(".section").forEach((sec) => {
    if (sec.id === "section-resolve") sec.classList.add("visible");
    else sec.classList.remove("visible");
  });

  document.getElementById("resolveCode").value = code;
  await handleResolve();
}

// =====================
// 10. SETUP LISTENERS
// =====================
window.addEventListener("DOMContentLoaded", () => {
  setupNav();

  document
    .getElementById("connectBtn")
    .addEventListener("click", connectWallet);
  document.getElementById("createBtn").addEventListener("click", handleCreate);
  document
    .getElementById("resolveBtn")
    .addEventListener("click", handleResolve);
  document
    .getElementById("checkOwnerBtn")
    .addEventListener("click", handleCheckOwner);
  document.getElementById("renewBtn").addEventListener("click", handleRenew);
  document.getElementById("deleteBtn").addEventListener("click", handleDelete);

  setupVisitButton();
  handleQueryCode();
});
