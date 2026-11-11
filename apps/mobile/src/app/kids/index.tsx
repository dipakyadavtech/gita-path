import { Text } from 'react-native';
import { Card, Screen, TopBar } from '@/components/ui';
import { type } from '@/theme';

// Kids mode entry (built in milestone M7, issue #7)
export default function KidsEntry() {
  return (
    <Screen>
      <TopBar title="Kids mode" />
      <Card><Text style={type.body}>Kids mode arrives in milestone M7.</Text></Card>
    </Screen>
  );
}
