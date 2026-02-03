const canvas = document.getElementById("experiment");
const context = canvas.getContext("2d");

const incidentInput = document.getElementById("incidentAngle");
const mirrorInput = document.getElementById("mirrorAngle");
const rayInput = document.getElementById("rayCount");
const showNormal = document.getElementById("showNormal");
const showGrid = document.getElementById("showGrid");

const incidentValue = document.getElementById("incidentValue");
const mirrorValue = document.getElementById("mirrorValue");
const rayValue = document.getElementById("rayValue");

const incidentReadout = document.getElementById("incidentReadout");
const reflectionReadout = document.getElementById("reflectionReadout");
const mirrorReadout = document.getElementById("mirrorReadout");

const origin = { x: canvas.width * 0.25, y: canvas.height * 0.65 };
const mirrorCenter = { x: canvas.width * 0.65, y: canvas.height * 0.45 };
const mirrorLength = canvas.width * 0.5;

const toRadians = (deg) => (deg * Math.PI) / 180;

const update = () => {
  const incidentAngle = Number(incidentInput.value);
  const mirrorAngle = Number(mirrorInput.value);
  const rays = Number(rayInput.value);

  incidentValue.textContent = `${incidentAngle}°`;
  mirrorValue.textContent = `${mirrorAngle}°`;
  rayValue.textContent = `${rays}`;

  incidentReadout.textContent = `${incidentAngle}°`;
  reflectionReadout.textContent = `${incidentAngle}°`;
  mirrorReadout.textContent = `${mirrorAngle}°`;

  renderScene(incidentAngle, mirrorAngle, rays, showNormal.checked, showGrid.checked);
};

const drawGrid = () => {
  context.save();
  context.strokeStyle = "rgba(255,255,255,0.04)";
  context.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  context.restore();
};

const renderScene = (incidentAngle, mirrorAngle, rays, includeNormal, includeGrid) => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (includeGrid) {
    drawGrid();
  }

  const mirrorRad = toRadians(mirrorAngle);
  const mirrorDirection = { x: Math.cos(mirrorRad), y: Math.sin(mirrorRad) };
  const mirrorNormal = { x: -mirrorDirection.y, y: mirrorDirection.x };

  const halfLength = mirrorLength / 2;
  const mirrorStart = {
    x: mirrorCenter.x - mirrorDirection.x * halfLength,
    y: mirrorCenter.y - mirrorDirection.y * halfLength,
  };
  const mirrorEnd = {
    x: mirrorCenter.x + mirrorDirection.x * halfLength,
    y: mirrorCenter.y + mirrorDirection.y * halfLength,
  };

  context.save();
  context.strokeStyle = "#7bd8ff";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(mirrorStart.x, mirrorStart.y);
  context.lineTo(mirrorEnd.x, mirrorEnd.y);
  context.stroke();
  context.restore();

  if (includeNormal) {
    context.save();
    context.strokeStyle = "rgba(158, 244, 209, 0.8)";
    context.setLineDash([6, 8]);
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(
      mirrorCenter.x - mirrorNormal.x * 160,
      mirrorCenter.y - mirrorNormal.y * 160
    );
    context.lineTo(
      mirrorCenter.x + mirrorNormal.x * 160,
      mirrorCenter.y + mirrorNormal.y * 160
    );
    context.stroke();
    context.restore();
  }

  const baseAngle = toRadians(incidentAngle);
  const raySpacing = 18;
  for (let i = 0; i < rays; i += 1) {
    const offset = (i - (rays - 1) / 2) * raySpacing;
    const start = { x: origin.x, y: origin.y + offset };

    const incomingDir = {
      x: Math.cos(-baseAngle),
      y: Math.sin(-baseAngle),
    };

    const intersect = intersectRayWithLine(start, incomingDir, mirrorStart, mirrorEnd);

    if (!intersect) {
      continue;
    }

    drawRay(start, intersect, "#f1b74a", 4);

    const reflectedDir = reflectVector(incomingDir, mirrorNormal);
    const reflectionEnd = {
      x: intersect.x + reflectedDir.x * 420,
      y: intersect.y + reflectedDir.y * 420,
    };

    drawRay(intersect, reflectionEnd, "#ff5f6d", 4);

    drawGlow(intersect.x, intersect.y);
  }

  drawSource();
};

const drawSource = () => {
  context.save();
  context.fillStyle = "#f1b74a";
  context.beginPath();
  context.arc(origin.x, origin.y, 10, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

const drawRay = (start, end, color, width) => {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.restore();
};

const drawGlow = (x, y) => {
  const gradient = context.createRadialGradient(x, y, 0, x, y, 22);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.save();
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, 22, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

const reflectVector = (vector, normal) => {
  const dot = vector.x * normal.x + vector.y * normal.y;
  return {
    x: vector.x - 2 * dot * normal.x,
    y: vector.y - 2 * dot * normal.y,
  };
};

const intersectRayWithLine = (rayStart, rayDir, lineStart, lineEnd) => {
  const r = rayDir;
  const s = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };
  const rxs = r.x * s.y - r.y * s.x;
  if (Math.abs(rxs) < 0.0001) {
    return null;
  }

  const qp = { x: lineStart.x - rayStart.x, y: lineStart.y - rayStart.y };
  const t = (qp.x * s.y - qp.y * s.x) / rxs;
  const u = (qp.x * r.y - qp.y * r.x) / rxs;

  if (t >= 0 && u >= 0 && u <= 1) {
    return { x: rayStart.x + t * r.x, y: rayStart.y + t * r.y };
  }
  return null;
};

[incidentInput, mirrorInput, rayInput, showNormal, showGrid].forEach((input) => {
  input.addEventListener("input", update);
});

update();
