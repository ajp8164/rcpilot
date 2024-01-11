import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency, ChecklistTemplateActionScheduleType, ChecklistTemplateType } from 'types/checklistTemplate';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { NewChecklistTemplateNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
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

  const [name, setName] = useState(checklistTemplate?.name || undefined);
  const [type, setType] = useState(checklistTemplate?.type || ChecklistTemplateType.PreEvent);
  const [actions, setActions] = useState<Realm.List<ChecklistAction> | Omit<ChecklistAction, keyof Realm.Object>[]>(
    checklistTemplate?.actions || []
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
          // checklistTemplate.actions = [];
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
        }
      },
    });
  }, [ name, type, actions ]);

  useEffect(() => {
    event.on('checklist-template-type', setType);
    event.on('checklist-action', upsertAction);
    return () => {
      event.removeListener('checklist-template-type', setType);
      event.removeListener('checklist-action', upsertAction);
    };
  }, []);

  const upsertAction = (editorResult: ChecklistActionInterface) => {
    const newAction = editorResult.action as ChecklistAction;
    const actionIndex = editorResult.actionIndex;

    if (checklistTemplate && actionIndex) {
      // Update existing action.
      realm.write(() => {
        console.log('index at save',actionIndex);
        checklistTemplate.actions[actionIndex] = newAction;
      });
    } else if (checklistTemplate && !!!actionIndex) {
      // Insert a new action.
      console.log('pushing action at save',actionIndex);
      realm.write(() => {
        checklistTemplate.actions.push(newAction);
      });
    } else {
      // No checklist template saved yet. Add action to state to save later.
      console.log('caching action at save',actionIndex);
      setActions(prevState => {
        return prevState.concat(newAction);
      });
    }
  };

  const deleteAction = (index: number) => {
    console.log('delete', index);
    if (checklistTemplate) {
      realm.write(() => {
        checklistTemplate.actions.splice(index, 1);
      });
    }
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

  const renderActions: ListRenderItem<ChecklistAction | Omit<ChecklistAction, keyof Realm.Object>> = ({ item: action, index }) => {
    return (
      <ListItem
        key={index}
        title={action.description}
        subtitle={actionScheduleToString(action as ChecklistAction)}
        position={actions!.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === actions!.length - 1 ? ['last'] : []}
        swipeRightItems={[{
          icon: 'delete',
          text: 'Delete',
          color: theme.colors.assertive,
          x: 64,
          onPress: () => deleteAction(index)},
        ]}
        // @ts-ignore
        onPress={() => navigation.navigate('ChecklistActionEditor', {
          checklistAction: {
            action,
            actionIndex: index,
          },
          checklistTemplateType: type,
          eventName: 'checklist-action',
        })}
      />
    );
  };
  
  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'NAME & TYPE'} />
        <ListItemInput
          value={checklistTemplate?.name}
          placeholder={'Checklist Template Name'}
          position={['first']}
          onChangeText={setName}
        /> 
        <ListItem
          title={'Template for List Type'}
          value={type}
          position={['last']}
          // @ts-ignore
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Template Type',
            headerBackTitle: 'Back',
            values: Object.values(ChecklistTemplateType),
            selected: type,
            eventName: 'checklist-template-type',
          })}
          /> 
        {actions.length > 0 && <Divider text={'ACTIONS'} />}
        <FlatList
          data={actions}
          renderItem={renderActions}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
        <Divider />
        <ListItem
          title={'Add a New Action'}
          titleStyle={s.add}
          position={['first', 'last']}
          rightImage={false}
          // @ts-ignore
          onPress={() => navigation.navigate('NewChecklistActionNavigator', {
            screen: 'NewChecklistAction',
            params: { 
              checklistTemplateType: type,
              eventName: 'checklist-action'
            },
          })}
        />
        <Divider />
      </ScrollView>
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
}));

export default ChecklistTemplateEditorScreen;
