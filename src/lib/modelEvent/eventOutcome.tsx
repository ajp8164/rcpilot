import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { EventOutcome } from 'types/event';

const icon: EnumPickerIconProps = {
  name: '',
};

export const eventOutcomeIcons: { [key in EventOutcome]: EnumPickerIconProps } =
  {
    [EventOutcome.Unspecified]: null,
    [EventOutcome.Star1]: { ...icon, hideTitle: true, name: ['star'] },
    [EventOutcome.Star2]: { ...icon, hideTitle: true, name: ['star', 'star'] },
    [EventOutcome.Star3]: {
      ...icon,
      hideTitle: true,
      name: ['star', 'star', 'star'],
    },
    [EventOutcome.Star4]: {
      ...icon,
      hideTitle: true,
      name: ['star', 'star', 'star', 'star'],
    },
    [EventOutcome.Crashed]: null,
  };
