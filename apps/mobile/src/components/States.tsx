import { useNetworkState } from 'expo-network';
import { Text, View } from 'react-native';
import { Button, Icon, TextLink } from './ui';
import { colors, radius, type } from '@/theme';

/** X1 · Offline banner shown at the top of screens when there is no connection. */
export function OfflineBanner() {
  const net = useNetworkState();
  if (net.isConnected !== false) return null;
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: radius.lg, backgroundColor: '#ECECF2' }}>
      <Icon name="cloud-offline-outline" />
      <Text style={[type.small, { flex: 1, color: colors.ink }]}>
        <Text style={{ fontWeight: '700' }}>You&apos;re offline. </Text>Today&apos;s verse and your saved steps still work. Progress syncs when you reconnect.
      </Text>
    </View>
  );
}

export function useOnline() {
  return useNetworkState().isConnected !== false;
}

/** X3 · Error state with retry and an error code (FR-ER-02). */
export function ErrorState({ title, code, onRetry }: { title: string; code: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
      <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: colors.dangerTint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="warning-outline" size={48} color={colors.danger} />
      </View>
      <Text style={[type.h2, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.bodyMuted, { textAlign: 'center' }]}>Your progress is safe. Please try again in a moment.</Text>
      <Button label="Try again" onPress={onRetry} style={{ paddingHorizontal: 28 }} />
      <TextLink label={`Report a problem · code ${code}`} color={colors.muted} />
    </View>
  );
}
