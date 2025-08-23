import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistType } from 'types/checklist';
import { ModelsNavigatorParamList } from 'types/navigation';

export type ChecklistTemplatePickerResult = {
  checklistTemplateId: string;
};

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'ChecklistTemplatePicker'
>;

const ChecklistTemplatePickerScreen = ({ navigation, route }: Props) => {
  const { eventName } = route.params;

  const theme = useTheme();
  const event = useEvent();

  const checklistTemplates = useQuery(ChecklistTemplate);

  const [allChecklistTemplates, setAllChecklistTemplates] = useState<{
    [key in ChecklistType]: ChecklistTemplate[];
  }>({
    [ChecklistType.PreEvent]: [],
    [ChecklistType.PostEvent]: [],
    [ChecklistType.Maintenance]: [],
    [ChecklistType.OneTimeMaintenance]: [],
  });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={navigation.goBack}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pre = checklistTemplates.filter(
      t => t.type === ChecklistType.PreEvent,
    );
    const post = checklistTemplates.filter(
      t => t.type === ChecklistType.PostEvent,
    );
    const maint = checklistTemplates.filter(
      t => t.type === ChecklistType.Maintenance,
    );
    setAllChecklistTemplates({
      [ChecklistType.PreEvent]: pre,
      [ChecklistType.PostEvent]: post,
      [ChecklistType.Maintenance]: maint,
      [ChecklistType.OneTimeMaintenance]: [], // Internally managed only.
    });
  }, [checklistTemplates]);

  const renderPreEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklistTemplate,
    index,
  }) => {
    return (
      <ListItem
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(
          index,
          allChecklistTemplates[ChecklistType.PreEvent].length,
        )}
        onPress={() =>
          event.emit(eventName, {
            checklistTemplateId: checklistTemplate._id.toString(),
          } as ChecklistTemplatePickerResult)
        }
      />
    );
  };

  const renderPostEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklistTemplate,
    index,
  }) => {
    return (
      <ListItem
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(
          index,
          allChecklistTemplates[ChecklistType.PostEvent].length,
        )}
        onPress={() =>
          event.emit(eventName, {
            checklistTemplateId: checklistTemplate._id.toString(),
          } as ChecklistTemplatePickerResult)
        }
      />
    );
  };

  const renderMaintenanceChecklistTemplate: ListRenderItem<
    ChecklistTemplate
  > = ({ item: checklistTemplate, index }) => {
    return (
      <ListItem
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(
          index,
          allChecklistTemplates[ChecklistType.Maintenance].length,
        )}
        onPress={() =>
          event.emit(eventName, {
            checklistTemplateId: checklistTemplate._id.toString(),
          } as ChecklistTemplatePickerResult)
        }
      />
    );
  };

  if (!checklistTemplates.length) {
    return <EmptyView info message={'No List Templates'} />;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <FlatList
        data={allChecklistTemplates[ChecklistType.PreEvent]}
        renderItem={renderPreEventChecklistTemplate}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allChecklistTemplates[ChecklistType.PreEvent].length > 0 ? (
            <Divider text={'PRE-FLIGHT'} />
          ) : (
            <></>
          )
        }
      />
      <FlatList
        data={allChecklistTemplates[ChecklistType.PostEvent]}
        renderItem={renderPostEventChecklistTemplate}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allChecklistTemplates[ChecklistType.PostEvent].length > 0 ? (
            <Divider text={'POST-FLIGHT'} />
          ) : (
            <></>
          )
        }
      />
      <FlatList
        data={allChecklistTemplates[ChecklistType.Maintenance]}
        renderItem={renderMaintenanceChecklistTemplate}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allChecklistTemplates[ChecklistType.Maintenance].length > 0 ? (
            <Divider text={'MAINTENANCE'} />
          ) : (
            <></>
          )
        }
      />
      <Divider />
    </ScrollView>
  );
};

export default ChecklistTemplatePickerScreen;
