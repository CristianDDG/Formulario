export interface GaugePoint {
  x: number;
  y: number;
}

function roundNumber(value: number, decimals = 4) {
  return Number(value.toFixed(decimals));
}

export function polarPoint(cx: number, cy: number, r: number, angle: number): GaugePoint {
  const radians = ((angle - 180) * Math.PI) / 180;
  return {
    x: roundNumber(cx + r * Math.cos(radians)),
    y: roundNumber(cy + r * Math.sin(radians)),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarPoint(cx, cy, r, endAngle);
  const end = polarPoint(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
