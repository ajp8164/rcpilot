import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistType } from 'types/checklist';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplates'>;

const ChecklistTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const checklistTemplates = useQuery(ChecklistTemplate);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Icon name={'plus'} style={s.headerIcon} />}
            onPress={() =>
              navigation.navigate('NewChecklistNavigator', {
                screen: 'NewChecklist',
                params: {},
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preEventModelChecklists = () => {
    return checklistTemplates.filter(t => t.type === ChecklistType.PreEvent) || [];
  };

  const postEventModelChecklists = () => {
    return checklistTemplates.filter(t => t.type === ChecklistType.PostEvent) || [];
  };

  const maintenanceModelChecklists = () => {
    return checklistTemplates.filter(t => t.type === ChecklistType.Maintenance) || [];
  };

  const deleteChecklistTemplate = (checklistTemplate: ChecklistTemplate) => {
    realm.write(() => {
      const clt = checklistTemplates.find(
        clt => clt._id.toString() === checklistTemplate._id.toString(),
      );
      clt && realm.delete(clt);
    });
  };

  const renderChecklistTemplate = (
    checklistTemplate: ChecklistTemplate,
    index: number,
    arrLength: number,
  ) => {
    return (
      <ListItem
        ref={ref =>
          ref && listEditor.add(ref, 'checklistTemplates', checklistTemplate._id.toString())
        }
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(index, arrLength)}
        onPress={() =>
          navigation.navigate('ChecklistEditor', {
            checklistTemplateId: checklistTemplate._id.toString(),
          })
        }
        editable={{
          item: {
            icon: 'remove-circle',
            color: theme.colors.assertive,
            action: 'open-swipeable',
          },
          reorder: true,
        }}
        showEditor={listEditor.show}
        swipeable={{
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () =>
                confirmAction(deleteChecklistTemplate, {
                  label: 'Delete Checklist Template',
                  title:
                    'This action cannot be undone.\nAre you sure you want to delete this checklist template?',
                  value: checklistTemplate,
                }),
            },
          ],
        }}
        onSwipeableWillOpen={() =>
          listEditor.onItemWillOpen('checklistTemplates', checklistTemplate._id.toString())
        }
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    );
  };

  const renderPreEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index,
  }) => {
    return renderChecklistTemplate(checklist, index, preEventModelChecklists().length);
  };

  const renderPostEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index,
  }) => {
    return renderChecklistTemplate(checklist, index, postEventModelChecklists().length);
  };

  const renderMaintenanceChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index,
  }) => {
    return renderChecklistTemplate(checklist, index, maintenanceModelChecklists().length);
  };

  if (!checklistTemplates.length) {
    return (
      <EmptyView
        info
        message={'No List Templates'}
        details={'Tap the + button to add your first list template.'}
      />
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      {preEventModelChecklists().length > 0 && (
        <>
          <Divider text={'PRE-EVENT LIST TEMPLATES'} />
          <FlatList
            data={preEventModelChecklists()}
            renderItem={renderPreEventChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      )}
      {postEventModelChecklists().length > 0 && (
        <>
          <Divider text={'POST EVENT LIST TEMPLATES'} />
          <FlatList
            data={postEventModelChecklists()}
            renderItem={renderPostEventChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      )}
      {maintenanceModelChecklists().length > 0 && (
        <>
          <Divider text={'MAINTENANCE LIST TEMPLATES'} />
          <FlatList
            data={maintenanceModelChecklists()}
            renderItem={renderMaintenanceChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      )}
      <Divider />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default ChecklistTemplatesScreen;
