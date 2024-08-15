import { HMMToSeconds, MSSToSeconds } from 'lib/formatters';
import { DateTime } from 'luxon';

export * from './ListItemFilterBoolean';
export * from './ListItemFilterDate';
export * from './ListItemFilterEnum';
export * from './ListItemFilterNumber';
export * from './ListItemFilterString';

export type FilterState =
  | BooleanFilterState
  | DateFilterState
  | EnumFilterState
  | NumberFilterState
  | StringFilterState;

export type BooleanFilterState = {
  relation: BooleanRelation;
  value: string[];
};

export type DateFilterState = {
  relation: DateRelation;
  value: string[];
};

export type EnumFilterState = {
  relation: EnumRelation;
  value: string[];
};

export type NumberFilterState = {
  relation: NumberRelation;
  value: string[];
};

export type StringFilterState = {
  relation: StringRelation;
  value: string[];
};

export enum BooleanRelation {
  Any = 'Any',
  Yes = 'Yes',
  No = 'No',
}

export enum DateRelation {
  Any = 'Any',
  Before = 'Before',
  After = 'After',
  Past = 'Past',
}

export enum EnumRelation {
  Any = 'Any',
  Is = 'Is',
  IsNot = 'Is Not',
}

export enum NumberRelation {
  Any = 'Any',
  LT = '<',
  GT = '>',
  EQ = '=',
  NE = '!=',
}

export enum StringRelation {
  Any = 'Any',
  Contains = 'Contains',
  Missing = 'Missing',
}

// Type and union of all relations.
export type FilterRelation =
  | BooleanRelation
  | DateRelation
  | EnumRelation
  | NumberRelation
  | StringRelation;

export const FilterRelation = {
  ...BooleanRelation,
  ...DateRelation,
  ...EnumRelation,
  ...NumberRelation,
  ...StringRelation,
};

// Build a RQL query string from a FilterState.
// 'logicalOp' is used for chaining property filters.
// 'propertyName' is the property name on the realm object which is to be filtered.
export const rql = () => {
  return {
    result: '',
    and(propertyName: string, filterState?: FilterState) {
      return this.q('AND', propertyName, filterState);
    },
    or(propertyName: string, filterState?: FilterState) {
      return this.q('OR', propertyName, filterState);
    },
    q(logicalOp: string, propertyName: string, filterState?: FilterState) {
      const relation = filterState?.relation;
      const value = filterState?.value;
      let result = '';

      if (!value || !relation || relation === FilterRelation.Any) {
        return this;
      }

      // Boolean queries
      if (relation === FilterRelation.No || relation === FilterRelation.Yes) {
        result = `${propertyName} == ${value}`;
      }

      // Enum/object queries
      if (relation === FilterRelation.Is) {
        // If the input property ends in '_id' then use an oid query, otherwise just use the value provided.
        if (propertyName.match(/\._id$/)) {
          const oidValue = value.map(v => `oid(${v})`).join(',');
          result = `${propertyName} IN {${oidValue}}`;
        } else {
          result = `${propertyName} IN {${value.map(v => `'${v}'`).join(',')}}`;
        }
      }
      if (relation === FilterRelation.IsNot) {
        // If the input property ends in '_id' then use an oid query, otherwise just use the value provided.
        if (propertyName.match(/\._id$/)) {
          const oidValue = value.map(v => `oid(${v})`).join(',');
          result = `NOT ${propertyName} IN {${oidValue}}`;
        } else {
          result = `NOT ${propertyName} IN {${value.map(v => `'${v}'`).join(',')}}`;
        }
      }

      // Date queries
      if (relation === FilterRelation.Before) {
        result = `${propertyName} < '${value}'`;
      }
      if (relation === FilterRelation.After) {
        result = `${propertyName} > '${value}'`;
      }
      if (relation === FilterRelation.Past) {
        // E.g. ['1', 'Days']
        const past = DateTime.now().minus({ [value[1].toLowerCase()]: Number(value[0]) });
        result = `${propertyName} >= '${past}'`;
      }

      // Numeric queries
      if (
        relation === NumberRelation.EQ ||
        relation === NumberRelation.GT ||
        relation === NumberRelation.LT ||
        relation === NumberRelation.NE
      ) {
        const op = relation;
        if (value[1] === 'h:mm') {
          result = `${propertyName} ${op} '${HMMToSeconds(value[0])}'`;
        } else if (value[1] === 'm:ss') {
          result = `${propertyName} ${op} '${MSSToSeconds(value[0])}'`;
        } else {
          result = `${propertyName} ${op} '${value[0]}'`;
        }
      }

      // Text queries
      if (relation === FilterRelation.Contains) {
        const text = value[0];
        result = `${propertyName} CONTAINS[c] '${text}'`;
      }
      if (relation === FilterRelation.Missing) {
        const text = value[0];
        result = `NOT ${propertyName} CONTAINS[c] '${text}'`;
      }

      // Update/chain the query
      if (this.result === '') {
        this.result = result;
      } else {
        this.result = `${this.result} ${logicalOp} ${result}`;
      }
      return this;
    },
    string() {
      return this.result;
    },
  };
};
