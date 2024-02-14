import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import {ChecklistTemplate} from 'realmdb/ChecklistTemplate';
import { ChecklistTemplateType } from 'types/checklistTemplate';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelChecklists'>;

const ModelChecklistsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const checklistTemplates = useQuery(ChecklistTemplate);

  const [allModelChecklists, setAllModelChecklists] = useState<{[key in ChecklistTemplateType]: ChecklistTemplate[]}>({
    [ChecklistTemplateType.PreEvent]: [],
    [ChecklistTemplateType.PostEvent]: [],
    [ChecklistTemplateType.Maintenance]: [],
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            // onPress={() => navigation.navigate('NewChecklistTemplateNavigator', {
            //   screen: 'NewChecklistTemplate',
            // })}
          />
        )
      },
    });
  }, []);

  useEffect(() => {
    const pre = checklistTemplates.filter(t => t.type === ChecklistTemplateType.PreEvent);
    const post = checklistTemplates.filter(t => t.type === ChecklistTemplateType.PostEvent);
    const maint = checklistTemplates.filter(t => t.type === ChecklistTemplateType.Maintenance);
    setAllModelChecklists({
      [ChecklistTemplateType.PreEvent]: pre,
      [ChecklistTemplateType.PostEvent]: post,
      [ChecklistTemplateType.Maintenance]: maint,
    });
  }, [checklistTemplates]);

  const renderPreEventModelChecklists: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={listItemPosition(index, allModelChecklists[ChecklistTemplateType.PreEvent].length)}
        // onPress={() => navigation.navigate('ChecklistTemplateEditor', {
        //   checklistTemplateId: item._id.toString(),
        // })}
      />
    )
  };

  const renderPostEventModelChecklists: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={listItemPosition(index, allModelChecklists[ChecklistTemplateType.PostEvent].length)}
        // onPress={() => navigation.navigate('ChecklistTemplateEditor', {
        //   checklistTemplateId: item._id.toString(),
        // })}
      />
    )
  };

  const renderMaintenanceModelChecklists: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={listItemPosition(index, allModelChecklists[ChecklistTemplateType.Maintenance].length)}
        // onPress={() => navigation.navigate('ChecklistTemplateEditor', {
        //   checklistTemplateId: item._id.toString(),
        // })}
      />
    )
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
        {allModelChecklists[ChecklistTemplateType.PreEvent].length > 0 &&
        <>
          <Divider text={'PRE-FLIGHT'}/>
          <FlatList
            data={allModelChecklists[ChecklistTemplateType.PreEvent]}
            renderItem={renderPreEventModelChecklists}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {allModelChecklists[ChecklistTemplateType.PostEvent].length > 0 &&
        <>
          <Divider text={'POST-FLIGHT'}/>
          <FlatList
            data={allModelChecklists[ChecklistTemplateType.PostEvent]}
            renderItem={renderPostEventModelChecklists}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {allModelChecklists[ChecklistTemplateType.Maintenance].length > 0 &&
        <>
          <Divider text={'MAINTENANCE'}/>
          <FlatList
            data={allModelChecklists[ChecklistTemplateType.Maintenance]}
            renderItem={renderMaintenanceModelChecklists}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        <Divider />
      </ScrollView>
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

export default ModelChecklistsScreen;
