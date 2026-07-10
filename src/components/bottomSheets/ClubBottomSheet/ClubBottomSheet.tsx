import React, { useImperativeHandle, useRef, useState } from 'react';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import IconCloseX from 'components/atoms/IconCloseX';
import { ModalHeader } from 'components/atoms/ModalHeader';
import { ClubView } from 'components/views/ClubView';
import { useRealm } from '@realm/react';
import { BSON } from 'realm';
import { Club } from 'realmdb';

import { ClubBottomSheetMethods, ClubBottomSheetProps } from './types';

type ClubBottomSheet = ClubBottomSheetMethods;

const ClubBottomSheet = React.forwardRef<
  ClubBottomSheet,
  ClubBottomSheetProps
>((props, ref) => {
  const { onDismiss } = props;

  const theme = useTheme();
  const s = useStyles();
  const realm = useRealm();

  const innerRef = useRef<BottomSheet>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>();
  const dismissing = useRef(false);

  useImperativeHandle(ref, () => ({
    dismiss,
    present,
  }));

  const dismiss = () => {
    if (dismissing.current) return;
    dismissing.current = true;
    innerRef.current?.close();
    onDismiss?.();

    // Reset state for next presentation.
    setClubId(null);
    setClubName(undefined);
  };

  const present = (id: string) => {
    const club = realm.objectForPrimaryKey(
      'Club',
      new BSON.ObjectId(id),
    ) as Club;

    dismissing.current = false;
    setClubId(id);
    setClubName(club?.name);
    innerRef.current?.snapToIndex(0);
  };

  return (
    <BottomSheet
      ref={innerRef}
      index={-1}
      snapPoints={['40%', '92%']}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      onClose={() => dismiss()}
      backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}
      handleIndicatorStyle={s.handleIndicator}>
      <ModalHeader
        size={'small'}
        title={clubName}
        titleStyle={s.title}
        rightButtonIcon={<IconCloseX />}
        onRightButtonPress={() => dismiss()}
      />
      <BottomSheetScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}>
        {clubId ? <ClubView clubId={clubId} hideName /> : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export { ClubBottomSheet };

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    paddingHorizontal: 15,
    marginTop: -15,
  },
  handleIndicator: {
    backgroundColor: theme.colors.lightGray,
  },
  title: {
    alignSelf: 'flex-start',
  },
}));
