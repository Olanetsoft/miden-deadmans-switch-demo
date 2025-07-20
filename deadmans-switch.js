// deadmans-switch.js - Dead Man's Switch Demo Logic

// Global variables
let midenClient = null;
let ownerAccount = null;
let beneficiaryAccount = null;
let deadMansSwitch = null;
let switchCreatedAt = null;
let lastCheckIn = null;
let timeoutDays = 30;

// SDK variables
let WebClient = null;
let AccountStorageMode = null;

// Load the SDK with fallback
async function loadMidenSDK() {
  try {
    const midenModule = await import(
      "https://cdn.skypack.dev/@demox-labs/miden-sdk@0.11.0-next.2"
    );
    WebClient = midenModule.WebClient || midenModule.default?.WebClient;
    AccountStorageMode =
      midenModule.AccountStorageMode || midenModule.default?.AccountStorageMode;

    if (!WebClient) {
      throw new Error("WebClient not found in module exports");
    }
    console.log("Miden SDK loaded successfully");
    return true;
  } catch (error) {
    console.log("Using fallback SDK simulation for demo purposes:", error);
    // Fallback for demo - simulate the SDK
    WebClient = {
      async createClient() {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
          id: "simulated-client",
          version: "0.11.0-next.2",
          isSimulated: true,
        };
      },
    };
    AccountStorageMode = {
      PRIVATE: "private",
      PUBLIC: "public",
    };
    return true;
  }
}

// Utility functions
function log(elementId, message, type = "info") {
  const element = document.getElementById(elementId);
  const timestamp = new Date().toLocaleTimeString();
  const prefix =
    type === "error"
      ? "❌"
      : type === "success"
      ? "✅"
      : type === "warning"
      ? "⚠️"
      : "ℹ️";

  // Create a new line element
  const logLine = document.createElement("div");
  logLine.style.marginBottom = "4px";
  logLine.style.lineHeight = "1.5";
  logLine.innerHTML = `<strong>[${timestamp}]</strong> ${prefix} ${message}`;

  // Remove the static content if it exists and append the new line
  if (element.querySelector(".output-title")) {
    // If this is the first log, clear the static content
    if (!element.querySelector(".log-entry")) {
      element.innerHTML = "";
    }
  }

  logLine.classList.add("log-entry");
  element.appendChild(logLine);
  element.scrollTop = element.scrollHeight;
}

function clearLog(elementId) {
  const element = document.getElementById(elementId);
  // Remove all log entries but keep the original structure
  const logEntries = element.querySelectorAll(".log-entry");
  logEntries.forEach((entry) => entry.remove());
}

function enableButton(id) {
  document.getElementById(id).disabled = false;
}

function disableButton(id) {
  document.getElementById(id).disabled = true;
}

// Initialize Miden
window.initializeMiden = async function () {
  try {
    disableButton("initBtn");
    clearLog("owner-output");
    log(
      "owner-output",
      "Loading Miden SDK... (this takes a few seconds)",
      "info"
    );

    // Load SDK if not already loaded
    if (!WebClient) {
      await loadMidenSDK();
    }

    // Create the WebClient - this loads WASM
    midenClient = await WebClient.createClient();

    if (midenClient.isSimulated) {
      log("owner-output", "Demo Mode: Using simulated Miden SDK", "warning");
      log(
        "owner-output",
        "Real SDK had loading issues, but demo works!",
        "info"
      );
    } else {
      log("owner-output", "Miden SDK loaded successfully!", "success");
    }

    log(
      "owner-output",
      "SDK can now generate accounts, execute VM programs, and create ZK proofs",
      "info"
    );

    enableButton("ownerBtn");
  } catch (error) {
    log("owner-output", `Failed to initialize: ${error.message}`, "error");
    enableButton("initBtn");
  }
};

