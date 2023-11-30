import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { FlightOutcome } from 'types/flight';

const icon: EnumPickerIconProps = {
  name: '',
};

export const flightOutcomeIcons: { [key in FlightOutcome]: EnumPickerIconProps } = {
  [FlightOutcome.Unspecified]: null,
  [FlightOutcome.Star1]: {...icon, hideTitle: true, name: ['star']},
  [FlightOutcome.Star2]: {...icon, hideTitle: true, name: ['star', 'star']},
  [FlightOutcome.Star3]: {...icon, hideTitle: true, name: ['star', 'star', 'star']},
  [FlightOutcome.Star4]: {...icon, hideTitle: true, name: ['star', 'star', 'star', 'star']},
  [FlightOutcome.Crashed]: null,
}