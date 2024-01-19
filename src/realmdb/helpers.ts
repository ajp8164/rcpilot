// Used to test a possible previously saved model object attribute value 'modelAttr'
// with a possibly changed form value 'formAttr' where the value is expected to be a
// specific type. The 'formAttr' is always a string; by convention UI components interact
// with strings so we don't require a conversion prior to calling these functions.
export const eqNumber = (modelAttr?: number, formAttr?: string) => {
  if (!!modelAttr && !!formAttr) {
    return modelAttr.toString() === formAttr;
  } else {
    return !!modelAttr === !!formAttr;
  }
};

export const eqString = (modelAttr?: string, formAttr?: string) => {
  if (!!modelAttr && !!formAttr) {
    return modelAttr === formAttr;
  } else {
    return !!modelAttr === !!formAttr;
  }
};

export const eqObject = (modelAttr?: object, formAttr?: object) => {
  if (!!modelAttr && !!formAttr) {
    return modelAttr === formAttr;
  } else {
    return !!modelAttr === !!formAttr;
  }
};

// Used for setting number values on realm writes. Converts a string or undefined
// value to a number or undefined. Avoids possible NaN.
export const toNumber = (value?: string) => {
  return value !== undefined ? Number(value) : undefined;
}
