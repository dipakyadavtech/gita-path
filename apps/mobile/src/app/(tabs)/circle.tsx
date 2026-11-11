import { Text } from 'react-native';
import { Card, Screen } from '@/components/ui';
import { type } from '@/theme';

// F1 · Family Circle (built in milestone M4)
export default function Circle() {
  return (
    <Screen>
      <Text style={type.h1}>Family Circle</Text>
      <Card><Text style={type.body}>Create a Circle and learn Chapter 2 together. Coming in the next build.</Text></Card>
    </Screen>
  );
}
