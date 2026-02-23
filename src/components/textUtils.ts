import React from 'react';

/**
 * Wraps text to fit within a max width and renders it on a canvas context.
 * Returns the new Y position after drawing.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  isHeader: boolean,
  moreRoom: boolean = true,
): number {
  const words: string[] = text.split(" ");
  let line: string = "";
  const lines: string[] = [];
  if(isHeader) {
    ctx.font = `bold ${lineHeight / 1.2}px system-ui, Arial`;   
    ctx.textAlign = 'center';
  } else {
    ctx.font = `${lineHeight / 1.6}px system-ui, Arial`;   
    ctx.textAlign = 'left';
    x = (moreRoom ? 0.25 : 0.15) * maxWidth; // left align with some padding
  }

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth * (moreRoom ? 0.5 : 0.7) && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Draw the lines
  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });
  return lines.length * lineHeight + y;
}
