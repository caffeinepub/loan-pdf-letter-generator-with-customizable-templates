import { PositionPreset } from '../../types/templates';

export interface PositionStyle {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

export function getPositionStyle(position: PositionPreset): PositionStyle {
  switch (position) {
    case 'top-left':
      return { top: '20px', left: '20px' };
    case 'top-right':
      return { top: '20px', right: '20px' };
    case 'bottom-left':
      return { bottom: '20px', left: '20px' };
    case 'bottom-right':
      return { bottom: '20px', right: '20px' };
    case 'center':
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    default:
      return { bottom: '20px', right: '20px' };
  }
}

export function getCanvasPosition(
  position: PositionPreset,
  canvasWidth: number,
  canvasHeight: number,
  elementSize: number
): { x: number; y: number } {
  const margin = 20;

  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: canvasWidth - elementSize - margin, y: margin };
    case 'bottom-left':
      return { x: margin, y: canvasHeight - elementSize - margin };
    case 'bottom-right':
      return { x: canvasWidth - elementSize - margin, y: canvasHeight - elementSize - margin };
    case 'center':
      return { x: (canvasWidth - elementSize) / 2, y: (canvasHeight - elementSize) / 2 };
    default:
      return { x: canvasWidth - elementSize - margin, y: canvasHeight - elementSize - margin };
  }
}
