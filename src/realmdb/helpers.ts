// Used to test a possibly saved model object attribute value 'modelAttr' with a possibly
// changed form value 'formAttr' where the value is expected to be a number.
export const eqNumber = (modelAttr?: number, formAttr?: string) => {
  // Possibly tests against null for testing against realm unset value.
  return modelAttr !== (formAttr !== undefined ? Number(formAttr) : null);
};

// Used to test a possibly saved model object attribute value 'modelAttr' with a possibly
// changed form value 'formAttr' where the value is expected to be a string.
export const eqString = (modelAttr?: string, formAttr?: string) => {
  // Possibly tests against null for testing against realm unset value.
  return modelAttr !== (formAttr !== undefined ? formAttr : null);
};

// Used for setting number values on realm writes. Converts a string or undefined
// value to a number or undefined. Avoids possible NaN.
export const toNumber = (value?: string) => {
  return value !== undefined ? Number(value) : undefined;
}
