import { Object, ObjectSchema } from 'realm';

export class Address extends Object<Address> {
  street!: string;
  city!: string;
  state!: string;
  zip!: string;

  static schema: ObjectSchema = {
    name: 'Address',
    embedded: true,
    properties: {
      street: 'string',
      city: 'string',
      state: 'string',
      zip: 'string',
    },
  };
}
