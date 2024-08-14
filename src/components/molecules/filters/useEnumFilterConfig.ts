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

// Config values include the name and id of the enum in a single string separted by a ':'.
// The name comes first for easy sorting.
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
    values: Object.values(BatteryChemistry).map(k => {
      return `${k}:${BatteryChemistry[k as keyof typeof BatteryChemistry]}`;
    }),
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
    title: 'Event Styles',
    sectionName: 'STYLES TO {0} RESULTS',
    values: [],
  },
  ModelTypes: {
    mode: 'many-with-actions',
    title: 'Model Types',
    sectionName: 'MODEL TYPES TO {0} RESULTS',
    values: Object.values(ModelType).map(k => {
      return `${k}:${ModelType[k as keyof typeof ModelType]}`;
    }),
  },
  Outcomes: {
    mode: 'many-with-actions',
    title: 'Outcomes',
    sectionName: 'OUTCOMES TO {0} RESULTS',
    icons: eventOutcomeIcons,
    values: Object.keys(EventOutcome).map(k => {
      return `${k}:${EventOutcome[k as keyof typeof EventOutcome]}`;
    }),
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
  let eventStyles;
  let locations;
  let models;
  let pilots;

  switch (enumName) {
    case 'Batteries':
      batteries = realm.objects(Battery);
      config.values = batteries.map(b => `${b.name}:${b._id.toString()}`).sort();
      break;
    case 'Categories':
      categories = realm.objects(ModelCategory);
      config.values = categories.map(c => `${c.name}:${c._id.toString()}`).sort();
      break;
    case 'EventStyles':
      eventStyles = realm.objects(EventStyle);
      config.values = eventStyles.map(s => `${s.name}:${s._id.toString()}`).sort();
      break;
    case 'Locations':
      locations = realm.objects(Location);
      config.values = locations.map(l => `${l.name}:${l._id.toString()}`).sort();
      break;
    case 'Models':
      models = realm.objects(Model);
      config.values = models.map(m => `${m.name}:${m._id.toString()}`).sort();
      break;
    case 'Pilots':
      pilots = realm.objects(Pilot);
      config.values = pilots.map(p => `${p.name}:${p._id.toString()}`).sort();
      break;
  }
  console.log('***', JSON.stringify(config));
  return config;
};
