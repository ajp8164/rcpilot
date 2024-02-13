import React, { useImperativeHandle, useState } from 'react';

import { ActionSheet } from 'react-native-ui-lib';

interface ActionSheetConfirmInterface {
  label: string;
  onConfirm: (value: any) => void;
}

export interface ActionSheetConfirmMethods {
  confirm: (value: any) => void;
}

export const ActionSheetConfirm = React.forwardRef<
  ActionSheetConfirmMethods,
  ActionSheetConfirmInterface
>((props, ref) => {
  const {
    label,
    onConfirm,
  } = props;

  const [confirmValueActionSheetVisible, setConfirmValueActionSheetVisible] = useState<any>();
  
  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    confirm,
  }));

  const confirm = (value: any) => {
    setConfirmValueActionSheetVisible(value);
  };

  return (
    <ActionSheet
      cancelButtonIndex={1}
      destructiveButtonIndex={0}
      options={[
        {
          label,
          onPress: () => {
            onConfirm(confirmValueActionSheetVisible!);
            setConfirmValueActionSheetVisible(undefined);
          },
        },
        {
          label: 'Cancel' ,
          onPress: () => setConfirmValueActionSheetVisible(undefined),
        },
      ]}
      useNativeIOS={true}
      visible={!!confirmValueActionSheetVisible}
    />
  );
});
