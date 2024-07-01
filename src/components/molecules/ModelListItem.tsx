import { Image, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb';
import { modelMaintenanceIsDue, modelSummary, modelTypeIcons } from 'lib/model';
import { SvgXml } from 'react-native-svg';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useRealm } from '@realm/react';

interface ModelListItemInterface {
  array: Model[];
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listEditor: any; // TODO Not typed
  model: Model;
  onPress: () => void;
  onPressInfo: () => void;
  showInfo: boolean;
}

export const ModelListItem = ({
  array,
  index,
  listEditor,
  model,
  onPress,
  onPressInfo,
  showInfo,
}: ModelListItemInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const maintenanceIsDue = modelMaintenanceIsDue(model);

  const deleteModel = (model: Model) => {
    realm.write(() => {
      realm.delete(model);
    });
  };

  return (
    <ListItem
      ref={ref => ref && listEditor.add(ref, 'models', model._id.toString())}
      key={model._id.toString()}
      title={model.name}
      subtitle={modelSummary(model)}
      titleStyle={s.modelText}
      subtitleStyle={s.modelText}
      subtitleNumberOfLines={2}
      bottomDividerLeft={s.modelImage.width + 15}
      position={listItemPosition(index, array.length)}
      leftImage={
        <View style={s.modelIconContainer}>
          {model.image ? (
            <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImage} />
          ) : (
            <View style={s.modelSvgContainer}>
              <SvgXml
                xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
                width={s.modelImage.width}
                height={s.modelImage.height}
                color={theme.colors.brandSecondary}
                style={s.modelIcon}
              />
            </View>
          )}
          {(model.damaged || maintenanceIsDue) && (
            <View style={s.modelStatusContainer}>
              {model.damaged && (
                <Icon
                  name={'bandage'}
                  size={12}
                  color={theme.colors.stickyWhite}
                  style={s.modelStatusIcon}
                />
              )}
              {maintenanceIsDue && (
                <Icon
                  name={'wrench'}
                  size={10}
                  color={theme.colors.stickyWhite}
                  style={s.modelStatusIcon}
                />
              )}
            </View>
          )}
        </View>
      }
      onPress={onPress}
      showInfo={showInfo}
      onPressInfo={onPressInfo}
      zeroEdgeContent={true}
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
            onPress: () => {
              const label =
                // listModels === 'retired' ? `Delete Retired ${model.type}` : `Delete ${model.type}`;
                `Delete ${model.type}`;
              confirmAction(deleteModel, {
                label,
                title: `This action cannot be undone.\nAre you sure you want to delete this ${model.type.toLocaleLowerCase()}?`,
                value: model,
              });
            },
          },
        ],
      }}
      onSwipeableWillOpen={() => listEditor.onItemWillOpen('models', model._id.toString())}
      onSwipeableWillClose={listEditor.onItemWillClose}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
    overflow: 'hidden',
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelStatusContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 16,
    paddingTop: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.blackTransparentLight,
  },
  modelStatusIcon: {
    paddingHorizontal: 10,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelText: {
    left: 140,
    maxWidth: '48%',
  },
}));
