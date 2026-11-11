import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Icon, Screen, TopBar } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// A3 · Subscription. Purchases are simulated until RevenueCat keys are added (FR-PY-01..03).
const PLANS = [
  { id: 'yearly', name: 'Yearly', price: '₹799', sub: '₹67 a month · 7-day free trial', tag: 'Save 33%' },
  { id: 'monthly', name: 'Monthly', price: '₹99', sub: 'Cancel any time' },
];

export default function Subscription() {
  const plan = useApp((s) => s.plan);
  const setPlan = useApp((s) => s.setPlan);
  const [picked, setPicked] = useState('yearly');
  if (plan === 'plus') {
    return (
      <Screen>
        <TopBar title="Gita Path Plus" />
        <Card tone="teal"><Text style={type.body}>You have Gita Path Plus. Thank you for supporting the project.</Text></Card>
        <Button label="Manage subscription" kind="ghost" onPress={() => setPlan('free')} />
      </Screen>
    );
  }
  return (
    <Screen
      footer={
        <>
          <Button label="Start 7-day free trial" onPress={() => { setPlan('plus'); router.back(); }} />
          <Text style={[type.small, { textAlign: 'center' }]}>Free forever: daily verse, learning path, audio and Family Circle. Billed through Google Play or the App Store; cancel any time.</Text>
        </>
      }
    >
      <TopBar />
      <View>
        <Text style={type.display}>Gita Path Plus</Text>
        <Text style={type.bodyMuted}>Go deeper, every day.</Text>
      </View>
      <Card>
        {['Unlimited Ask the Gita in your language', 'All animated stories, for you and your kids', 'Offline downloads of every chapter', 'Detailed chanting feedback'].map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6 }}>
            <Icon name="checkmark" color={colors.teal} />
            <Text style={type.body}>{t}</Text>
          </View>
        ))}
      </Card>
      {PLANS.map((p) => {
        const on = picked === p.id;
        return (
          <Pressable key={p.id} onPress={() => setPicked(p.id)} accessibilityRole="radio" accessibilityState={{ checked: on }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.xl, borderWidth: on ? 2 : 1, borderColor: on ? colors.saffron : colors.line, backgroundColor: on ? colors.saffronTint : colors.white }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? colors.saffron : '#B9B8C8', alignItems: 'center', justifyContent: 'center' }}>
              {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.saffron }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.h3}>{p.name}</Text>
              <Text style={type.small}>{p.sub}</Text>
            </View>
            <Text style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.ink }}>{p.price}</Text>
            {p.tag ? <Text style={{ position: 'absolute', top: -10, right: 14, backgroundColor: colors.teal, color: colors.white, fontFamily: fonts.bodyBold, fontSize: 11, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' }}>{p.tag}</Text> : null}
          </Pressable>
        );
      })}
    </Screen>
  );
}
