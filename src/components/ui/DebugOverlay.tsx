import React, { useEffect, useState } from 'react';
import { YStack, Text } from 'tamagui';
import { getDebugLogs, shouldShowDebugOverlay } from '../../utils/debugOverlay';

export const DebugOverlay: React.FC = () => {
  const [logs, setLogs] = useState(getDebugLogs());
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const shouldShow = shouldShowDebugOverlay();
    setEnabled(shouldShow);
    if (!shouldShow) return;

    const update = () => setLogs(getDebugLogs());
    update();
    window.addEventListener('debug-log-update', update);
    return () => window.removeEventListener('debug-log-update', update);
  }, []);

  if (!enabled) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      maxHeight="50%"
      zIndex={9999}
      padding="$2"
      backgroundColor="rgba(0, 0, 0, 0.65)"
      style={{ pointerEvents: 'none' }}
    >
      <Text fontSize={12} color="#fff" marginBottom="$1">
        Debug Overlay (debug=1)
      </Text>
      {logs.slice(-20).map((log, i) => (
        <Text key={`${log.ts}-${i}`} fontSize={10} color="#fff">
          {new Date(log.ts).toLocaleTimeString()} {log.message}{' '}
          {log.data ? JSON.stringify(log.data) : ''}
        </Text>
      ))}
    </YStack>
  );
};
