import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import { ListItem, ListItemInput, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';

import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type BatteryCellValuesEditorResult = {
  cellValues: number[];
  packValue: number;
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCellValuesEditor'>,
  NativeStackScreenProps<NewBatteryCycleNavigatorParamList>
>;

const BatteryCellValuesEditorScreen = ({ navigation, route }: Props) => {
  const {
    config,
    eventName,
    packValue: _packValue,
    cellValues: _cellValues,
    pCells: _pCells,
    sCells,
  } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const [packValue, setPackValue] = useState<string>(_packValue.toString());
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [cellValues, setCellValues] = useState<string[]>(_cellValues.map(v => {return v.toString()}));

  useEffect(() => {
    const onDone = () => {
      event.emit(eventName, {
        cellValues: cellValues.map(v => {return v.length > 0 ? parseFloat(v) : 0}),
        packValue: parseFloat(packValue),
      } as BatteryCellValuesEditorResult);

      navigation.goBack();
    };

    setScreenEditHeader({visible: true, action: onDone});
  }, [ cellValues, packValue ]);

  useEffect(() => {
    computePack();
  }, [ cellValues ]);

  const autoFill = (index: number, value: string) => {
    // Convenience auto-fill.
    // When entering into the first value, if the rest of the values are zero then fill.
    const r = ([] as (string)[]).concat(cellValues);
    if (index === 0) {
      const notFilled = r.slice(1).every(v => {return parseFloat(v) === 0});
      if (notFilled) {
        r.fill(value);
      }
    } else {
      r[index] = value;
    }
    setCellValues(r);
  };

  const computePack = () => {
    // Compute new total pack value.
    const newPackValue = cellValues.reduce((previousValue, currentValue) => {
      const pv = previousValue || '0';
      const cv = currentValue || '0';
      return (parseFloat(pv) + parseFloat(cv)).toFixed(config.precision);
    });
    setPackValue(newPackValue);
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    const s = (index % sCells) + 1;
    const p = Math.trunc(index / sCells) + 1;
    return (
      <ListItemInput
        title={`S Cell ${s} in P Leg ${p}`}
        label={config.label}
        value={parseFloat(value) === 0 || value === '' ? undefined : value}
        placeholder={'Value'}
        keyboardType={'decimal-pad'}
        numeric={true}
        numericProps={{prefix: '', precision: config.precision}}
        position={listItemPosition(index, cellValues.length)}
        onChangeText={value => {
          setCellValues(prevState => {
            const r = ([] as string[]).concat(prevState);
            r[index] = value;
            return r;
          });
        }}
        onBlur={() => {
          autoFill(index, cellValues[index]);
        }}
      /> 
    );
  };

  return (
    <View
      style={theme.styles.view}>
      <FlatList
        data={cellValues}
        renderItem={renderValue}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Divider text={`OVERALL PACK ${config.name.toUpperCase()}`} />
            <ListItem
              title={'Total Pack'}
              value={
                <View style={s.valueContainer}>
                  <Text style={s.value}>
                    {parseFloat(packValue) === 0 ? 'Unknown' : packValue}
                  </Text>
                  <Text style={s.valueLabel}>
                    {` ${config.label}`}
                  </Text>
                </View>
              }
              position={['first', 'last']}
              rightImage={false}
            />
            <Divider text={`PER-CELL ${config.namePlural.toUpperCase()}`}/>
          </>
        }
        ListFooterComponent={
          <>
            <Divider />
            <Divider />
          </>
        }
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  valueContainer: {
    flexDirection: 'row', left: -25
  },
  value: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
  valueLabel: {
    ...theme.styles.textNormal,
    color: theme.colors.subtleGray,
  },
}));

export default BatteryCellValuesEditorScreen;
