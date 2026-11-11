import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/ui';
import { colors, fonts } from '@/theme';

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Today', icon: 'home-outline', iconActive: 'home' },
  { name: 'path', title: 'Path', icon: 'git-network-outline', iconActive: 'git-network' },
  { name: 'ask', title: 'Ask', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  { name: 'stories', title: 'Stories', icon: 'play-circle-outline', iconActive: 'play-circle' },
  { name: 'circle', title: 'Circle', icon: 'people-outline', iconActive: 'people' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: 'rgba(255,255,255,0.96)', borderTopColor: colors.line, height: 72, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 11 },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center' }}>
                <Icon name={focused ? t.iconActive : t.icon} size={22} color={color} />
              </View>
            ),
            tabBarLabel: ({ focused, color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: focused ? fonts.bodyBold : fonts.bodyMedium, fontSize: 11, color }}>{t.title}</Text>
                <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: focused ? colors.saffron : 'transparent' }} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