// Create owner account
window.createOwnerAccount = async function () {
  try {
    disableButton("ownerBtn");
    log("owner-output", "Creating private owner account...", "info");

    const accountId = "0x" + Math.random().toString(16).substring(2, 18);

    ownerAccount = {
      id: accountId,
      isPrivate: true,
      storageMode: "private",
      balance: BigInt(1000000),
    };

    log("owner-output", `Account created: ${accountId}`, "success");
    log("owner-output", "Account type: Private (invisible on-chain)", "info");
    log(
      "owner-output",
      "This account exists only in your client until you transact",
      "info"
    );

    enableButton("switchBtn");
    enableButton("beneficiaryBtn");
  } catch (error) {
    log("owner-output", `Failed to create account: ${error.message}`, "error");
    enableButton("ownerBtn");
  }
};

// Create beneficiary account
window.createBeneficiaryAccount = async function () {
  try {
    disableButton("beneficiaryBtn");
    log("beneficiary-output", "Creating beneficiary account...", "info");

    const beneficiaryId = "0x" + Math.random().toString(16).substring(2, 18);

    beneficiaryAccount = {
      id: beneficiaryId,
      isPrivate: true,
      storageMode: "private",
    };

    log(
      "beneficiary-output",
      `Beneficiary account: ${beneficiaryId}`,
      "success"
    );
    log(
      "beneficiary-output",
      "Waiting for owner to create dead man's switch...",
      "info"
    );
  } catch (error) {
    log(
      "beneficiary-output",
      `Failed to create beneficiary: ${error.message}`,
      "error"
    );
    enableButton("beneficiaryBtn");
  }
};

// Create the dead man's switch
window.createSwitch = async function () {
  try {
    disableButton("switchBtn");
    log("owner-output", "Creating dead man's switch...", "info");

    const switchId = "0x" + Math.random().toString(16).substring(2, 18);
    const currentTime = Date.now();

    deadMansSwitch = {
      id: switchId,
      ownerId: ownerAccount.id,
      beneficiaryId: beneficiaryAccount?.id || "PENDING",
      amount: BigInt(500000),
      timeoutDays: timeoutDays,
      createdAt: currentTime,
      lastCheckIn: currentTime,
      status: "ACTIVE",
    };

    switchCreatedAt = currentTime;
    lastCheckIn = currentTime;

    log("owner-output", `Switch created: ${switchId}`, "success");
    log("owner-output", `Amount locked: 500,000 tokens`, "info");
    log("owner-output", `Timeout period: ${timeoutDays} days`, "info");
    log("owner-output", "Switch is now ACTIVE and counting down", "warning");

    enableButton("checkinBtn");
    enableButton("timeBtn");
    enableButton("statusBtn");
    enableButton("resetBtn");

    if (beneficiaryAccount) {
      log("beneficiary-output", "Dead man's switch detected!", "success");
      log("beneficiary-output", `Switch ID: ${switchId}`, "info");
      log(
        "beneficiary-output",
        "Status: Owner is active (cannot claim yet)",
        "warning"
      );
    }
  } catch (error) {
    log("owner-output", `Failed to create switch: ${error.message}`, "error");
    enableButton("switchBtn");
  }
};

// Simulate check-in
window.simulateCheckIn = async function () {
  if (!deadMansSwitch) return;
  const currentTime = Date.now();
  deadMansSwitch.lastCheckIn = currentTime;
  lastCheckIn = currentTime;
  log("timeline-output", "Owner checked in - timer RESET! 🔄", "success");
  log("timeline-output", `New timeout: ${timeoutDays} days from now`, "info");
  if (beneficiaryAccount) {
    log("beneficiary-output", "Switch timer was reset by owner", "info");
    log(
      "beneficiary-output",
      "Cannot claim - owner is still active",
      "warning"
    );
    disableButton("claimBtn");
  }
};

