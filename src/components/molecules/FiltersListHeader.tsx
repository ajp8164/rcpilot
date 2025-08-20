import React, { View } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import lodash from 'lodash';

interface FiltersListHeader {
  filterSummary: string;
  itemName: string;
  generalFilterId?: string;
  selectedFilterId?: string;
  specificItemName?: string;
  useGeneralFilter?: boolean;
  onPressEditGeneralFilter: () => void;
  onPressGeneralFilter: () => void;
  onPressNoFilter: () => void;
}

const FiltersListHeader = ({
  filterSummary,
  itemName,
  generalFilterId,
  selectedFilterId,
  specificItemName,
  useGeneralFilter,
  onPressEditGeneralFilter,
  onPressGeneralFilter,
  onPressNoFilter,
}: FiltersListHeader) => {
  const theme = useTheme();

  const name = lodash.startCase(`${itemName}s`);
  const specific = lodash.startCase(specificItemName || name);
  return (
    <View>
      <Divider />
      <ListItemCheckBoxInfo
        title={'No Filter'}
        subtitle={`Matches all ${name}`}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={onPressNoFilter}
      />
      {useGeneralFilter && generalFilterId ? (
        <>
          <Divider />
          <ListItemCheckBoxInfo
            title={`General ${specific} Filter`}
            subtitle={filterSummary}
            subtitleLines={0}
            position={['first', 'last']}
            checked={generalFilterId === selectedFilterId}
            onPress={onPressGeneralFilter}
            onPressInfo={onPressEditGeneralFilter}
          />
          <Divider
            note
            light
            subHeaderStyle={theme.text.small}
            text={`You can save the General ${specific} Filter to remember a specific filter configuration for later use.`}
          />
        </>
      ) : null}
    </View>
  );
};

export { FiltersListHeader };
