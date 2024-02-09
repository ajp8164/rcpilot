import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import {ChecklistTemplate} from 'realmdb/ChecklistTemplate';
import { ChecklistTemplateType } from 'types/checklistTemplate';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplates'>;

const ChecklistTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const checklistTemplates = useQuery(ChecklistTemplate);

  const [allChecklistTemplates, setAllChecklistTemplates] = useState<{[key in ChecklistTemplateType]: ChecklistTemplate[]}>({
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
            onPress={() => navigation.navigate('NewChecklistTemplateNavigator')}
          />
        )
      },
    });
  }, []);

  useEffect(() => {
    const pre = checklistTemplates.filter(t => t.type === ChecklistTemplateType.PreEvent);
    const post = checklistTemplates.filter(t => t.type === ChecklistTemplateType.PostEvent);
    const maint = checklistTemplates.filter(t => t.type === ChecklistTemplateType.Maintenance);
    setAllChecklistTemplates({
      [ChecklistTemplateType.PreEvent]: pre,
      [ChecklistTemplateType.PostEvent]: post,
      [ChecklistTemplateType.Maintenance]: maint,
    });
  }, [checklistTemplates]);

  const renderPreEventChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.PreEvent].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.PreEvent].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: item._id.toString(),
        })}
      />
    )
  };

  const renderPostEventChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.PostEvent].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.PostEvent].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: item._id.toString(),
        })}
      />
    )
  };

  const renderMaintenanceChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        subtitle={`Contains ${item.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.Maintenance].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.Maintenance].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: item._id.toString(),
        })}
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
        {allChecklistTemplates[ChecklistTemplateType.PreEvent].length > 0 &&
        <>
          <Divider text={'PRE-EVENT LIST TEMPLATES'}/>
          <FlatList
            data={allChecklistTemplates[ChecklistTemplateType.PreEvent]}
            renderItem={renderPreEventChecklistTemplates}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {allChecklistTemplates[ChecklistTemplateType.PostEvent].length > 0 &&
        <>
          <Divider text={'POST EVENT LIST TEMPLATES'}/>
          <FlatList
            data={allChecklistTemplates[ChecklistTemplateType.PostEvent]}
            renderItem={renderPostEventChecklistTemplates}
            keyExtractor={(_item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>}
        {allChecklistTemplates[ChecklistTemplateType.Maintenance].length > 0 &&
        <>
          <Divider text={'MAINTENANCE LIST TEMPLATES'}/>
          <FlatList
            data={allChecklistTemplates[ChecklistTemplateType.Maintenance]}
            renderItem={renderMaintenanceChecklistTemplates}
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

export default ChecklistTemplatesScreen;
