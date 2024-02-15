import { ActionSheetConfirm, ActionSheetConfirmMethods } from 'components/molecules/ActionSheetConfirm';
import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistType } from 'types/checklist';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplates'>;

const ChecklistTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const realm = useRealm();

  const checklistTemplates = useQuery(ChecklistTemplate);

  const actionSheetConfirm = useRef<ActionSheetConfirmMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={() => navigation.navigate('NewChecklistTemplateNavigator', {
              screen: 'NewChecklistTemplate',
            })}
          />
        )
      },
    });
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
      const clt = checklistTemplates.find(clt => clt._id.toString() === checklistTemplate._id.toString());
      clt && realm.delete(clt);
    });
  };

  const renderChecklistTemplate = (checklistTemplate: ChecklistTemplate, index: number, arrLength: number) => {
    return (
      <ListItem
        ref={ref => listEditor.add(ref, 'checklistTemplates', index)}
        key={checklistTemplate._id.toString()}
        title={checklistTemplate.name}
        subtitle={`Contains ${checklistTemplate.actions.length} actions`}
        position={listItemPosition(index, arrLength)}
        onPress={() => navigation.navigate('ChecklistEditor', {
          checklistTemplateId: checklistTemplate._id.toString(),
        })}
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
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => actionSheetConfirm.current?.confirm(checklistTemplate),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('checklistTemplates', index)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  const renderPreEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index
  }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      preEventModelChecklists().length
    );
  };

  const renderPostEventChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index
  }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      postEventModelChecklists().length
    );
  };

  const renderMaintenanceChecklistTemplate: ListRenderItem<ChecklistTemplate> = ({
    item: checklist,
    index
  }) => {
    return renderChecklistTemplate(
      checklist,
      index,
      maintenanceModelChecklists().length
    );
  };

  if (!checklistTemplates.length) {
    return (<EmptyView info message={'No List Templates'} details={"Tap the + button to add your first list template."} />);
  }

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        {preEventModelChecklists().length > 0 &&
        <>
          <Divider text={'PRE-EVENT LIST TEMPLATES'}/>
          <FlatList
            data={preEventModelChecklists()}
            renderItem={renderPreEventChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {postEventModelChecklists().length > 0 &&
        <>
          <Divider text={'POST EVENT LIST TEMPLATES'}/>
          <FlatList
            data={postEventModelChecklists()}
            renderItem={renderPostEventChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {maintenanceModelChecklists().length > 0 &&
        <>
          <Divider text={'MAINTENANCE LIST TEMPLATES'}/>
          <FlatList
            data={maintenanceModelChecklists()}
            renderItem={renderMaintenanceChecklistTemplate}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        <Divider />
      </ScrollView>
      <ActionSheetConfirm
        ref={actionSheetConfirm}
        label={'Delete Checklist Template'}
        onConfirm={deleteChecklistTemplate}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default ChecklistTemplatesScreen;
