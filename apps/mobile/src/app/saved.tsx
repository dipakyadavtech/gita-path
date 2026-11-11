import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Icon, Screen, TopBar } from '@/components/ui';
import { verseById } from '@/lib/content';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// E7 · Saved verses and notes (X2 empty state when there is nothing saved)
export default function Saved() {
  const bookmarks = useApp((s) => s.bookmarks);
  const setNote = useApp((s) => s.setNote);
  const items = Object.entries(bookmarks).sort((a, b) => b[1].savedAt.localeCompare(a[1].savedAt));

  if (!items.length) {
    return (
      <Screen scroll={false}>
        <TopBar title="Saved and notes" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 20 }}>
          <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bookmark-outline" size={48} color={colors.saffron} />
          </View>
          <Text style={type.h2}>No saved verses yet</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>Tap the bookmark on any verse to keep it here, and add a note about why it matters to you.</Text>
          <Button label="Go to today's verse" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <TopBar title="Saved and notes" />
      {items.map(([id, b]) => {
        const v = verseById(id);
        if (!v) return null;
        return (
          <View key={id} style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }}>
            <Pressable onPress={() => router.push({ pathname: '/verse/[id]', params: { id } })} accessibilityRole="link" accessibilityLabel={`Open verse ${id}`} style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.heading, color: colors.white }}>{id}</Text>
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={type.small} numberOfLines={2}>{v.meaning}</Text>
              <TextInput
                value={b.note}
                onChangeText={(t) => setNote(id, t)}
                placeholder="Add a private note…"
                placeholderTextColor="#9A99AD"
                accessibilityLabel={`Note for verse ${id}`}
                style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.line }}
              />
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
