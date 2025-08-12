export const Masks = {
  BATTERY_CELL_COUNT: '00',
  BATTERY_CYCLES: '0000',
  C_RATING: '000',
  CURRENCY: '$000000.00',
  GALLONS: '000.00',
  HOURS_MINUTES: '000:00',
  MAH: '000000',
  MINUTES_SECONDS: '000:00',
  OUNCES: '000.00',
  OHMS: '000.000',
  PROPELLER_BLADE_COUNT: '00',
  PROPELLER_DIAMETER: '000.00',
  PROPELLER_PITCH: '000.00',
  VOLTS: '000.00',
};

// Returns the decimal precision for a mask value.
export const precisionFromMask = (mask: string) => {
  return mask.split('.')?.[1]?.length || 0;
};
