import { Battery } from 'realmdb/Battery';
import { BatteryChemistry } from 'types/battery';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { EnumRelation } from 'components/molecules/filters';
import { EventOutcome } from 'types/event';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { Model } from 'realmdb/Model';
import { ModelCategory } from 'realmdb/ModelCategory';
import { ModelType } from 'types/model';
import { Pilot } from 'realmdb/Pilot';
import { eventOutcomeIcons } from 'lib/modelEvent';
import { useRealm } from '@realm/react';

export type EnumName = keyof typeof enumFilterConfigs;
type EnumPickerProps = Omit<EnumPickerInterface, 'selected' | 'eventName'>;

// See https://stackoverflow.com/a/70994696
const satisfiesRecord =
  <T>() =>
  <K extends PropertyKey>(rec: Record<K, T>) =>
    rec;

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
    mode: 'many-with-actions',
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
  EventStyles: {
    mode: 'many-or-none',
    title: 'Styles',
    sectionName: 'STYLES TO {0} RESULTS',
    values: [],
  },
  ModelTypes: {
    mode: 'many-with-actions',
    title: 'Model Types',
    sectionName: 'MODEL TYPES TO {0} RESULTS',
    values: Object.values(ModelType),
  },
  Outcomes: {
    mode: 'many-with-actions',
    title: 'Outcomes',
    sectionName: 'OUTCOMES TO {0} RESULTS',
    icons: eventOutcomeIcons,
    values: Object.values(EventOutcome),
  },
  Pilots: {
    mode: 'many-or-none',
    title: 'Pilots',
    sectionName: 'PILOTS TO {0} RESULTS',
    values: [],
  },
});

export const useEnumFilterConfig = (enumName: EnumName, relation: EnumRelation) => {
  const realm = useRealm();

  const config = Object.assign({}, enumFilterConfigs[enumName]);
  config.sectionName = config.sectionName?.replace(
    '{0}',
    relation === EnumRelation.Is ? 'INCLUDE IN' : 'EXCLUDE FROM',
  );

  // Dynamic list of values. These enum names capture a user entered list of values.
  // Use a database selector to fill values dynamically; use enumName
  let batteries;
  let categories;
  let locations;
  let models;
  let pilots;
  let styles;

  switch (enumName) {
    case 'Batteries':
      batteries = realm.objects(Battery);
      config.values = batteries.map(b => b.name).sort();
      break;
    case 'Categories':
      categories = realm.objects(ModelCategory);
      config.values = categories.map(c => c.name).sort();
      break;
    case 'EventStyles':
      styles = realm.objects(EventStyle);
      config.values = styles.map(s => s.name).sort();
      break;
    case 'Locations':
      locations = realm.objects(Location);
      config.values = locations.map(l => l.name).sort();
      break;
    case 'Models':
      models = realm.objects(Model);
      config.values = models.map(m => m.name).sort();
      break;
    case 'Pilots':
      pilots = realm.objects(Pilot);
      config.values = pilots.map(p => p.name).sort();
      break;
  }

  return config;
};
