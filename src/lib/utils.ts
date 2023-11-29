import lodash from "lodash";

export const toArrayOrdinals = (array: string[]): number[] => {
  return array.map(str => {
    return Number(str);
  });
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0,
      // eslint-disable-next-line no-bitwise
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const enumValuesToIds = (values: string[], enumObj: {[key in string]: string;}): string[] => {
  const keys = [];
  for (let i = 0; i < values.length; i++) {
    const k = lodash.findKey(enumObj, values[i]);
    if (k) {
      keys.push(k);
    }
  }
  return keys;
};

export const enumIdsToValues = (ids: string[], enumObj: {[key in string]: string;}): string[] => {
  const values = [];
  for (let i = 0; i < ids.length; i++) {
    const v = enumObj[ids[i]];
    if (v) {
      values.push(v);
    }
  }
  return values;
};
