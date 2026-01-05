import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';
import { PreflightCheck } from '../types';

export interface CanvasDimensions {
  widthIn: number;
  heightIn: number;
  bleedIn: number;
  safeZoneIn: number;
}

export function createDefaultCanvas(dimensions: CanvasDimensions) {
  const dpi = 150;
  const { widthIn, heightIn, bleedIn, safeZoneIn } = dimensions;

  const widthPx = (widthIn + bleedIn * 2) * dpi;
  const heightPx = (heightIn + bleedIn * 2) * dpi;

  return {
    version: '5.3.0',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: widthPx,
        height: heightPx,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        name: 'background'
      }
    ],
    background: '#ffffff'
  };
}

export function inchesToPixels(inches: number, dpi: number = 150): number {
  return inches * dpi;
}

export function pixelsToInches(pixels: number, dpi: number = 150): number {
  return pixels / dpi;
}

export async function exportCanvasToImage(
  canvas: fabric.Canvas,
  multiplier: number = 2
): Promise<string> {
  return canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier,
  });
}

export async function exportCanvasToPDF(
  canvas: fabric.Canvas,
  dimensions: CanvasDimensions
): Promise<Blob> {
  const dpi = 300;
  const multiplier = dpi / 150;

  const imageData = await exportCanvasToImage(canvas, multiplier);

  const pdfDoc = await PDFDocument.create();
  const { widthIn, heightIn, bleedIn } = dimensions;

  const pageWidth = (widthIn + bleedIn * 2) * 72;
  const pageHeight = (heightIn + bleedIn * 2) * 72;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
  const image = await pdfDoc.embedPng(imageBytes);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export function runPreflightChecks(
  canvas: fabric.Canvas,
  dimensions: CanvasDimensions
): PreflightCheck {
  const checks: PreflightCheck['checks'] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];

  const dpi = 150;
  const safeZonePx = inchesToPixels(dimensions.safeZoneIn, dpi);
  const bleedPx = inchesToPixels(dimensions.bleedIn, dpi);

  const canvasWidth = inchesToPixels(dimensions.widthIn + dimensions.bleedIn * 2, dpi);
  const canvasHeight = inchesToPixels(dimensions.heightIn + dimensions.bleedIn * 2, dpi);

  const objects = canvas.getObjects();

  objects.forEach((obj: any) => {
    if (obj.name === 'background') return;

    if (obj.type === 'image') {
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const width = (obj.width || 0) * scaleX;
      const height = (obj.height || 0) * scaleY;

      const effectiveDPI = Math.min(
        (obj.width || 1) / (width / dpi),
        (obj.height || 1) / (height / dpi)
      );

      if (effectiveDPI < 100) {
        blockers.push(`Image "${obj.name || 'Untitled'}" has very low resolution (${Math.round(effectiveDPI)} DPI). Minimum 100 DPI required.`);
        checks.push({
          type: 'image_resolution',
          status: 'fail',
          message: `Low resolution: ${Math.round(effectiveDPI)} DPI`,
          details: { objectName: obj.name, dpi: effectiveDPI }
        });
      } else if (effectiveDPI < 150) {
        warnings.push(`Image "${obj.name || 'Untitled'}" has low resolution (${Math.round(effectiveDPI)} DPI). Recommended 150+ DPI.`);
        checks.push({
          type: 'image_resolution',
          status: 'warn',
          message: `Low resolution: ${Math.round(effectiveDPI)} DPI`,
          details: { objectName: obj.name, dpi: effectiveDPI }
        });
      } else {
        checks.push({
          type: 'image_resolution',
          status: 'pass',
          message: `Good resolution: ${Math.round(effectiveDPI)} DPI`,
          details: { objectName: obj.name, dpi: effectiveDPI }
        });
      }
    }

    if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
      const bounds = obj.getBoundingRect();
      const left = bounds.left;
      const top = bounds.top;
      const right = bounds.left + bounds.width;
      const bottom = bounds.top + bounds.height;

      if (
        left < (bleedPx + safeZonePx) ||
        top < (bleedPx + safeZonePx) ||
        right > (canvasWidth - bleedPx - safeZonePx) ||
        bottom > (canvasHeight - bleedPx - safeZonePx)
      ) {
        warnings.push(`Text "${obj.text?.substring(0, 30) || 'Untitled'}..." extends into or beyond safe zone.`);
        checks.push({
          type: 'safe_zone',
          status: 'warn',
          message: 'Text near edge',
          details: { objectName: obj.name, text: obj.text }
        });
      }
    }
  });

  const backgroundObjects = objects.filter((obj: any) =>
    obj.name !== 'background' && (obj.type === 'rect' || obj.type === 'image') &&
    (obj.width || 0) > canvasWidth * 0.8 && (obj.height || 0) > canvasHeight * 0.8
  );

  if (backgroundObjects.length === 0) {
    warnings.push('No full-bleed background detected. Consider adding a background that extends to bleed edges.');
  }

  const passed = blockers.length === 0;

  return {
    checks,
    warnings,
    blockers,
    passed
  };
}

export function generateProofToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
