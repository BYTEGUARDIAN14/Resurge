import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, GestureResponderEvent, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Line, Circle } from 'react-native-svg';
import { colors, fonts, spacing } from '../theme';

const GRID = 3;
const SIZE = 280;
const PAD = 24;
const HIT_RADIUS = 32;

interface Props {
  onComplete: (pattern: string) => void;
  resetKey?: number;          // bump to clear current pattern
  status?: 'idle' | 'success' | 'error';
  testID?: string;
}

// 3x3 pattern lock with drag-to-connect and live path drawing.
// Pattern is encoded as a hyphen string of indices, e.g. "0-1-2-5-8".
export const PatternLock: React.FC<Props> = ({ onComplete, resetKey = 0, status = 'idle', testID }) => {
  const [path, setPath] = useState<number[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  // grid cell centers
  const points = useMemo(() => {
    const inner = SIZE - PAD * 2;
    const step = inner / (GRID - 1);
    const arr: { x: number; y: number }[] = [];
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        arr.push({ x: PAD + c * step, y: PAD + r * step });
      }
    }
    return arr;
  }, []);

  React.useEffect(() => { setPath([]); setCursor(null); }, [resetKey]);

  const hitDot = (x: number, y: number): number | null => {
    for (let i = 0; i < points.length; i++) {
      const dx = x - points[i].x;
      const dy = y - points[i].y;
      if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) return i;
    }
    return null;
  };

  const onTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setCursor({ x: locationX, y: locationY });
    const idx = hitDot(locationX, locationY);
    if (idx != null && !path.includes(idx)) {
      Haptics.selectionAsync().catch(() => {});
      setPath((p) => [...p, idx]);
    }
  };

  const onEnd = () => {
    setCursor(null);
    if (path.length >= 4) {
      onComplete(path.join('-'));
    } else if (path.length > 0) {
      onComplete('');                 // signals "too short"
      setTimeout(() => setPath([]), 200);
    }
  };

  const lineColor =
    status === 'success' ? colors.success :
    status === 'error' ? colors.emergency :
    colors.primary;

  return (
    <View
      testID={testID ?? 'pattern-lock'}
      style={styles.wrap}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => { setPath([]); onTouch(e); }}
      onResponderMove={onTouch}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
    >
      <Svg width={SIZE} height={SIZE} pointerEvents="none">
        {/* lines connecting selected dots */}
        {path.slice(0, -1).map((idx, i) => {
          const a = points[idx];
          const b = points[path[i + 1]];
          return <Line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={3} strokeLinecap="round" />;
        })}
        {/* line from last selected dot to current cursor */}
        {path.length > 0 && cursor && (() => {
          const a = points[path[path.length - 1]];
          return <Line x1={a.x} y1={a.y} x2={cursor.x} y2={cursor.y} stroke={lineColor} strokeWidth={3} strokeOpacity={0.55} strokeLinecap="round" />;
        })()}
        {/* dots */}
        {points.map((p, i) => {
          const active = path.includes(i);
          return (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y} r={active ? 16 : 14} fill={active ? `${lineColor}33` : colors.surfaceHigh} stroke={active ? lineColor : colors.hairlineStrong} strokeWidth={active ? 1.5 : 1} />
              {active && <Circle cx={p.x} cy={p.y} r={5} fill={lineColor} />}
            </React.Fragment>
          );
        })}
      </Svg>
      {status === 'error' && <Text style={styles.errText}>Pattern doesn&apos;t match. Try again.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: SIZE, height: SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  errText: {
    position: 'absolute', bottom: -28,
    fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.emergency,
  },
});
