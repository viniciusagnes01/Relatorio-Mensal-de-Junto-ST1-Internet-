document.documentElement.classList.add("js");

const palette = {
  blue: "#002f90",
  blue2: "#2d55ab",
  navy: "#06131f",
  orange: "#ff8100",
  cream: "#ebe8dd",
  cyan: "#52dff3",
  mint: "#42e6b1",
  yellow: "#ffd261",
  magenta: "#f064c1",
  white: "#f8fbff",
  muted: "#a8b4c4",
  darkMuted: "#607087",
  gridLight: "rgba(0,47,144,0.12)",
  gridDark: "rgba(159,190,218,0.14)",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const numberFormatter = new Intl.NumberFormat("pt-BR");
const chartDrawers = new Map();
const animatedCharts = new WeakSet();

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return { ctx, width, height };
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function smoothLinePath(ctx, points) {
  if (!points.length) return;
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  if (points.length > 1) {
    const penultimate = points[points.length - 2];
    const last = points[points.length - 1];
    ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
  }
}

function text(ctx, value, x, y, options = {}) {
  const {
    size = 12,
    weight = 500,
    color = palette.muted,
    align = "left",
    baseline = "middle",
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px Poppins, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(value, x, y);
  ctx.restore();
}

function formatCompact(value) {
  return numberFormatter.format(Math.round(value));
}

function drawGrid(ctx, left, top, width, height, max, dark = false, ticks = 4, suffix = "") {
  ctx.save();
  ctx.strokeStyle = dark ? palette.gridDark : palette.gridLight;
  ctx.lineWidth = 1;
  for (let i = 0; i <= ticks; i += 1) {
    const y = top + (height / ticks) * i;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
    const value = max - (max / ticks) * i;
    text(ctx, `${formatCompact(value)}${suffix}`, left - 10, y, {
      size: 10,
      color: dark ? palette.muted : palette.darkMuted,
      align: "right",
    });
  }
  ctx.restore();
}

function registerChart(id, drawer) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  chartDrawers.set(canvas, drawer);
}

function animateChart(canvas) {
  if (animatedCharts.has(canvas)) return;
  animatedCharts.add(canvas);
  const drawer = chartDrawers.get(canvas);
  if (!drawer) return;
  if (reducedMotion) {
    drawer(1);
    return;
  }
  const start = performance.now();
  const duration = 1350;
  function frame(now) {
    const raw = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - raw, 3);
    drawer(eased);
    if (raw < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

registerChart("papEvolutionChart", (progress) => {
  const canvas = document.getElementById("papEvolutionChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const months = ["Abril", "Maio", "Junho"];
  const sales = [2312, 2743, 2724];
  const installs = [2065, 2427, 2403];
  const compact = width < 520;
  const margins = { left: compact ? 46 : 62, right: 18, top: 36, bottom: 48 };
  const plotW = width - margins.left - margins.right;
  const plotH = height - margins.top - margins.bottom;
  const max = 3000;
  drawGrid(ctx, margins.left, margins.top, plotW, plotH, max, false, 3);
  const groupW = plotW / months.length;
  const barW = Math.min(compact ? 22 : 34, groupW * 0.22);

  months.forEach((month, index) => {
    const center = margins.left + groupW * (index + 0.5);
    const salesH = (sales[index] / max) * plotH * progress;
    const installH = (installs[index] / max) * plotH * progress;
    ctx.fillStyle = palette.blue;
    roundedRect(ctx, center - barW - 4, margins.top + plotH - salesH, barW, salesH, 7);
    ctx.fill();
    ctx.fillStyle = palette.orange;
    roundedRect(ctx, center + 4, margins.top + plotH - installH, barW, installH, 7);
    ctx.fill();
    if (progress > 0.88) {
      text(ctx, formatCompact(sales[index]), center - barW / 2 - 4, margins.top + plotH - salesH - 12, {
        size: compact ? 9 : 10,
        weight: 700,
        color: palette.blue,
        align: "center",
      });
      text(ctx, formatCompact(installs[index]), center + barW / 2 + 4, margins.top + plotH - installH - 12, {
        size: compact ? 9 : 10,
        weight: 700,
        color: "#a85500",
        align: "center",
      });
    }
    text(ctx, month, center, height - 19, {
      size: compact ? 10 : 11,
      weight: 700,
      color: palette.darkMuted,
      align: "center",
    });
  });

  ctx.fillStyle = palette.blue;
  ctx.fillRect(margins.left, 8, 10, 10);
  text(ctx, "Vendas", margins.left + 16, 13, { size: 10, color: palette.darkMuted });
  ctx.fillStyle = palette.orange;
  ctx.fillRect(margins.left + 82, 8, 10, 10);
  text(ctx, "Instalações", margins.left + 98, 13, { size: 10, color: palette.darkMuted });
});

registerChart("channelMixChart", (progress) => {
  const canvas = document.getElementById("channelMixChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const values = [51.8, 29.8, 8.4, 6.4, 3.6];
  const colors = [palette.blue, palette.orange, palette.yellow, "#93a9c7", "#ccd3dc"];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;
  const inner = radius * 0.62;
  let start = -Math.PI / 2;
  values.forEach((value, index) => {
    const slice = (value / 100) * Math.PI * 2 * progress;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, start, start + slice);
    ctx.arc(centerX, centerY, inner, start + slice, start, true);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();
    start += slice;
  });
  text(ctx, "2.724", centerX, centerY - 8, {
    size: Math.max(24, radius * 0.3),
    weight: 800,
    color: palette.blue,
    align: "center",
  });
  text(ctx, "vendas", centerX, centerY + 19, {
    size: 10,
    weight: 700,
    color: palette.darkMuted,
    align: "center",
  });
});

registerChart("cityChart", (progress) => {
  const canvas = document.getElementById("cityChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const data = [
    ["São Luís", 971],
    ["S. J. Ribamar", 443],
    ["Paço Lumiar", 276],
    ["Pinheiro", 178],
    ["Itapecuru", 144],
    ["Barreirinhas", 136],
    ["Raposa", 78],
    ["Urbano Santos", 70],
  ];
  const compact = width < 520;
  const left = compact ? 92 : 118;
  const right = 34;
  const top = 8;
  const rowH = (height - 24) / data.length;
  const plotW = width - left - right;
  const max = 1000;
  data.forEach(([label, value], index) => {
    const y = top + rowH * index + rowH / 2;
    text(ctx, label, left - 12, y, {
      size: compact ? 8.5 : 10,
      weight: 600,
      color: palette.darkMuted,
      align: "right",
    });
    ctx.fillStyle = "rgba(0,47,144,0.08)";
    roundedRect(ctx, left, y - 7, plotW, 14, 7);
    ctx.fill();
    const barW = (value / max) * plotW * progress;
    ctx.fillStyle = index === 0 ? palette.orange : palette.blue;
    roundedRect(ctx, left, y - 7, barW, 14, 7);
    ctx.fill();
    if (progress > 0.8) {
      text(ctx, formatCompact(value), Math.min(width - 3, left + barW + 8), y, {
        size: compact ? 8.5 : 10,
        weight: 700,
        color: index === 0 ? "#a85500" : palette.blue,
      });
    }
  });
});

registerChart("deltaChart", (progress) => {
  const canvas = document.getElementById("deltaChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const values = [1202, 895, 1624, 1453, 1790, 1580];
  const margins = { left: 48, right: 22, top: 30, bottom: 44 };
  const plotW = width - margins.left - margins.right;
  const plotH = height - margins.top - margins.bottom;
  const max = 2000;
  drawGrid(ctx, margins.left, margins.top, plotW, plotH, max, false, 4);
  const points = values.map((value, index) => ({
    x: margins.left + (plotW / (values.length - 1)) * index,
    y: margins.top + plotH - (value / max) * plotH,
  }));

  ctx.save();
  ctx.beginPath();
  smoothLinePath(ctx, points);
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 4;
  ctx.setLineDash([plotW * progress, plotW]);
  ctx.stroke();
  ctx.restore();

  points.forEach((point, index) => {
    if (progress < index / points.length) return;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = index === 4 ? palette.orange : palette.blue;
    ctx.fill();
    text(ctx, labels[index], point.x, height - 18, {
      size: 10,
      weight: 700,
      color: palette.darkMuted,
      align: "center",
    });
    if (progress > 0.86) {
      text(ctx, formatCompact(values[index]), point.x, point.y - 15, {
        size: 9,
        weight: 700,
        color: index === 4 ? "#a85500" : palette.blue,
        align: "center",
      });
    }
  });
});

let digitalChartView = "volume";
let digitalHover = null;
let digitalHitAreas = [];

function drawDigitalChart(progress) {
  const canvas = document.getElementById("digitalEvolutionChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const labels = ["Abril", "Maio", "Junho"];
  const isRate = digitalChartView === "rate";
  const series = isRate
    ? [
        { label: "Conversão final", values: [23.01, 24.63, 30.91], color: palette.orange },
        { label: "Lead viável", values: [54.29, 49.35, 58.4], color: palette.cyan },
        { label: "Viável → venda", values: [42.38, 49.91, 52.93], color: palette.mint },
      ]
    : [
        { label: "Leads", values: [3120, 3224, 2630], color: palette.cyan },
        { label: "Viabilidade", values: [1694, 1591, 1536], color: palette.yellow },
        { label: "Vendas", values: [718, 794, 813], color: palette.mint },
      ];
  const compact = width < 560;
  const margins = { left: compact ? 46 : 62, right: compact ? 24 : 52, top: 58, bottom: 48 };
  const plotW = width - margins.left - margins.right;
  const plotH = height - margins.top - margins.bottom;
  const max = isRate ? 65 : 3500;
  drawGrid(ctx, margins.left, margins.top, plotW, plotH, max, true, 5, isRate ? "%" : "");
  digitalHitAreas = [];

  series.forEach((item, seriesIndex) => {
    const points = item.values.map((value, index) => ({
      x: margins.left + (plotW / (item.values.length - 1)) * index,
      y: margins.top + plotH - (value / max) * plotH,
    }));
    if (seriesIndex === 0) {
      ctx.save();
      ctx.beginPath();
      smoothLinePath(ctx, points);
      ctx.lineTo(points.at(-1).x, margins.top + plotH);
      ctx.lineTo(points[0].x, margins.top + plotH);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.globalAlpha = 0.07 * progress;
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    smoothLinePath(ctx, points);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = seriesIndex === 0 ? 5 : 4;
    ctx.globalAlpha = digitalHover && digitalHover.seriesIndex !== seriesIndex ? 0.22 : 1;
    ctx.shadowColor = item.color;
    ctx.shadowBlur = 13;
    ctx.setLineDash([plotW * progress, plotW]);
    ctx.stroke();
    ctx.restore();

    points.forEach((point, index) => {
      digitalHitAreas.push({
        x: point.x,
        y: point.y,
        seriesIndex,
        index,
        month: labels[index],
        label: item.label,
        value: item.values[index],
        suffix: isRate ? "%" : "",
      });
      if (progress < 0.45 + index * 0.12) return;
      ctx.beginPath();
      const active = digitalHover?.seriesIndex === seriesIndex && digitalHover?.index === index;
      ctx.arc(point.x, point.y, active ? 9 : seriesIndex === 0 ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.globalAlpha = digitalHover && !active && digitalHover.seriesIndex !== seriesIndex ? 0.3 : 1;
      ctx.fill();
      const formattedValue = isRate
        ? `${item.values[index].toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
        : formatCompact(item.values[index]);
      text(ctx, formattedValue, point.x, point.y - 16 - seriesIndex * 2, {
        size: compact ? 9 : 10,
        weight: 800,
        color: item.color,
        align: "center",
      });
    });
  });

  labels.forEach((label, index) => {
    const x = margins.left + (plotW / (labels.length - 1)) * index;
    text(ctx, label, x, height - 18, {
      size: 11,
      weight: 700,
      color: palette.muted,
      align: "center",
    });
  });

  let legendX = margins.left;
  series.forEach((item) => {
    ctx.beginPath();
    ctx.arc(legendX + 5, 18, 5, 0, Math.PI * 2);
    ctx.fillStyle = item.color;
    ctx.fill();
    text(ctx, item.label, legendX + 16, 18, { size: 10, weight: 700, color: palette.muted });
    legendX += compact ? 92 : 116;
  });
}

registerChart("digitalEvolutionChart", drawDigitalChart);

const digitalCanvas = document.getElementById("digitalEvolutionChart");
const digitalTooltip = document.getElementById("digitalChartTooltip");
const digitalViewButtons = [...document.querySelectorAll("[data-digital-view]")];

function animateDigitalView() {
  if (reducedMotion) {
    drawDigitalChart(1);
    return;
  }
  const start = performance.now();
  const duration = 900;
  function frame(now) {
    const raw = Math.min(1, (now - start) / duration);
    drawDigitalChart(1 - Math.pow(1 - raw, 3));
    if (raw < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

digitalViewButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  button.addEventListener("click", () => {
    const nextView = button.dataset.digitalView;
    if (nextView === digitalChartView) return;
    digitalChartView = nextView;
    digitalHover = null;
    digitalTooltip?.classList.remove("is-visible");
    digitalViewButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    digitalCanvas.setAttribute(
      "aria-label",
      nextView === "rate"
        ? "Taxas por mês: conversão final de 23,01%, 24,63% e 30,91%; viabilidade de 54,29%, 49,35% e 58,40%; conversão de viável para venda de 42,38%, 49,91% e 52,93%."
        : "Abril: 3.120 leads, 1.694 viabilidades, 718 vendas. Maio: 3.224, 1.591 e 794. Junho: 2.630, 1.536 e 813.",
    );
    animateDigitalView();
  });
});

digitalCanvas?.addEventListener("pointermove", (event) => {
  const rect = digitalCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const closest = digitalHitAreas.reduce((best, area) => {
    const distance = Math.hypot(area.x - x, area.y - y);
    return !best || distance < best.distance ? { ...area, distance } : best;
  }, null);
  if (!closest || closest.distance > 34) {
    if (digitalHover) {
      digitalHover = null;
      drawDigitalChart(1);
    }
    digitalTooltip?.classList.remove("is-visible");
    return;
  }
  const changed = digitalHover?.seriesIndex !== closest.seriesIndex || digitalHover?.index !== closest.index;
  digitalHover = closest;
  if (changed) drawDigitalChart(1);
  if (digitalTooltip) {
    digitalTooltip.innerHTML = `<strong>${closest.month} · ${closest.label}</strong><span>${closest.value.toLocaleString("pt-BR", { minimumFractionDigits: closest.suffix ? 1 : 0, maximumFractionDigits: 2 })}${closest.suffix}</span>`;
    digitalTooltip.style.left = `${Math.min(rect.width - 175, Math.max(4, x))}px`;
    digitalTooltip.style.top = `${Math.min(rect.height - 70, Math.max(4, y))}px`;
    digitalTooltip.classList.add("is-visible");
  }
});

digitalCanvas?.addEventListener("pointerleave", () => {
  digitalHover = null;
  digitalTooltip?.classList.remove("is-visible");
  drawDigitalChart(1);
});

registerChart("lossReasonsChart", (progress) => {
  const canvas = document.getElementById("lossReasonsChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const data = [
    ["Interesse / prioridade", 2143, "34,6%"],
    ["Sem rede no local", 1015, "16,4%"],
    ["Atend. não comercial", 818, "13,2%"],
    ["Já possui serviço", 419, "6,8%"],
    ["Sem viabilidade", 331, "5,3%"],
    ["Condomínio inadequado", 319, "5,1%"],
    ["Kitnet / condições", 260, "4,2%"],
    ["Rede em construção", 252, "4,1%"],
  ];
  const compact = width < 520;
  const labelW = compact ? 128 : 154;
  const right = compact ? 44 : 66;
  const plotW = width - labelW - right;
  const rowH = height / data.length;
  const max = 2200;
  data.forEach(([label, value, percent], index) => {
    const y = rowH * index + rowH / 2;
    text(ctx, label, labelW - 10, y, {
      size: compact ? 8.2 : 9.5,
      weight: 600,
      color: palette.muted,
      align: "right",
    });
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, labelW, y - 7, plotW, 14, 7);
    ctx.fill();
    const barW = Math.max(3, (value / max) * plotW * progress);
    ctx.fillStyle = index === 0 ? palette.orange : palette.cyan;
    roundedRect(ctx, labelW, y - 7, barW, 14, 7);
    ctx.fill();
    if (progress > 0.82) {
      text(ctx, percent, width - 2, y, {
        size: compact ? 8.5 : 10,
        weight: 700,
        color: index === 0 ? palette.orange : palette.cyan,
        align: "right",
      });
    }
  });
});

const chartObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateChart(entry.target);
        chartObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.24 },
);

chartDrawers.forEach((_, canvas) => chartObserver.observe(canvas));

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    chartDrawers.forEach((drawer, canvas) => {
      if (animatedCharts.has(canvas)) drawer(1);
    });
  }, 120);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
  revealObserver.observe(element);
});

const hero = document.querySelector(".hero");
const heroBrandStage = document.querySelector(".hero__brand-stage");
if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  hero?.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroBrandStage.style.transform = `translate3d(${x * 18}px, ${y * 18}px, 0)`;
  });
  hero?.addEventListener("pointerleave", () => {
    heroBrandStage.style.transform = "translate3d(0, 0, 0)";
  });
}

function formatCounter(value, decimals, prefix, suffix) {
  return `${prefix}${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}${suffix}`;
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      counterObserver.unobserve(element);
      const value = Number(element.dataset.value || 0);
      const decimals = Number(element.dataset.decimals || 0);
      const prefix = element.dataset.prefix || "";
      const suffix = element.dataset.suffix || "";
      if (reducedMotion) {
        element.textContent = formatCounter(value, decimals, prefix, suffix);
        return;
      }
      const start = performance.now();
      const duration = 950;
      function step(now) {
        const raw = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - raw, 3);
        element.textContent = formatCounter(value * eased, decimals, prefix, suffix);
        if (raw < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  },
  { threshold: 0.35 },
);

document.querySelectorAll(".counter").forEach((element) => counterObserver.observe(element));

const progressBar = document.querySelector(".scroll-progress span");
const topbarLinks = [...document.querySelectorAll(".topbar__nav a")];
const reportSections = [...document.querySelectorAll("main > section[id]")];

function updateScrollState() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;

  const marker = window.scrollY + window.innerHeight * 0.36;
  let activeId = reportSections[0]?.id;
  reportSections.forEach((section) => {
    if (section.offsetTop <= marker) activeId = section.id;
  });
  topbarLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const presentationButton = document.getElementById("presentationButton");
const liveRegion = document.getElementById("liveRegion");
const nextButton = document.getElementById("sectionNext");

function setPresentationMode(enabled) {
  document.body.classList.toggle("presentation-mode", enabled);
  presentationButton.textContent = enabled ? "Sair da apresentação" : "Modo apresentação";
  presentationButton.setAttribute("aria-pressed", String(enabled));
  liveRegion.textContent = enabled
    ? "Modo apresentação ativado. Use as setas para navegar."
    : "Modo apresentação desativado.";
}

presentationButton.addEventListener("click", async () => {
  const enabled = !document.body.classList.contains("presentation-mode");
  setPresentationMode(enabled);
  if (enabled && document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // A página mantém o modo de apresentação mesmo quando fullscreen é bloqueado.
    }
  } else if (!enabled && document.fullscreenElement) {
    await document.exitFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && document.body.classList.contains("presentation-mode")) {
    setPresentationMode(false);
  }
});

function nearestSectionIndex() {
  const marker = window.scrollY + window.innerHeight * 0.42;
  let index = 0;
  reportSections.forEach((section, sectionIndex) => {
    if (section.offsetTop <= marker) index = sectionIndex;
  });
  return index;
}

function goToSection(direction) {
  const current = nearestSectionIndex();
  const next = Math.min(reportSections.length - 1, Math.max(0, current + direction));
  reportSections[next]?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}

nextButton.addEventListener("click", () => goToSection(1));

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("presentation-mode")) return;
  if (["INPUT", "TEXTAREA", "SELECT", "SUMMARY", "BUTTON"].includes(document.activeElement?.tagName)) return;
  if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goToSection(1);
  }
  if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goToSection(-1);
  }
  if (event.key === "Escape") {
    setPresentationMode(false);
  }
});
