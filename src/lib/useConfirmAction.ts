import { useActionSheet } from '@expo/react-native-action-sheet';

export const useConfirmAction = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConfirm: (value: any) => void,
    opts: {
      label: string;
      title?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    },
  ) => {
    showActionSheetWithOptions(
      {
        options: [opts.label, 'Cancel'],
        destructiveButtonIndex: [0],
        cancelButtonIndex: 1,
        title: opts.title,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            onConfirm(opts.value);
            break;
          default:
            break;
        }
      },
    );
  };
};
