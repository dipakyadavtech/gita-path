import { Pressable, Switch, Text, View } from 'react-native';
import { Button, Caps, Card, Icon, ProgressBar, Row, Screen, TopBar } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, type } from '@/theme';

// E8 · Downloads (FR-PR-04). In demo mode items are tracked but no media is stored yet.
const LIMIT_MB = 2048;

export default function Downloads() {
  const downloads = useApp((s) => s.downloads);
  const wifiOnly = useApp((s) => s.wifiOnly);
  const autoNext = useApp((s) => s.autoNextChapter);
  const setDownload = useApp((s) => s.setDownload);
  const setPrefs = useApp((s) => s.setDownloadPrefs);
  const plan = useApp((s) => s.plan);
  const items = Object.entries(downloads);
  const used = items.reduce((a, [, d]) => a + d.mb, 0);

  return (
    <Screen>
      <TopBar title="Downloads" />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={type.label}>Storage used</Text>
          <Text style={type.label}>{used} MB of 2 GB</Text>
        </Row>
        <View style={{ marginTop: 10 }}>
          <ProgressBar value={used / LIMIT_MB} color={colors.teal} />
        </View>
      </Card>
      <Card>
        <Caps>On this phone</Caps>
        {items.length === 0 ? <Text style={[type.bodyMuted, { marginTop: 8 }]}>Nothing downloaded yet.</Text> : null}
        {items.map(([id, d]) => (
          <Row key={id} gap={12} style={{ paddingVertical: 10, borderTopWidth: 1, borderColor: colors.line, marginTop: 8 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.tealTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="checkmark" color={colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.label}>{d.title}</Text>
              <Text style={type.small}>{d.mb} MB</Text>
            </View>
            {id !== 'today' ? (
              <Pressable onPress={() => setDownload(id, null)} accessibilityRole="button" accessibilityLabel={`Remove ${d.title}`} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash-outline" color={colors.muted} />
              </Pressable>
            ) : (
              <Text style={type.small}>Automatic</Text>
            )}
          </Row>
        ))}
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={type.label}>Download on Wi-Fi only</Text>
            <Text style={type.small}>Saves mobile data</Text>
          </View>
          <Switch value={wifiOnly} onValueChange={(v) => setPrefs({ wifiOnly: v })} trackColor={{ true: colors.teal, false: '#CFCFDA' }} accessibilityLabel="Download on Wi-Fi only" />
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={type.label}>Auto-download next chapter</Text>
            <Text style={type.small}>When you reach 80% of a chapter</Text>
          </View>
          <Switch value={autoNext} onValueChange={(v) => setPrefs({ autoNextChapter: v })} trackColor={{ true: colors.teal, false: '#CFCFDA' }} accessibilityLabel="Auto-download next chapter" />
        </Row>
      </Card>
      {downloads.ch2 ? null : (
        <Button label="Download Chapter 2 audio" icon="download-outline" kind="ghost" onPress={() => setDownload('ch2', { title: 'Chapter 2 · audio', mb: 86 })} />
      )}
      {plan === 'free' ? <Text style={type.small}>Free accounts can download audio. Story downloads need Gita Path Plus.</Text> : null}
    </Screen>
  );
}
