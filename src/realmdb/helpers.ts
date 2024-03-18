// Used to test a possible previously saved model object attribute value 'schemaAttr'
// with a possibly changed form value 'formAttr' where the value is expected to be a
// specific type. The 'formAttr' is always a string; by convention UI components interact

import Realm from 'realm';
import lodash from 'lodash';

// with strings so we don't require a conversion prior to calling these functions.
export const eqNumber = (schemaAttr?: number, formAttr?: string) => {
  if (lodash.isNumber(schemaAttr) && lodash.isString(formAttr)) {
    return schemaAttr === Number(formAttr);
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

export const eqString = (schemaAttr?: string, formAttr?: string) => {
  if (lodash.isString(schemaAttr) && lodash.isString(formAttr)) {
    return schemaAttr === formAttr;
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eqArray = (schemaArr?: ArrayLike<any>, otherFormArr?: ArrayLike<any>) => {
  return lodash.isEqual(schemaArr, otherFormArr);
};

export const eqObject = (schemaObj?: object, otherFormObj?: object) => {
  // Remove any realm properties from the schema attribute.
  return lodash.isEqual(JSON.parse(JSON.stringify(schemaObj)), otherFormObj);
};

export const eqObjectId = <T>(schemaObj?: Realm.Object<T>, otherObj?: Realm.Object<T>) => {
  // Test for the exact same Realm object.
  return schemaObj?._objectKey() === otherObj?._objectKey();
};

export const eqBoolean = (schemaAttr?: boolean, formAttr?: boolean) => {
  if (lodash.isBoolean(schemaAttr) && lodash.isBoolean(formAttr)) {
    return schemaAttr === formAttr;
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

// Used for setting number values on realm writes. Converts a string or undefined
// value to a number or undefined. Avoids possible NaN.
export const toNumber = (value?: string) => {
  return value !== undefined ? Number(value) : undefined;
};
