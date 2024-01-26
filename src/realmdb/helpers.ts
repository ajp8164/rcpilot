// Used to test a possible previously saved model object attribute value 'schemaAttr'
// with a possibly changed form value 'formAttr' where the value is expected to be a
// specific type. The 'formAttr' is always a string; by convention UI components interact

import lodash from "lodash";

// with strings so we don't require a conversion prior to calling these functions.
export const eqNumber = (schemaAttr?: number, formAttr?: string) => {
  if (!!schemaAttr && !!formAttr) {
    return schemaAttr.toString() === formAttr;
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

export const eqString = (schemaAttr?: string, formAttr?: string) => {
  if (!!schemaAttr && !!formAttr) {
    return schemaAttr === formAttr;
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

export const eqObject = (schemaAttr?: object, formAttr?: object) => {
  // Remove any realm properties from the schema attribute.
  return lodash.isEqual(JSON.parse(JSON.stringify(schemaAttr)), formAttr);
};

export const eqBoolean = (schemaAttr?: boolean, formAttr?: boolean) => {
  if (!!schemaAttr && !!formAttr) {
    return schemaAttr === formAttr;
  } else {
    return !!schemaAttr === !!formAttr;
  }
};

// Used for setting number values on realm writes. Converts a string or undefined
// value to a number or undefined. Avoids possible NaN.
export const toNumber = (value?: string) => {
  return value !== undefined ? Number(value) : undefined;
}
