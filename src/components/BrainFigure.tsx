import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type BrainPose = 'awake' | 'asleep' | 'happy' | 'unplugged';

interface Props {
  pose?: BrainPose;
  size?: number;
}

const OUTLINE = 3.5;

// One silhouette for every pose, so the character stays recognisable.
const BODY =
  'M62 142 C40 144 22 128 24 108 C14 96 20 76 38 72 C36 52 56 38 76 46 ' +
  'C86 32 112 32 122 46 C142 38 164 52 162 72 C180 76 186 96 176 108 ' +
  'C178 128 160 144 138 142 C128 154 112 156 100 150 C88 156 72 154 62 142 Z';

function Folds() {
  return (
    <G stroke={colors.pinkDeep} strokeWidth={4} strokeLinecap="round" fill="none">
      <Path d="M100 44 C93 52 107 60 100 70" />
      <Path d="M40 76 C52 80 55 92 46 100" />
      <Path d="M160 76 C148 80 145 92 154 100" />
      <Path d="M66 58 C70 70 82 72 88 64" />
      <Path d="M134 58 C130 70 118 72 112 64" />
      <Path d="M44 124 C56 120 64 128 66 138" />
      <Path d="M156 124 C144 120 136 128 134 138" />
    </G>
  );
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const r = 9 * s;
  const i = 2.6 * s;
  return (
    <Path
      d={`M${x} ${y - r} Q${x + i} ${y - i} ${x + r} ${y} Q${x + i} ${y + i} ${x} ${y + r} Q${x - i} ${y + i} ${x - r} ${y} Q${x - i} ${y - i} ${x} ${y - r} Z`}
      fill={colors.sky}
    />
  );
}

function Cheeks() {
  return (
    <G fill={colors.pinkDeep} opacity={0.55}>
      <Circle cx={63} cy={118} r={7} />
      <Circle cx={137} cy={118} r={7} />
    </G>
  );
}

function Face({ pose }: { pose: BrainPose }) {
  const ink = colors.ink;
  switch (pose) {
    case 'awake':
      return (
        <G>
          <Ellipse cx={78} cy={102} rx={6} ry={8} fill={ink} />
          <Ellipse cx={122} cy={102} rx={6} ry={8} fill={ink} />
          <Circle cx={80} cy={99} r={2.2} fill={colors.white} />
          <Circle cx={124} cy={99} r={2.2} fill={colors.white} />
          <Path d="M90 117 Q100 128 110 117" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Cheeks />
        </G>
      );
    case 'asleep':
      return (
        <G>
          <Path d="M68 104 Q77 113 86 104" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d="M114 104 Q123 113 132 104" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Ellipse cx={100} cy={122} rx={4.5} ry={3.5} fill={ink} />
          <Cheeks />
        </G>
      );
    case 'happy':
      return (
        <G>
          <Path d="M68 106 Q77 94 86 106" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d="M114 106 Q123 94 132 106" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d="M87 114 Q100 136 113 114 Z" fill={ink} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M94 124 Q100 130 106 124 Q100 121 94 124 Z" fill={colors.pink} />
          <Cheeks />
        </G>
      );
    case 'unplugged':
      return (
        <G>
          <Ellipse cx={76} cy={104} rx={6} ry={8} fill={ink} />
          <Ellipse cx={120} cy={104} rx={6} ry={8} fill={ink} />
          <Circle cx={74} cy={107} r={2.2} fill={colors.white} />
          <Circle cx={118} cy={107} r={2.2} fill={colors.white} />
          <Path d="M66 95 L86 88" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M134 95 L114 88" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M88 123 Q94 118 100 123 T112 123" stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </G>
      );
  }
}

function Pillow() {
  return (
    <Path
      d="M34 150 C34 140 60 136 100 136 C140 136 166 140 166 150 C166 164 140 170 100 170 C60 170 34 164 34 150 Z"
      fill={colors.white}
      stroke={colors.ink}
      strokeWidth={OUTLINE}
      strokeLinejoin="round"
    />
  );
}

function Zs() {
  const p = { stroke: colors.sky, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  return (
    <G>
      <Path d="M150 56 H166 L150 74 H166" strokeWidth={4.5} {...p} />
      <Path d="M172 30 H183 L172 43 H183" strokeWidth={3.5} {...p} />
    </G>
  );
}

function Arms() {
  const arm = { stroke: colors.ink, strokeWidth: 4.5, strokeLinecap: 'round' as const, fill: 'none' as const };
  return (
    <G>
      <Path d="M26 104 Q8 92 12 64" {...arm} />
      <Path d="M174 104 Q192 92 188 64" {...arm} />
      <Circle cx={12} cy={60} r={8} fill={colors.pink} stroke={colors.ink} strokeWidth={OUTLINE} />
      <Circle cx={188} cy={60} r={8} fill={colors.pink} stroke={colors.ink} strokeWidth={OUTLINE} />
    </G>
  );
}

function Stem() {
  return (
    <Rect x={91} y={146} width={18} height={20} rx={7} fill={colors.pinkDeep} stroke={colors.ink} strokeWidth={OUTLINE} />
  );
}

function Cord() {
  return (
    <G>
      <Path
        d="M100 160 C100 186 128 190 138 176"
        stroke={colors.ink}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={134} y={164} width={22} height={16} rx={4} transform="rotate(-24 145 172)" fill={colors.blue} stroke={colors.ink} strokeWidth={OUTLINE} />
      <Path d="M156 164 L166 160 M158 172 L168 168" stroke={colors.ink} strokeWidth={3.5} strokeLinecap="round" />
      <Rect x={178} y={150} width={16} height={28} rx={5} fill={colors.white} stroke={colors.ink} strokeWidth={OUTLINE} />
      <Circle cx={186} cy={159} r={2.2} fill={colors.ink} />
      <Circle cx={186} cy={169} r={2.2} fill={colors.ink} />
    </G>
  );
}

function Drop() {
  return (
    <Path
      d="M152 52 C146 62 142 67 142 73 C142 80 147 84 152 84 C157 84 162 80 162 73 C162 67 158 62 152 52 Z"
      fill={colors.sky}
      stroke={colors.ink}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}

export function BrainFigure({ pose = 'awake', size = 200 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityElementsHidden importantForAccessibility="no">
      {pose === 'asleep' && <Pillow />}
      {pose === 'unplugged' && <Cord />}
      <Stem />
      <Path d={BODY} fill={colors.pink} stroke={colors.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <Folds />
      <Face pose={pose} />
      {pose === 'awake' && (
        <G>
          <Sparkle x={166} y={34} />
          <Sparkle x={34} y={40} s={0.6} />
        </G>
      )}
      {pose === 'asleep' && <Zs />}
      {pose === 'happy' && (
        <G>
          <Arms />
          <Sparkle x={52} y={26} s={0.8} />
          <Sparkle x={150} y={22} s={1} />
        </G>
      )}
      {pose === 'unplugged' && <Drop />}
    </Svg>
  );
}
