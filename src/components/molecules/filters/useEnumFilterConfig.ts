import { useRealm } from '@realm/react';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { EnumRelation } from 'components/molecules/filters';
import { eventOutcomeIcons } from 'lib/modelEvent';
import { Battery } from 'realmdb/Battery';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { Model } from 'realmdb/Model';
import { ModelCategory } from 'realmdb/ModelCategory';
import { Pilot } from 'realmdb/Pilot';
import { BatteryChemistry } from 'types/battery';
import { EventOutcome } from 'types/event';
import { ModelType } from 'types/model';

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
  Battery: {
    enumName: 'Battery',
    mode: 'many-or-none',
    title: 'Batteries',
    sectionName: '{0} the selected Batteries {1} the results.',
    values: [],
  },
  ModelCategory: {
    enumName: 'ModelCategory',
    mode: 'many-or-none',
    title: 'Categories',
    sectionName: '{0} the selected Model Categories {1} the results.',
    values: [],
  },
  BatteryChemistry: {
    enumName: 'BatteryChemistry',
    mode: 'many-with-actions',
    title: 'Chemistries',
    sectionName: '{0} the selected Chemistries {1} the results.',
    values: Object.values(BatteryChemistry),
  },
  Location: {
    enumName: 'Location',
    mode: 'many-or-none',
    title: 'Locations',
    sectionName: '{0} the selected Locations {1} the results.',
    values: [],
  },
  Model: {
    enumName: 'Model',
    mode: 'many-or-none',
    title: 'Models',
    sectionName: '{0} the selected Models {1} the results.',
    values: [],
  },
  EventStyle: {
    enumName: 'EventStyle',
    mode: 'many-or-none',
    title: 'Event Styles',
    sectionName: '{0} the selected Event Styles {1} the results.',
    values: [],
  },
  ModelType: {
    enumName: 'ModelType',
    mode: 'many-with-actions',
    title: 'Model Types',
    sectionName: '{0} the selected Model Types {1} the results.',
    values: Object.values(ModelType),
  },
  EventOutcome: {
    enumName: 'EventOutcome',
    mode: 'one-or-none',
    title: 'Outcomes',
    sectionName: '{0} the selected Outcomes {1} the results.',
    icons: eventOutcomeIcons,
    values: Object.values(EventOutcome),
  },
  Pilot: {
    enumName: 'Pilot',
    mode: 'many-or-none',
    title: 'Pilots',
    sectionName: '{0} the selected Pilots {1} the results.',
    values: [],
  },
});

export const useEnumFilterConfig = (
  enumName: EnumName,
  relation: EnumRelation,
) => {
  const realm = useRealm();

  // Include the enum name itself in the configuration.
  const config = Object.assign({}, enumFilterConfigs[enumName]);
  config.sectionName = config.sectionName?.replace(
    '{0}',
    relation === EnumRelation.Is ? 'Include' : 'Exclude',
  );
  config.sectionName = config.sectionName?.replace(
    '{1}',
    relation === EnumRelation.Is ? 'in' : 'from',
  );

  // Dynamic list of values. These enum names capture a user entered list of values.
  // Use a database selector to fill values dynamically; use enumName
  let batteries;
  let modelCategories;
  let eventStyles;
  let locations;
  let models;
  let pilots;

  switch (enumName) {
    case 'Battery':
      batteries = realm.objects(Battery);
      config.values = batteries.sorted('name').map(b => b._id.toString());
      break;
    case 'ModelCategory':
      modelCategories = realm.objects(ModelCategory);
      config.values = modelCategories.sorted('name').map(c => c._id.toString());
      break;
    case 'EventStyle':
      eventStyles = realm.objects(EventStyle);
      config.values = eventStyles.sorted('name').map(s => s._id.toString());
      break;
    case 'Location':
      locations = realm.objects(Location);
      config.values = locations.sorted('name').map(l => l._id.toString());
      break;
    case 'Model':
      models = realm.objects(Model);
      config.values = models.sorted('name').map(m => m._id.toString());
      break;
    case 'Pilot':
      pilots = realm.objects(Pilot);
      config.values = pilots.sorted('name').map(p => p._id.toString());
      break;
  }
  return config;
};
