import { modelCategories, modelStyles } from '../../../mocks/enums';

import { BatteryChemistry } from 'types/battery';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { EnumRelation } from './ListItemFilterEnum';
import { FlightOutcome } from 'types/flight';
import { ModelType } from 'types/model';
import { enumIdsToValues } from 'lib/utils';
import { flightOutcomeIcons } from 'lib/flight';

export type EnumName = keyof typeof enumFilterConfigs;
type EnumPickerProps = Omit<EnumPickerInterface, 'selected' | 'eventName'>;

// See https://stackoverflow.com/a/70994696
const satisfiesRecord = <T,>() => <K extends PropertyKey>(rec: Record<K, T>) => rec;

const enumFilterConfigs = satisfiesRecord<EnumPickerProps>()({
  Batteries: {
    mode: 'many-or-none',
    title: 'Batteries',
    sectionName: 'BATTERIES TO {0} RESULTS',
    values: [],
  },
  Categories: {
    mode: 'many-or-none',
    title: 'Categories',
    sectionName: 'CATEGORIES TO {0} RESULTS',
    values: [],
  },
  Chemistries: {
    mode: 'many',
    title: 'Chemistries',
    sectionName: 'CHEMISTRIES TO {0} RESULTS',
    values: Object.values(BatteryChemistry),
  },
  Locations: {
    mode: 'many-or-none',
    title: 'Locations',
    sectionName: 'LOCATIONS TO {0} RESULTS',
    values: [],
  },
  Models: {
    mode: 'many-or-none',
    title: 'Models',
    sectionName: 'MODELS TO {0} RESULTS',
    values: [],
  },
  ModelStyles: {
    mode: 'many-or-none',
    title: 'Styles',
    sectionName: 'STYLES TO {0} RESULTS',
    values: [],
  },
  ModelTypes: {
    mode: 'many',
    title: 'Model Types',
    sectionName: 'MODEL TYPES TO {0} RESULTS',
    values: Object.values(ModelType),
  },
  Outcomes: {
    mode: 'many',
    title: 'Outcomes',
    sectionName: 'OUTCOMES TO {0} RESULTS',
    icons: flightOutcomeIcons,
    values: Object.values(FlightOutcome),
  },
  Pilots: {
    mode: 'many-or-none',
    title: 'Pilots',
    sectionName: 'PILOTS TO {0} RESULTS',
    values: [],
  },
});

export const useEnumFilterConfig = (enumName: EnumName, relation: EnumRelation) => {
  let config = Object.assign({}, enumFilterConfigs[enumName]);
  config.sectionName = config.sectionName?.replace('{0}', relation === EnumRelation.Is ? 'INCLUDE IN' : 'EXCLUDE FROM');

  // Use a database selector to fill values dynamically; use enumName
  switch (enumName) {
    case 'Batteries':
      // config.values = enumIdsToValues(['id0'], batteries);
      break;
    case 'Categories':
      config.values = enumIdsToValues(['id1'], modelCategories);
      break;
    case 'Locations':
      // config.values = enumIdsToValues(['id0'], locations);
      break;
    case 'ModelStyles':
      config.values = enumIdsToValues(['id0'], modelStyles);
      break;
    case 'Pilots':
      // config.values = enumIdsToValues(['id0'], pilots);
      break;
    }

  return config;
};
