import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'check'
  | 'lock'
  | 'clock'
  | 'plug'
  | 'arrowRight'
  | 'shield'
  | 'battery'
  | 'apps'
  | 'moon'
  | 'plus'
  | 'minus';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Small custom stroke icon set on a 24px grid. */
export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 2.2 }: Props) {
  const p = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'check' && <Path d="M5 12.5 L10 17.5 L19 7" {...p} />}
      {name === 'arrowRight' && <Path d="M5 12 H19 M13 6 L19 12 L13 18" {...p} />}
      {name === 'lock' && (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={3} {...p} />
          <Path d="M8 11 V8 a4 4 0 0 1 8 0 V11" {...p} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M12 7 V12 L15.5 14" {...p} />
        </>
      )}
      {name === 'plug' && (
        <>
          <Path d="M9 3 V8 M15 3 V8" {...p} />
          <Path d="M6 8 H18 V12 a6 6 0 0 1 -12 0 Z" {...p} />
          <Path d="M12 18 V21" {...p} />
        </>
      )}
      {name === 'shield' && (
        <>
          <Path d="M12 3 L19 6 V12 C19 16.5 16 19.5 12 21 C8 19.5 5 16.5 5 12 V6 Z" {...p} />
          <Path d="M9 12 L11.2 14.2 L15 10" {...p} />
        </>
      )}
      {name === 'battery' && (
        <>
          <Rect x={3} y={8} width={16} height={9} rx={2.5} {...p} />
          <Path d="M21.5 11 V14" {...p} />
          <Path d="M7 12.5 H11" {...p} />
        </>
      )}
      {name === 'apps' && (
        <>
          <Rect x={4} y={4} width={6.5} height={6.5} rx={2} {...p} />
          <Rect x={13.5} y={4} width={6.5} height={6.5} rx={2} {...p} />
          <Rect x={4} y={13.5} width={6.5} height={6.5} rx={2} {...p} />
          <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={2} {...p} />
        </>
      )}
      {name === 'moon' && <Path d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A7 7 0 0 0 20 14.5 Z" {...p} />}
      {name === 'plus' && <Path d="M12 5 V19 M5 12 H19" {...p} />}
      {name === 'minus' && <Path d="M5 12 H19" {...p} />}
    </Svg>
  );
}
