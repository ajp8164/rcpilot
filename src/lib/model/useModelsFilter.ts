import { rql } from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { Model } from 'realmdb/Model';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useModelsFilter = () => {
  const filterId = useSelector(selectFilters(FilterType.ModelsFilter));
  const values = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  const models = useQuery<Model>('Model');

  const query = rql()
    .and('type', values?.modelType)
    .and('category._id', values?.category)
    .and('lastEvent', values?.cRating)
    .and('statistics.totalTime', values?.totalTime)
    .and('logsBatteries', values?.logsBatteries)
    .and('logsFuel', values?.logsFuel)
    .and('damaged', values?.damaged)
    .and('vendor', values?.vendor)
    .and('notes', values?.notes)
    .string();

  return query ? models.filtered(query) : models;
};
