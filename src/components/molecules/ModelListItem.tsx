import React from 'react';
import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch } from 'react-redux';

import {
  ListEditorMethods,
  ListItemSwipeable,
  ThemeManager,
  getColoredSvg,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useRealm } from '@realm/react';
import {
  modelMaintenanceIsDue,
  modelSummary,
  modelTypeIconProps,
} from 'lib/model';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Bandage, CircleMinus, Trash2, Wrench } from 'lucide-react-native';
import { BSON } from 'realm';
import { Model } from 'realmdb';
import { deleteModelPreferences } from 'store/slices/appSettings';

interface ModelListItem {
  array: Model[];
  index: number;
  listEditor?: ListEditorMethods | null;
  model: Model;
  onPress: () => void;
  onPressInfo: () => void;
  showInfo: boolean;
}

export const ModelListItem = React.memo(
  ({
    array,
    index,
    listEditor,
    model,
    onPress,
    onPressInfo,
    showInfo,
  }: ModelListItem) => {
    const theme = useTheme();
    const s = useStyles();
    const confirmAction = useConfirmAction();
    const realm = useRealm();
    const dispatch = useDispatch();

    const maintenanceIsDue = modelMaintenanceIsDue(model);

    const deleteModel = (modelId: string) => {
      const model = realm.objectForPrimaryKey(
        'Model',
        new BSON.ObjectId(modelId),
      );
      if (model?.isValid()) {
        // Cleanup model preferences.
        dispatch(deleteModelPreferences({ modelId }));

        realm.write(() => {
          realm.delete(model);
        });
      }
    };

    return (
      <ListItemSwipeable
        key={model._id.toString()}
        title={model.name}
        subtitle={modelSummary(model)}
        subtitleLines={0}
        bottomDividerLeft={s.modelImage.width + 15}
        position={listItemPosition(index, array.length)}
        listEditor={listEditor}
        onPress={onPress}
        leftContentStyle={{ paddingLeft: 0 }}
        leftContent={
          <View>
            {model.image ? (
              <Image
                source={{ uri: model.image }}
                resizeMode={'cover'}
                style={s.modelImage}
              />
            ) : (
              <View style={s.modelSvgContainer}>
                <SvgXml
                  xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
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
                  <Bandage
                    color={theme.colors.stickyWhite}
                    size={12}
                    style={s.modelStatusIcon}
                  />
                )}
                {!maintenanceIsDue && (
                  <Wrench
                    color={theme.colors.stickyWhite}
                    size={12}
                    style={s.modelStatusIcon}
                  />
                )}
              </View>
            )}
          </View>
        }
        onPressRight={onPressInfo}
        rightContent={showInfo ? 'info' : 'chevron-right'}
        showEditor={listEditor?.getState().show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditor?.reset();
              return confirmAction({
                label: `Delete ${model.type}`,
                title: `This action cannot be undone.\nAre you sure you want to delete this ${model.type.toLocaleLowerCase()}?`,
              });
            },
            onPress: () => {
              const modelId = model._id.toString();
              requestAnimationFrame(() => {
                deleteModel(modelId);
              });
            },
          },
        ]}
      />
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: 100,
    height: 80,
  },
  modelStatusContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.blackTransparentLight,
  },
  modelStatusIcon: {
    paddingHorizontal: 10,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelText: {
    left: 120,
  },
}));
