import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { Star as LRNStar } from 'lucide-react-native';
import { View } from 'react-native';
import { useTheme } from 'theme';
import { EventOutcome } from 'types/event';

const Star = () => {
  const theme = useTheme();
  return <LRNStar color={theme.colors.text} />;
};

export const eventOutcomeIcons: { [key in EventOutcome]: EnumPickerIconProps } =
  {
    [EventOutcome.Unspecified]: null,
    [EventOutcome.Star1]: {
      hideTitle: true,
      leftContent: (
        <View style={{ flexDirection: 'row' }}>
          <Star />
        </View>
      ),
    },
    [EventOutcome.Star2]: {
      hideTitle: true,
      leftContent: (
        <View style={{ flexDirection: 'row' }}>
          <Star />
          <Star />
        </View>
      ),
    },
    [EventOutcome.Star3]: {
      hideTitle: true,
      leftContent: (
        <View style={{ flexDirection: 'row' }}>
          <Star />
          <Star />
          <Star />
        </View>
      ),
    },
    [EventOutcome.Star4]: {
      hideTitle: true,
      leftContent: (
        <View style={{ flexDirection: 'row' }}>
          <Star />
          <Star />
          <Star />
          <Star />
        </View>
      ),
    },
    [EventOutcome.Crashed]: null,
  };
