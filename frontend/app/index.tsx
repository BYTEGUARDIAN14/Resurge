import { Redirect } from 'expo-router';
import { useResurge } from '../src/state';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme';

export default function Index() {
  const { ready, onboarded } = useResurge();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={onboarded ? '/(tabs)/home' : '/onboarding'} />;
}
