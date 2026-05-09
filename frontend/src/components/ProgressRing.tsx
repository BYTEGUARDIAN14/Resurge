import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size: number;
  strokeWidth?: number;
  progress: number; // 0..1
  trackColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const ProgressRing: React.FC<Props> = ({
  size,
  strokeWidth = 10,
  progress,
  trackColor = colors.hairlineStrong,
  gradientFrom = colors.primary,
  gradientTo = colors.sage,
}) => {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = c * (1 - clamped);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={gradientFrom} />
          <Stop offset="1" stopColor={gradientTo} />
        </LinearGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="url(#ring)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        fill="none"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
};
