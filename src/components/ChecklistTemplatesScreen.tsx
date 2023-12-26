import { AppTheme, useTheme } from 'theme';
import { ChecklistTemplate, ChecklistTemplateType } from 'types/checklistTemplate';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplates'>;

const ChecklistTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [checklistTemplates, _setChecklistTemplates] = useState<ChecklistTemplate[]>([
    {
      id: '1',
      name: 'PreFlight 1',
      type: ChecklistTemplateType.PreEvent,
      actions: [],
    },
    {
      id: '2',
      name: 'PreFlight 2',
      type: ChecklistTemplateType.PreEvent,
      actions: [],
    },
    {
      id: '3',
      name: 'Post-Flight 1',
      type: ChecklistTemplateType.PostEvent,
      actions: [],
    },
    {
      id: '4',
      name: 'Oil tail',
      type: ChecklistTemplateType.Maintenance,
      actions: [],
    },
  ]);

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
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
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

  const renderPreEventChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item: template, index }) => {
    return (
      <ListItem
        key={template.id}
        title={template.name}
        subtitle={`Contains ${template.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.PreEvent].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.PreEvent].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: template.id,
        })}
      />
    )
  };

  const renderPostEventChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item: template, index }) => {
    return (
      <ListItem
        key={template.id}
        title={template.name}
        subtitle={`Contains ${template.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.PostEvent].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.PostEvent].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: template.id,
        })}
      />
    )
  };

  const renderMaintenanceChecklistTemplates: ListRenderItem<ChecklistTemplate> = ({ item: template, index }) => {
    return (
      <ListItem
        key={template.id}
        title={template.name}
        subtitle={`Contains ${template.actions.length} actions`}
        position={allChecklistTemplates[ChecklistTemplateType.Maintenance].length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allChecklistTemplates[ChecklistTemplateType.Maintenance].length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistTemplateEditor', {
          checklistTemplateId: template.id,
        })}
      />
    )
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'PRE-EVENT LIST TEMPLATES'}/>
        <FlatList
          data={allChecklistTemplates[ChecklistTemplateType.PreEvent]}
          renderItem={renderPreEventChecklistTemplates}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
        />
        <Divider text={'POST EVENT LIST TEMPLATES'}/>
        <FlatList
          data={allChecklistTemplates[ChecklistTemplateType.PostEvent]}
          renderItem={renderPostEventChecklistTemplates}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
        />
        <Divider text={'MAINTENANCE LIST TEMPLATES'}/>
        <FlatList
          data={allChecklistTemplates[ChecklistTemplateType.Maintenance]}
          renderItem={renderMaintenanceChecklistTemplates}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
        />
        <Divider />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  addIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
}));

export default ChecklistTemplatesScreen;
