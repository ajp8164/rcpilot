import React, { useEffect, useRef } from 'react';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistType } from 'types/checklist';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ChecklistTemplates'
>;

const ChecklistTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const checklistTemplates = useQuery(ChecklistTemplate);

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={33} />
            }
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
    return (
      checklistTemplates.filter(t => t.type === ChecklistType.PreEvent) || []
    );
  };

  const postEventModelChecklists = () => {
    return (
      checklistTemplates.filter(t => t.type === ChecklistType.PostEvent) || []
    );
  };

  const maintenanceModelChecklists = () => {
    return (
      checklistTemplates.filter(t => t.type === ChecklistType.Maintenance) || []
    );
  };

  const deleteChecklistTemplate = (checklistTemplateId: string) => {
    const checklistTemplate = realm.objectForPrimaryKey(
      ChecklistTemplate,
      new BSON.ObjectId(checklistTemplateId),
    );
    if (checklistTemplate?.isValid()) {
      realm.write(() => {
        realm.delete(checklistTemplate);
        // const clt = checklistTemplates.find(
        //   clt => clt._id.toString() === checklistTemplate._id.toString(),
        // );
        // clt && realm.delete(clt);
      });
    }
  };

  const renderChecklistTemplate = (
    checklistTemplate: ChecklistTemplate,
    index: number,
    arrLength: number,
  ) => {
    return (
      <ListItemSwipeable
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(index, arrLength)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('ChecklistEditor', {
            checklistTemplateId: checklistTemplate._id.toString(),
          })
        }
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Checklist Template',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this checklist template?',
              });
            },
            onPress: () =>
              deleteChecklistTemplate(checklistTemplate._id.toString()),
          },
        ]}
      />
    );
  };

  const renderPreEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index,
  }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      preEventModelChecklists().length,
    );
  };

  const renderPostEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index,
  }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      postEventModelChecklists().length,
    );
  };

  const renderMaintenanceChecklistTemplate: ListRenderItem<
    ChecklistTemplate
  > = ({ item: checklist, index }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      maintenanceModelChecklists().length,
    );
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
    <ListEditor ref={listEditorRef}>
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
              keyExtractor={item => item._id.toString()}
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
              keyExtractor={item => item._id.toString()}
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
              keyExtractor={item => item._id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </>
        )}
        <Divider />
      </ScrollView>
    </ListEditor>
  );
};

export default ChecklistTemplatesScreen;
