import { PositionPreset } from '../../types/templates';

export function positionPresetToStyle(preset: PositionPreset): React.CSSProperties {
  switch (preset) {
    case 'top-left':
      return { top: '8px', left: '8px' };
    case 'top-right':
      return { top: '8px', right: '8px' };
    case 'bottom-left':
      return { bottom: '8px', left: '8px' };
    case 'bottom-right':
      return { bottom: '8px', right: '8px' };
    case 'center':
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    default:
      return { bottom: '8px', right: '8px' };
  }
}