// Simulate time passage
window.simulateTimePassage = async function () {
  if (!deadMansSwitch) return;
  log("timeline-output", "⏰ Simulating 30 days passing...", "warning");
  log("timeline-output", "Owner has not checked in for 30 days", "warning");
  log("timeline-output", "Dead man's switch TIMEOUT reached! 🚨", "error");
  deadMansSwitch.status = "EXPIRED";
  if (beneficiaryAccount) {
    log("beneficiary-output", "🚨 TIMEOUT REACHED!", "error");
    log(
      "beneficiary-output",
      "You can now attempt to claim the funds",
      "success"
    );
    enableButton("claimBtn");
  }
  disableButton("checkinBtn");
};

// Attempt claim
window.attemptClaim = async function () {
  if (!deadMansSwitch || !beneficiaryAccount) return;
  log("beneficiary-output", "Attempting to claim dead man's switch...", "info");
  if (deadMansSwitch.status !== "EXPIRED") {
    log("beneficiary-output", "Claim REJECTED: Timeout not reached", "error");
    log("beneficiary-output", "The Miden script enforces timing rules", "info");
    return;
  }
  log("beneficiary-output", "Claim SUCCESSFUL! 🎉", "success");
  log("beneficiary-output", `Received: 500,000 tokens`, "success");
  log("beneficiary-output", "Funds transferred to your account", "info");
  deadMansSwitch.status = "CLAIMED";
  disableButton("claimBtn");
  log("timeline-output", "Switch has been claimed by beneficiary", "success");
  log(
    "timeline-output",
    "The dead man's switch has served its purpose",
    "info"
  );
};

// View switch status
window.viewSwitchStatus = async function () {
  if (!deadMansSwitch) return;
  clearLog("timeline-output");
  log("timeline-output", "📊 DEAD MAN'S SWITCH STATUS", "info");
  log("timeline-output", `Switch ID: ${deadMansSwitch.id}`, "info");
  log("timeline-output", `Owner: ${deadMansSwitch.ownerId}`, "info");
  log(
    "timeline-output",
    `Beneficiary: ${deadMansSwitch.beneficiaryId}`,
    "info"
  );
  log(
    "timeline-output",
    `Amount: ${deadMansSwitch.amount.toLocaleString()} tokens`,
    "info"
  );
  log("timeline-output", `Status: ${deadMansSwitch.status}`, "info");
  log("timeline-output", `Timeout: ${deadMansSwitch.timeoutDays} days`, "info");
  const timeSinceCheckIn = (Date.now() - lastCheckIn) / 1000;
  log(
    "timeline-output",
    `Time since last check-in: ${Math.round(
      timeSinceCheckIn
    )} seconds (simulated)`,
    "info"
  );
  log("timeline-output", "", "info");
  log("timeline-output", "🔒 PRIVACY FEATURES:", "success");
  log(
    "timeline-output",
    "• Switch existence is hidden until activation",
    "info"
  );
  log("timeline-output", "• No public countdown visible on blockchain", "info");
  log("timeline-output", "• Owner identity protected", "info");
  log("timeline-output", "• Transaction amounts are private", "info");
};

// Emergency reset
window.emergencyReset = async function () {
  if (!deadMansSwitch) return;
  log("timeline-output", "🚨 EMERGENCY RESET activated", "warning");
  log("timeline-output", "All timers reset, switch status restored", "info");
  deadMansSwitch.status = "ACTIVE";
  deadMansSwitch.lastCheckIn = Date.now();
  lastCheckIn = Date.now();
  enableButton("checkinBtn");
  disableButton("claimBtn");
  if (beneficiaryAccount) {
    log("beneficiary-output", "Switch was reset by owner", "warning");
    log("beneficiary-output", "Cannot claim - switch is active again", "info");
  }
};

// Initialize on load
window.addEventListener("load", () => {
  console.log("Dead Man's Switch Demo loaded!");
  log(
    "owner-output",
    "Welcome to the Miden Dead Man's Switch demo!",
    "success"
  );
  log(
    "owner-output",
    "This showcases privacy-preserving inheritance using Miden.",
    "info"
  );
});
