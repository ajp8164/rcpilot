import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import {
  ChecklistActionNonRepeatingScheduleTimeframe,
  ChecklistActionRepeatingScheduleFrequency,
  ChecklistTemplateActionScheduleType,
  ChecklistTemplateType
} from 'types/checklistTemplate';
import { ListItem, ListItemInput } from 'components/atoms/List';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { NewChecklistTemplateNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { Platform, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistActionInterface } from 'components/ChecklistActionEditorScreen';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplateEditor'> |
  NativeStackScreenProps<NewChecklistTemplateNavigatorParamList, 'NewChecklistTemplate'>;

const ChecklistTemplateEditorScreen = ({ navigation, route }: Props) => {
  const { checklistTemplateId } = route.params || {};

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const checklistTemplate = useObject(ChecklistTemplate, new BSON.ObjectId(checklistTemplateId));
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  const [name, setName] = useState(checklistTemplate?.name || undefined);
  const [type, setType] = useState(checklistTemplate?.type || ChecklistTemplateType.PreEvent);
  const [actions, setActions] = useState(
    (checklistTemplate?.actions.toJSON() || []) as Omit<ChecklistAction, keyof Realm.Object>[]
  );

  useEffect(() => {
    const canSave = !!name && (
      !eqString(checklistTemplate?.name, name) ||
      !eqString(checklistTemplate?.type, type)
    );

    const save = () => {
      if (checklistTemplate) {
        realm.write(() => {
          checklistTemplate.name = name!;
          checklistTemplate.type = type;
          // Existing actions are saved inline with edits/adds.
        });
      } else {
        realm.write(() => {
          realm.create('ChecklistTemplate', {
            name,
            type,
            actions,
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    const onEdit = () => {
      setEditModeEnabled(!editModeEnabled);
    };

    navigation.setOptions({
      headerLeft: () => {
        if (!checklistTemplateId) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
              onPress={navigation.goBack}
            />
          )
        }
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        } else {
          return (
            <Button
              title={editModeEnabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onEdit}
            />
          )
        }
      },
    });
  }, [ name, type, actions, editModeEnabled ]);

  useEffect(() => {
    event.on('checklist-template-type', setType);
    event.on('checklist-action', upsertAction);
    return () => {
      event.removeListener('checklist-template-type', setType);
      event.removeListener('checklist-action', upsertAction);
    };
  }, []);

  useEffect(() => {
    if (checklistTemplate) {
      realm.write(() => {
        // @ts-expect-error Not recognizing the target as an embedded array.
        checklistTemplate.actions = actions;
      });
    }
  }, [ actions ]);

  const upsertAction = (editorResult: ChecklistActionInterface) => {
    const newOrChangedAction = editorResult as Omit<ChecklistAction, keyof Realm.Object>;
    if (checklistTemplate && newOrChangedAction.ordinal ) {
      // Update existing action.
      setActions(prevState => {
        prevState[newOrChangedAction.ordinal] = newOrChangedAction;
        return prevState;
      });  
    } else {
      // Insert a new action.
      newOrChangedAction.ordinal = actions.length;
      setActions(prevState => {
        return ([] as Omit<ChecklistAction, keyof Realm.Object>[]).concat(prevState, newOrChangedAction);
      });
    }
  };

  const deleteAction = (index: number) => {
    if (checklistTemplate) {
      const a = ([] as Omit<ChecklistAction, keyof Realm.Object>[]).concat(actions);
      a.splice(index, 1);
      reorderActions(a);
    }
  };

  const reorderActions = (data: Omit<ChecklistAction, keyof Realm.Object>[]) => {
    for (let i = 0; i < data.length; i++) {
      data[i].ordinal = i;
    };
    setActions(data);
  };

  const actionScheduleToString = (action: ChecklistAction) => {
    let result = '';
    if (action.schedule.type === ChecklistTemplateActionScheduleType.Repeating) {
      let when = '';
      let times = '';
      let freq = '';

      if (action.schedule.period === ChecklistActionRepeatingScheduleFrequency.ModelMinutes) {
        times = action.schedule.value.toString();
        freq = ` minute${action.schedule.value === 1 ? '' : 's'} of model time`;
      } else {
        if (action.schedule.value === 1) {
          times = '';
          freq = action.schedule.period.toLowerCase().replace(/s$/, '');
        } else {
          times = `${action.schedule.value} `;
          freq = action.schedule.period.toLowerCase();
        }

        if (action.schedule.period !== ChecklistActionRepeatingScheduleFrequency.Events) {
          freq += ' of calendar time';
        }
      }

      if (type === ChecklistTemplateType.PreEvent) {
        when = 'before every';
      } else {
        when = 'after every';
      }
      result = `Perform ${when} ${times}${freq}`;
    } else {
      let after = '';
      let value = '';
      let timeframe = '';

      if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
        value = '';
        timeframe = '';
        after = 'immediatley at install';
      } else {
        value = `${action.schedule.value} `;
        timeframe = action.schedule.period!.toString().toLowerCase();

        if (action.schedule.value === 1) {
          timeframe = timeframe.replace(/s$/, '');
        }

        if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
          timeframe = 'minutes';
          if (action.schedule.value === 1) {
            timeframe = timeframe.replace(/s$/, '');
          }  
          after = ' after total model time at install';
        } else if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
          after = ' after total events at install';
        }  else {
          after = ' after date at install';
        }
      }
      result = `Perform once ${value}${timeframe}${after}`;
    }
    return result;
  };

  const renderAction = ({
    item: action,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<ChecklistAction | Omit<ChecklistAction, keyof Realm.Object>>) => {
    const index = getIndex();
    if (index === undefined) return;
    return (
      <View
        key={index}
        style={[isActive ? s.shadow : {}]}>
        <ListItem
          title={action.description}
          subtitle={actionScheduleToString(action as ChecklistAction)}
          subtitleNumberOfLines={1}
          position={actions!.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === actions!.length - 1 ? ['last'] : []}
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
              onPress: () => deleteAction(index),
            }]
          }}
          // @ts-expect-error The union type for navigators is not recognized.
          onPress={() => navigation.navigate('ChecklistActionEditor', {
            checklistAction: action,
            checklistTemplateType: type,
            eventName: 'checklist-action',
          })}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <NestableScrollContainer
      showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'NAME & TYPE'} />
        <ListItemInput
          value={name}
          placeholder={'Checklist Template Name'}
          position={['first']}
          onChangeText={setName}
        /> 
        <ListItem
          title={'Template for List Type'}
          value={type}
          position={['last']}
          // @ts-expect-error The union type for navigators is not recognized.
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Template Type',
            headerBackTitle: 'Back',
            values: Object.values(ChecklistTemplateType),
            selected: type,
            eventName: 'checklist-template-type',
          })}
        />
        {actions.length > 0 && <Divider text={'ACTIONS'} />}
        <View  style={{flex:1}}>
        <NestableDraggableFlatList
          data={actions}
          renderItem={renderAction}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          style={s.actionsList}
          containerStyle={s.swipeableListMask}
          animationConfig={{
            damping: 20,
            mass: 0.01,
            stiffness: 100,
            overshootClamping: false,
            restSpeedThreshold: 0.2,
            restDisplacementThreshold: 2,
          }}
          onDragEnd={({ data }) => reorderActions(data)}
        />
        </View>
        <Divider />
        <ListItem
          title={'Add a New Action'}
          titleStyle={s.add}
          position={['first', 'last']}
          rightImage={false}
          // @ts-expect-error The union type for navigators is not recognized.
          onPress={() => navigation.navigate('NewChecklistActionNavigator', {
            screen: 'NewChecklistAction',
            params: { 
              checklistTemplateType: type,
              eventName: 'checklist-action'
            },
          })}
        />
        <Divider />
      </NestableScrollContainer>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  add: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  actionsList: {
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

export default ChecklistTemplateEditorScreen;
