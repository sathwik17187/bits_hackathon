/**
 * HackSphere 3.0 Dashboard Application Logic
 * Integrates Chart.js, FastAPI backend, and real-time transition simulation.
 */

let forecastChart = null;
let currentForecastData = null;

// Thresholds
const RENEWABLE_THRESHOLD = 160.0;
const OVERLOAD_THRESHOLD = 200.0;

document.addEventListener("DOMContentLoaded", () => {
  initChart();
  setupEventListeners();
  loadSampleForecast();
  checkHealth();
});

// Health check to update status indicator
async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const chip = document.getElementById("quickml-chip");
    const chipText = document.getElementById("quickml-status-text");

    if (data.quickml_configured) {
      chip.className = "status-chip";
      chipText.textContent = "QuickML Connected";
    } else {
      chip.className = "status-chip warning";
      chipText.textContent = "Local Pipeline Active";
    }
  } catch (err) {
    console.warn("Health check error:", err);
  }
}

// Initialize Chart.js
function initChart() {
  const ctx = document.getElementById("demandForecastChart").getContext("2d");

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, "rgba(56, 189, 248, 0.45)");
  gradient.addColorStop(0.7, "rgba(99, 102, 241, 0.15)");
  gradient.addColorStop(1, "rgba(15, 23, 42, 0.0)");

  // Plugin to draw horizontal threshold lines (160 kW and 200 kW)
  const thresholdPlugin = {
    id: "thresholdLines",
    afterDraw: (chart) => {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      if (!y) return;

      // 160 kW line (Amber dashed)
      const y160 = y.getPixelForValue(RENEWABLE_THRESHOLD);
      if (y160 >= chart.chartArea.top && y160 <= chart.chartArea.bottom) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.moveTo(left, y160);
        ctx.lineTo(right, y160);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 11px Outfit, sans-serif";
        ctx.fillText("160 kW (Renewable Threshold)", right - 180, y160 - 6);
        ctx.restore();
      }

      // 200 kW line (Red dashed)
      const y200 = y.getPixelForValue(OVERLOAD_THRESHOLD);
      if (y200 >= chart.chartArea.top && y200 <= chart.chartArea.bottom) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.moveTo(left, y200);
        ctx.lineTo(right, y200);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px Outfit, sans-serif";
        ctx.fillText("200 kW (Critical Overload)", right - 165, y200 - 6);
        ctx.restore();
      }
    }
  };

  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Predicted Demand (kW)",
          data: [],
          borderColor: "#38bdf8",
          borderWidth: 2.5,
          pointBackgroundColor: [],
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => {
              const item = currentForecastData?.hourly_forecasts[context.dataIndex];
              const mode = item ? item.grid_mode : "";
              const overload = item?.is_critical_overload ? " ⚠️ OVERLOAD" : "";
              return [
                `Demand: ${context.parsed.y.toFixed(1)} kW`,
                `Mode: ${mode}${overload}`,
                `Battery SoC: ${item ? item.battery_soc_pct : ""}%`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#94a3b8", font: { family: "Outfit", size: 11 } }
        },
        y: {
          min: 40,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#94a3b8",
            font: { family: "Outfit", size: 11 },
            callback: (val) => `${val} kW`
          }
        }
      }
    },
    plugins: [thresholdPlugin]
  });
}

// Setup button clicks and drag & drop listeners
function setupEventListeners() {
  document.getElementById("btn-refresh").addEventListener("click", () => {
    loadSampleForecast();
    checkHealth();
  });

  document.getElementById("btn-load-sample").addEventListener("click", loadSampleForecast);

  // CSV Drag and Drop
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("csv-file-input");

  uploadZone.addEventListener("click", () => fileInput.click());

  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
  });

  uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) {
      handleCsvUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleCsvUpload(e.target.files[0]);
    }
  });

  // Simulator Sliders
  const hourInput = document.getElementById("sim-hour");
  const tempInput = document.getElementById("sim-temp");
  const humidInput = document.getElementById("sim-humid");
  const solarInput = document.getElementById("sim-solar");

  hourInput.addEventListener("input", (e) => {
    document.getElementById("lbl-sim-hour").textContent = `${String(e.target.value).padStart(2, "0")}:00`;
  });
  tempInput.addEventListener("input", (e) => {
    document.getElementById("lbl-sim-temp").textContent = `${parseFloat(e.target.value).toFixed(1)} °C`;
  });
  humidInput.addEventListener("input", (e) => {
    document.getElementById("lbl-sim-humid").textContent = `${e.target.value} %`;
  });
  solarInput.addEventListener("input", (e) => {
    document.getElementById("lbl-sim-solar").textContent = `${e.target.value} W/m²`;
  });

  document.getElementById("btn-sim-run").addEventListener("click", runSingleSimulation);

  // Export CSV
  document.getElementById("btn-export-csv").addEventListener("click", exportPredictionsCsv);
}

