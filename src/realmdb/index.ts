/* eslint-disable @typescript-eslint/no-explicit-any */
import { Realm } from '@realm/react';

export * from './Battery';
export * from './BatteryCycle';
export * from './Checklist';
export * from './ChecklistTemplate';
export * from './Event';
export * from './EventsMaintenanceReport';
export * from './EventStyle';
export * from './Filter';
export * from './Location';
export * from './ModelCategory';
export * from './ModelFuel';
export * from './ModelPropeller';
export * from './Model';
export * from './Pilot';
export * from './ScanCodesReport';
export * from './Schema';
/**
 * Converts a Realm object to a plain javascript object. Can be used to include Realm
 * objects (as plain objects) in formik forms.
 */
export const toPlainObject = <T = any>(realmObject: any): T | null => {
  if (!realmObject || typeof realmObject !== 'object') {
    return null;
  }
  const plainObject: { [key: string]: any } = {};
  for (const key in realmObject) {
    // Skip internal Realm properties and methods
    if (
      key.startsWith('__') ||
      key === 'isValid' ||
      key === 'linkingObjects' ||
      typeof realmObject[key] === 'function'
    ) {
      continue;
    }
    const value = realmObject[key];
    if (value instanceof Realm.Object) {
      // Nested Realm object
      plainObject[key] = toPlainObject(value);
    } else if (value instanceof Realm.List) {
      // Realm List of objects or primitives
      // TODO - avoid circular dependencies
      // plainObject[key] = value.map((item: any) => toPlainObject(item));
    } else {
      // Primitive value (string, number, boolean, date, etc.)
      plainObject[key] = value;
    }
  }
  return plainObject as T;
};
/**
 * Converts a Realm list to a plain javascript array. Can be used to include Realm
 * lists (as plain arrays) in formik forms.
 */
export const toPlainArray = <T = any>(realmList: any) => {
  return Array.from(realmList || []).map(obj => toPlainObject<T>(obj));
};
