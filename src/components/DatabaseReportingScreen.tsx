import { AppTheme, useTheme } from 'theme';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { OutputReportTo, OutputReportToDescription } from 'types/database';
import { Platform, Pressable, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Report } from 'realmdb/Report';
import {
  SetupNavigatorParamList,
} from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { saveOutputReportTo } from 'store/slices/appSettings';
import { selectOutputReportTo } from 'store/selectors/appSettingsSelectors';
import { useEvent } from 'lib/event';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseReporting'>;

const DatabaseReportingScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();
  const event = useEvent();

  const outputReportTo = useSelector(selectOutputReportTo);

  const realm = useRealm();
  const allReports = useQuery('Report');
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  const [reports, setReports] = useState(
    (allReports.toJSON() || []) as Omit<Report, keyof Realm.Object>[]
  );

  console.log(reports);

  useEffect(() => {
    const onEdit = () => {
      setEditModeEnabled(!editModeEnabled);
    };

    navigation.setOptions({
      headerRight: () => {
        if (!reports.length) return null;
        return (
          <Button
            title={editModeEnabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.doneButton]}
            onPress={onEdit}
          />
        )
      },
    });
  }, [ editModeEnabled, reports ]);

  useEffect(() => {
    event.on('output-report-to', setOutputReportTo);
    return () => {
      event.removeListener('ouput-report-to', setOutputReportTo);
    };
  }, []);

  useEffect(() => {
    realm.write(() => {
      // checklistTemplate.actions = reports;
    });
  }, [ reports ]);

  const setOutputReportTo = (value: OutputReportTo) => {
    dispatch(saveOutputReportTo({ value }));
  };

  const deleteReport = (index: number) => {
    const a = ([] as Omit<Report, keyof Realm.Object>[]).concat(reports);
    a.splice(index, 1);
    reorderReports(a);
  };

  const reorderReports = (data: Omit<Report, keyof Realm.Object>[]) => {
    for (let i = 0; i < data.length; i++) {
      data[i].ordinal = i;
    };
    setReports(data);
  };

  const reportToString = (report: Report) => {
    return report._id.toString();
  };

  const renderReport = ({
    item: report,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<Report | Omit<Report, keyof Realm.Object>>) => {
    const index = getIndex();
    if (index === undefined) return;
    return (
      <View
        key={index}
        style={[isActive ? s.shadow : {}]}>
        <ListItem
          title={report.name}
          subtitle={reportToString(report as Report)}
          subtitleNumberOfLines={1}
          position={reports!.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === reports!.length - 1 ? ['last'] : []}
          titleNumberOfLines={1}
          drag={drag}
          editable={{
            item: {
              icon: 'remove-circle',
              color: theme.colors.assertive,
              action: 'open-swipeable',
            },
            reorder: true,
          }}
          showEditor={editModeEnabled}
          swipeable={{
            rightItems: [{
              icon: 'delete',
              text: 'Delete',
              color: theme.colors.assertive,
              x: 64,
              onPress: () => deleteReport(index),
            }]
          }}
          rightImage={
            <Pressable
              style={{flexDirection: 'row'}}
              // onPress={() => navigation.navigate('Model', {
              //   modelId: '1'
              // })}
              >
              <CustomIcon
                name={'circle-info'}
                size={22}
                color={theme.colors.screenHeaderBackButton}
              />
            </Pressable>
          }
          // onPress={() => navigation.navigate('ReportEditor', {
          //   reportId: report._id,
          //   eventName: 'report',
          // })}
        />
      </View>
    );
  };

  return (
    <NestableScrollContainer
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'DESTINATION'}/>
      <ListItem
        title={'Output Report To'}
        value={outputReportTo}
        position={['first', 'last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Output To',
          footer: 'Specifies the destination for database report output.',
          values: Object.values(OutputReportTo),
          selected: outputReportTo,
          eventName: 'output-report-to',
        })}
      />
      <Divider type={'note'} text={
        OutputReportToDescription[
          Object.keys(OutputReportTo)[Object.values(OutputReportTo).indexOf(outputReportTo)] as keyof typeof OutputReportToDescription
        ]
      }/>
      <ListItem
        title={'Add a New Report'}
        titleStyle={s.newReport}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => {return}}
      />
      <Divider text={'EVENT/MAINTENANCE LOG REPORTS'}/>
      <View style={{flex:1}}>
        <NestableDraggableFlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          style={s.reportsList}
          containerStyle={s.swipeableListMask}
          animationConfig={{
            damping: 20,
            mass: 0.01,
            stiffness: 100,
            overshootClamping: false,
            restSpeedThreshold: 0.2,
            restDisplacementThreshold: 2,
          }}
          onDragEnd={({ data }) => reorderReports(data)}
        />
      </View>
      <Divider type={'note'} text={'Tapping a row generates the corresponding report and outputs it to the selected destination.'}/>
      <Divider text={'QR CODE REPORTS'}/>
      <View style={{flex:1}}>
        <NestableDraggableFlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          style={s.reportsList}
          containerStyle={s.swipeableListMask}
          animationConfig={{
            damping: 20,
            mass: 0.01,
            stiffness: 100,
            overshootClamping: false,
            restSpeedThreshold: 0.2,
            restDisplacementThreshold: 2,
          }}
          onDragEnd={({ data }) => reorderReports(data)}
        />
      </View>
      <Divider type={'note'} text={'Tapping a row generates the corresponding report and outputs it to the selected destination.'}/>
    </NestableScrollContainer>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  newReport: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
  reportsList: {
    overflow: 'visible',
  },
  shadow: {
    ...theme.styles.shadowGlow,
    ...Platform.select({
      android: {
        borderRadius: 20,
      },
    }),
  },
  swipeableListMask: {
    borderRadius: 10,
    overflow: 'hidden',
  },
}));

export default DatabaseReportingScreen;