// Load default 24-hour sample forecast
async function loadSampleForecast() {
  try {
    const res = await fetch("/api/sample-forecast");
    if (!res.ok) throw new Error("Failed to load sample forecast");
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    console.error("Error loading sample forecast:", err);
  }
}

// Upload CSV file
async function handleCsvUpload(file) {
  if (!file.name.endsWith(".csv")) {
    alert("Please upload a valid .csv file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-csv", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Upload error: ${err.detail || "Failed to process CSV"}`);
      return;
    }

    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    alert(`Upload failed: ${err.message}`);
  }
}

// Run single simulation
async function runSingleSimulation() {
  const hour = parseInt(document.getElementById("sim-hour").value);
  const temp = parseFloat(document.getElementById("sim-temp").value);
  const humid = parseFloat(document.getElementById("sim-humid").value);
  const solar = parseFloat(document.getElementById("sim-solar").value);

  const testDate = new Date();
  const dateStr = testDate.toISOString().split("T")[0];
  const timestamp = `${dateStr} ${String(hour).padStart(2, "0")}:00:00`;

  const payload = {
    telemetry: [
      {
        timestamp: timestamp,
        ambient_temp_c: temp,
        humidity_pct: humid,
        solar_irradiance_wm2: solar
      }
    ],
    initial_battery_soc: currentForecastData ? currentForecastData.summary.final_battery_soc_pct : 85.0
  };

  try {
    const res = await fetch("/api/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Simulation request failed");
    const result = await res.json();
    const single = result.hourly_forecasts[0];

    alert(
      `Simulation Result for ${single.timestamp}:\n` +
      `• Predicted Demand: ${single.predicted_demand_kw} kW\n` +
      `• Mode: ${single.grid_mode}\n` +
      `• Critical Overload: ${single.is_critical_overload ? "YES (>=200 kW)" : "NO"}\n` +
      `• Rationale: ${single.reason}`
    );
  } catch (err) {
    alert(`Simulation failed: ${err.message}`);
  }
}

// Render complete dashboard
function renderDashboard(data) {
  currentForecastData = data;
  const { summary, hourly_forecasts } = data;

  // 1. Update Alert Banner
  const alertBanner = document.getElementById("alert-banner");
  const alertDesc = document.getElementById("alert-desc-text");
  if (summary.has_critical_alert) {
    alertBanner.classList.remove("hidden");
    alertDesc.textContent = `Alert: ${summary.critical_overload_hours} hours exceed the 200 kW critical limit. Renewable battery dispatching max reserves.`;
  } else {
    alertBanner.classList.add("hidden");
  }

  // 2. Update KPI Cards
  const firstHour = hourly_forecasts[0];
  const modeText = document.getElementById("kpi-mode-text");
  const modeBadge = document.getElementById("kpi-mode-badge");
  const modeSubtext = document.getElementById("kpi-mode-subtext");

  if (firstHour) {
    modeText.textContent = firstHour.grid_mode === "RENEWABLE_STORAGE" ? "RENEWABLE" : "MAIN GRID";
    modeBadge.className = `badge-pill ${firstHour.grid_mode === "RENEWABLE_STORAGE" ? "badge-renewable" : "badge-main-grid"}`;
    modeBadge.textContent = firstHour.grid_mode === "RENEWABLE_STORAGE" ? "Battery Active" : "Grid Power";
    modeSubtext.textContent = firstHour.reason;
  }

  document.getElementById("kpi-peak-val").textContent = summary.peak_demand_kw.toFixed(1);
  const peakDelta = document.getElementById("kpi-peak-delta");
  if (summary.peak_demand_kw > RENEWABLE_THRESHOLD) {
    peakDelta.textContent = `+${(summary.peak_demand_kw - RENEWABLE_THRESHOLD).toFixed(1)} kW over 160kW threshold`;
    peakDelta.style.color = "#f59e0b";
  } else {
    peakDelta.textContent = "Safe within normal limits";
    peakDelta.style.color = "#10b981";
  }

  document.getElementById("kpi-overload-val").textContent = summary.critical_overload_hours;
  const overloadStatus = document.getElementById("kpi-overload-status");
  if (summary.critical_overload_hours > 0) {
    overloadStatus.className = "badge-pill badge-overload";
    overloadStatus.textContent = "Overload Triggered";
  } else {
    overloadStatus.className = "badge-pill badge-main-grid";
    overloadStatus.textContent = "Within Limits";
  }

  document.getElementById("kpi-battery-val").textContent = summary.final_battery_soc_pct.toFixed(1);
  document.getElementById("soc-bar-fill").style.width = `${summary.final_battery_soc_pct}%`;

  // 3. Update Chart
  const labels = hourly_forecasts.map(h => {
    const date = new Date(h.timestamp);
    return `${String(date.getHours()).padStart(2, "0")}:00`;
  });
  const demandVals = hourly_forecasts.map(h => h.predicted_demand_kw);
  const pointColors = hourly_forecasts.map(h => {
    if (h.is_critical_overload) return "#ef4444";
    if (h.grid_mode === "RENEWABLE_STORAGE") return "#f59e0b";
    return "#10b981";
  });

  forecastChart.data.labels = labels;
  forecastChart.data.datasets[0].data = demandVals;
  forecastChart.data.datasets[0].pointBackgroundColor = pointColors;
  forecastChart.update();

  // 4. Update 24-Hour Timeline Bar
  const timelineBar = document.getElementById("timeline-bar");
  timelineBar.innerHTML = "";
  hourly_forecasts.forEach(h => {
    const seg = document.createElement("div");
    seg.className = "timeline-segment";
    let bg = "#10b981";
    if (h.is_critical_overload) {
      bg = "#ef4444";
    } else if (h.grid_mode === "RENEWABLE_STORAGE") {
      bg = "#f59e0b";
    }
    seg.style.background = bg;
    seg.title = `${h.timestamp} - ${h.predicted_demand_kw} kW (${h.grid_mode})`;
    timelineBar.appendChild(seg);
  });

  // 5. Update Table
  const tbody = document.getElementById("telemetry-table-body");
  tbody.innerHTML = "";
  hourly_forecasts.forEach(h => {
    const tr = document.createElement("tr");

    let modeBadgeHtml = "";
    if (h.grid_mode === "RENEWABLE_STORAGE") {
      modeBadgeHtml = `<span class="badge-pill badge-renewable">Renewable Storage</span>`;
    } else {
      modeBadgeHtml = `<span class="badge-pill badge-main-grid">Main Grid</span>`;
    }

    let alertBadgeHtml = "";
    if (h.is_critical_overload) {
      alertBadgeHtml = `<span class="badge-pill badge-overload">Critical (≥200 kW)</span>`;
    } else {
      alertBadgeHtml = `<span style="color: var(--text-muted); font-size: 0.8rem;">Normal</span>`;
    }

    tr.innerHTML = `
      <td><strong>${h.timestamp}</strong></td>
      <td>${h.ambient_temp_c ? h.ambient_temp_c.toFixed(1) : "-"}</td>
      <td>${h.humidity_pct ? h.humidity_pct.toFixed(0) : "-"}%</td>
      <td>${h.solar_irradiance_wm2 ? h.solar_irradiance_wm2.toFixed(0) : "-"}</td>
      <td><strong style="color: var(--color-accent); font-size: 0.95rem;">${h.predicted_demand_kw} kW</strong></td>
      <td>${modeBadgeHtml}</td>
      <td>${h.battery_soc_pct}%</td>
      <td>${alertBadgeHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export predictions.csv
function exportPredictionsCsv() {
  if (!currentForecastData || !currentForecastData.hourly_forecasts) {
    alert("No forecast data available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,timestamp,target_demand_kw\n";
  currentForecastData.hourly_forecasts.forEach(h => {
    csvContent += `${h.timestamp},${h.predicted_demand_kw}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "predictions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
