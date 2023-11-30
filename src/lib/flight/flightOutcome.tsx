import { FlightOutcome } from 'types/flight';
import { FlightRating } from 'components/molecules/FlightRating';
import { IconProps } from 'types/common';

const icon: IconProps = {
  name: '',
};

export const flightOutcomeIcons: { [key in FlightOutcome]: IconProps } = {
  [FlightOutcome.Unspecified]: null,
  [FlightOutcome.Star1]: {...icon, Component: <FlightRating value={FlightOutcome.Star1} />},
  [FlightOutcome.Star2]: {...icon, Component: <FlightRating value={FlightOutcome.Star2} />},
  [FlightOutcome.Star3]: {...icon, Component: <FlightRating value={FlightOutcome.Star3} />},
  [FlightOutcome.Star4]: {...icon, Component: <FlightRating value={FlightOutcome.Star4} />},
  [FlightOutcome.Crashed]: null,
}