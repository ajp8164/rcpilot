// Used to test a possible previously saved model object attribute value 'schemaAttr'
// with a possibly changed form value 'formAttr' where the value is expected to be a
// specific type. The 'formAttr' is always a string; by convention UI components interact
// with strings so we don't require a conversion prior to calling these functions.
import lodash from 'lodash';

export const eqObject = (schemaObj?: object, otherFormObj?: object) => {
  // Remove any realm properties from the schema attribute.
  return lodash.isEqual(JSON.parse(JSON.stringify(schemaObj)), otherFormObj);
};

// Used for setting number values on realm writes. Converts a string or undefined
// value to a number or undefined. Avoids possible NaN.
export const toNumber = (value?: string, def = 0) => {
  return value !== undefined ? Number(value) : def;
};
