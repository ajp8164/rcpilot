import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { FlatList, ListRenderItem, Text, TextStyle, View } from 'react-native';
import {
  ListItem,
  ListItemInput,
  ListItemInputMethods,
  listItemPosition,
} from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';

import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type BatteryCellValuesEditorConfig = {
  name: string;
  namePlural: string;
  label: string;
  precision: number;
  headerButtonStyle?: TextStyle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any; // Caller data that is simply passed through the editor.
};

export type BatteryCellValuesEditorResult = {
  cellValues: number[];
  packValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
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

  const [packValue, setPackValue] = useState(_packValue.toFixed(3));
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [cellValues, setCellValues] = useState(
    _cellValues.map(v => {
      return v.toString();
    }),
  );
  const initializing = useRef(true);
  const liRef = useRef<ListItemInputMethods[]>([]);

  useEffect(() => {
    const canSave = !lodash.isEqual(
      _cellValues.map(v => {
        return v.toString();
      }),
      cellValues.map(v => {
        return v.toString();
      }),
    );

    const onDone = () => {
      event.emit(eventName, {
        cellValues: cellValues.map(v => {
          return v.length > 0 ? parseFloat(v) : 0;
        }),
        packValue: parseFloat(packValue),
        extraData: config.extraData,
      } as BatteryCellValuesEditorResult);

      navigation.goBack();
    };

    setScreenEditHeader(
      { enabled: canSave, action: onDone, style: config.headerButtonStyle },
      { visible: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellValues, packValue]);

  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }

    // Compute new total pack value.
    const newPackValue = cellValues.reduce((previousValue, currentValue) => {
      const pv = previousValue || '0';
      const cv = currentValue || '0';
      return (parseFloat(pv) + parseFloat(cv)).toFixed(config.precision);
    });
    setPackValue(newPackValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellValues]);

  const autoFill = (index: number, value: string) => {
    // Convenience auto-fill.
    // When entering into the first value, if the rest of the values are zero then fill.
    const r = ([] as string[]).concat(cellValues);
    if (index === 0) {
      const notFilled = r.slice(1).every(v => {
        return parseFloat(v) === 0;
      });
      if (notFilled) {
        r.fill(value);
        // Set input component values.
        for (let i = 1; i < _cellValues.length; i++) {
          liRef.current[i].setValue(value);
        }
      }
    } else {
      r[index] = value;
    }
    setCellValues(r);
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    const s = (index % sCells) + 1;
    const p = Math.trunc(index / sCells) + 1;
    return (
      <ListItemInput
        ref={ref => ref && (liRef.current[index] = ref)}
        title={`S Cell ${s} in P Leg ${p}`}
        label={config.label}
        value={parseFloat(value) === 0 || value === '' ? undefined : value}
        placeholder={'Value'}
        keyboardType={'decimal-pad'}
        numeric={true}
        numericProps={{ prefix: '', precision: config.precision }}
        position={listItemPosition(index, cellValues.length)}
        onChangeText={value => {
          // Cause a re-render to update total pack value.
          setCellValues(prevState => {
            const r = ([] as string[]).concat(prevState);
            r[index] = value || '0';
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
    <View style={theme.styles.view}>
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
                  <Text style={s.value}>{parseFloat(packValue) === 0 ? 'Unknown' : packValue}</Text>
                  <Text style={s.valueLabel}>{` ${config.label}`}</Text>
                </View>
              }
              position={['first', 'last']}
              rightImage={false}
            />
            <Divider text={`PER-CELL ${config.namePlural.toUpperCase()}`} />
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
    flexDirection: 'row',
    left: -25,
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
