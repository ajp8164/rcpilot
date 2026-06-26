import { Object, ObjectSchema } from 'realm';

export class Address extends Object<Address> {
  addressLine1!: string;
  city!: string;
  state!: string;
  postalCode!: string;
  country!: string;

  static schema: ObjectSchema = {
    name: 'Address',
    embedded: true,
    properties: {
      addressLine1: 'string',
      city: 'string',
      state: 'string',
      postalCode: 'string',
      country: 'string',
    },
  };
}
