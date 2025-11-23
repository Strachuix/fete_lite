class SampleDataManager {
  constructor() {
    this.sampleEvents = [];
    this.isDataLoaded = false;
    this.initializeSampleData();
  }

  initializeSampleData() {
    console.log("[SampleData] Initialized (API-based mode)");
  }

  async loadSampleDataFromAPI() {
    console.log("[SampleData] Fetching sample events from API...");
    try {
      const apiUrl =
        window.Config?.getApiUrl?.() ||
        "https://fetebackend-production.up.railway.app/";
      const endpoint = `${apiUrl}sample-events`;

      console.log(`[SampleData] Fetching sample events from: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const events = await response.json();

      if (!Array.isArray(events)) {
        throw new Error("API did not return an array of events");
      }

      console.log(
        `[SampleData] ✓ Loaded ${events.length} sample events from API`
      );
      this.sampleEvents = events;
      return events;
    } catch (error) {
      console.error(
        "[SampleData] Error fetching from API, using fallback:",
        error
      );
      return [];
    }
  }

  async loadSampleData() {
    console.log("[SampleData] Loading sample data into app...");
    if (this.isDataLoaded) {
      console.log("[SampleData] Sample data already loaded");
      return false;
    }

    try {
      const existingEvents = window.storageManager?.getAllEvents() || [];
      const nonSampleEvents = existingEvents.filter((event) => !event.isSample);
      if (nonSampleEvents.length > 0) {
        console.log(
          "[SampleData] User events already exist, skipping sample data"
        );
        return false;
      }

      this.clearSampleData();

      const eventsFromAPI = await this.loadSampleDataFromAPI();
      if (eventsFromAPI.length === 0) {
        console.warn("[SampleData] No events returned from API");
        return false;
      }

      let addedCount = 0;
      console.log(
        `[SampleData] Attempting to load ${eventsFromAPI.length} events from API`
      );

      eventsFromAPI.forEach((event) => {
        if (window.storageManager?.saveEvent(event)) {
          addedCount++;
        }
      });

      this.isDataLoaded = true;
      localStorage.setItem("sampleDataLoaded", "true");
      localStorage.setItem("sampleDataTimestamp", new Date().toISOString());

      console.log(
        `[SampleData] ✅ Loaded ${addedCount} of ${eventsFromAPI.length} sample events`
      );

      this.notifyDataLoaded();

      try {
        const usersLoaded = await this.loadSampleUsers();
        console.log(
          `[SampleData] Loaded ${usersLoaded} sample users into localStorage`
        );
      } catch (e) {
        console.warn("[SampleData] Could not load sample users:", e);
      }

      return true;
    } catch (error) {
      console.error("[SampleData] Error loading sample data:", error);
      return false;
    }
  }

  clearSampleData() {
    try {
      const allEvents = window.storageManager?.getAllEvents() || [];
      const sampleEvents = allEvents.filter((event) => event.isSample);

      let removedCount = 0;
      sampleEvents.forEach((event) => {
        if (window.storageManager?.deleteEvent(event.id)) {
          removedCount++;
        }
      });

      if (removedCount > 0) {
        console.log(`[SampleData] Removed ${removedCount} sample events`);
        this.notifyDataCleared();
      }

      this.isDataLoaded = false;
      localStorage.removeItem("sampleDataLoaded");
      localStorage.removeItem("sampleDataTimestamp");

      return removedCount;
    } catch (error) {
      console.error("[SampleData] Error clearing sample data:", error);
      return 0;
    }
  }

  isSampleDataLoaded() {
    return localStorage.getItem("sampleDataLoaded") === "true";
  }

  notifyDataLoaded() {
    const event = new CustomEvent("sampledataloaded", {
      detail: { count: this.sampleEvents.length },
    });
    document.dispatchEvent(event);

    if (window.showNotification) {
      showNotification(
        t("sampleData.loaded", { count: this.sampleEvents.length }),
        "success"
      );
    }

    if (window.eventManager?.displayEvents) {
      window.eventManager.displayEvents();
    }
  }

  notifyDataCleared() {
    const event = new CustomEvent("sampledatacleared");
    document.dispatchEvent(event);

    if (window.showNotification) {
      showNotification(t("sampleData.cleared"), "info");
    }

    if (window.eventManager?.displayEvents) {
      window.eventManager.displayEvents();
    }
  }

  getSampleDataStats() {
    const allEvents = window.storageManager?.getAllEvents() || [];
    const sampleEvents = allEvents.filter((event) => event.isSample);
    const userEvents = allEvents.filter((event) => !event.isSample);

    return {
      total: allEvents.length,
      sample: sampleEvents.length,
      user: userEvents.length,
      isLoaded: this.isSampleDataLoaded(),
      sampleEventIds: sampleEvents.map((e) => e.id),
    };
  }

  async loadSampleUsersFromAPI() {
    try {
      const apiUrl =
        window.Config?.getApiUrl?.() ||
        "https://backend-production-bb92.up.railway.app/";
      const endpoint = `${apiUrl}sample-users`;

      console.log(`[SampleData] Fetching sample users from: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });

      if (!response.ok)
        throw new Error(`API returned status ${response.status}`);

      const users = await response.json();
      if (!Array.isArray(users))
        throw new Error("API did not return an array of users");

      return users;
    } catch (error) {
      console.error("[SampleData] Error fetching users from API:", error);
      return [];
    }
  }

  async loadSampleUsers() {
    const usersFromApi = await this.loadSampleUsersFromAPI();
    if (!usersFromApi || usersFromApi.length === 0) return 0;

    const existing = JSON.parse(localStorage.getItem("fete_users") || "[]");
    const emails = new Set(existing.map((u) => u.email));

    let added = 0;
    usersFromApi.forEach((u) => {
      if (!u.email) return;
      if (emails.has(u.email)) return;

      const name = u.name || u.username || "";
      const parts = name.split(" ");
      const first_name = parts.shift() || "";
      const last_name = parts.join(" ") || "";

      const idNum = Number(u.id) || Date.now();
      const userObj = {
        id: idNum,
        email: u.email,
        password: u.password || "changeme",
        first_name,
        last_name,
        avatar_url: u.avatar_url || null,
        created_at: u.createdAt || new Date().toISOString(),
        email_verified: false,
        phone_verified: false,
      };

      existing.push(userObj);
      emails.add(u.email);
      added++;
    });

    if (added > 0) {
      localStorage.setItem("fete_users", JSON.stringify(existing));
    }

    return added;
  }

  createSampleDataInterface() {
    const container = document.createElement("div");
    container.className = "sample-data-container";
    container.innerHTML = `
      <div class="sample-data-section">
        <h4>📋 ${t("sampleData.title")}</h4>
        <p>${t("sampleData.description")}</p>
        <div class="sample-data-actions">
          <button id="load-sample-data-btn" class="btn btn-primary btn-sm">
            ${t("sampleData.loadButton")}
          </button>
          <button id="clear-sample-data-btn" class="btn btn-secondary btn-sm">
            ${t("sampleData.clearButton")}
          </button>
        </div>
        <div class="sample-data-status">
          <small id="sample-data-status-text">${this.getStatusText()}</small>
        </div>
      </div>
    `;

    const loadBtn = container.querySelector("#load-sample-data-btn");
    const clearBtn = container.querySelector("#clear-sample-data-btn");

    loadBtn.addEventListener("click", async () => {
      const success = await this.loadSampleData();
      if (success) this.updateInterface();
    });

    clearBtn.addEventListener("click", () => {
      if (confirm(t("sampleData.clearConfirm"))) {
        this.clearSampleData();
        this.updateInterface();
      }
    });

    this.updateButtonStates(container);
    return container;
  }

  updateInterface() {
    const container = document.querySelector(".sample-data-container");
    if (!container) return;

    const statusText = container.querySelector("#sample-data-status-text");
    if (statusText) statusText.textContent = this.getStatusText();

    this.updateButtonStates(container);
  }

  updateButtonStates(container) {
    const loadBtn = container.querySelector("#load-sample-data-btn");
    const clearBtn = container.querySelector("#clear-sample-data-btn");
    const stats = this.getSampleDataStats();

    if (loadBtn) loadBtn.disabled = stats.sample > 0;
    if (clearBtn) clearBtn.disabled = stats.sample === 0;
  }

  getStatusText() {
    const stats = this.getSampleDataStats();
    if (stats.sample === 0 && stats.user === 0) return t("sampleData.noEvents");
    else if (stats.sample > 0)
      return t("sampleData.sampleLoaded", { count: stats.sample });
    else return t("sampleData.userEvents", { count: stats.user });
  }

  addSampleDataStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .sample-data-container { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; margin: 16px 0; }
      .sample-data-section h4 { margin: 0 0 8px 0; color: var(--color-primary); font-size: 1.1rem; }
      .sample-data-section p { margin: 0 0 16px 0; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.4; }
      .sample-data-actions { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
      .sample-data-status small { color: var(--color-text-secondary); font-size: 0.8rem; }
      .sample-data-container .btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .event-card[data-is-sample="true"] { position: relative; border-left: 4px solid #10b981; }
      .event-card[data-is-sample="true"]::before { content: "📋"; position: absolute; top: 8px; right: 8px; font-size: 0.8rem; opacity: 0.7; }
      .event-card[data-is-sample="true"] .event-title::after { content: " (demo)"; font-size: 0.8rem; color: var(--color-text-secondary); }
    `;
    document.head.appendChild(style);
  }
}

// Auto-load przy pierwszym uruchomieniu
async function autoLoadSampleDataOnFirstRun() {
  const hasAnyEvents = (window.storageManager?.getAllEvents() || []).length > 0;
  if (!hasAnyEvents) {
    console.log("[SampleData] No events found - loading sample data from API");
    await window.sampleDataManager?.loadSampleData();
  } else {
    console.log("[SampleData] Events already exist in app");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  window.sampleDataManager = new SampleDataManager();
  window.sampleDataManager.addSampleDataStyles();
  setTimeout(autoLoadSampleDataOnFirstRun, 1000);
});

// Global functions
window.loadSampleData = () => window.sampleDataManager?.loadSampleData();
window.loadSampleDataFromAPI = () =>
  window.sampleDataManager?.loadSampleDataFromAPI();
window.createSampleDataInterface = () =>
  window.sampleDataManager?.createSampleDataInterface();
window.clearSampleData = () => window.sampleDataManager?.clearSampleData();
window.getSampleDataStats = () =>
  window.sampleDataManager?.getSampleDataStats();
