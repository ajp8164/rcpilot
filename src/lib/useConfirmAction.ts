import { useActionSheet } from "@expo/react-native-action-sheet";

export const useConfirmAction = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  return (label: string, value: any, onConfirm: (value: any) => void) => {
    showActionSheetWithOptions(
      {
        options: [label, 'Cancel'],
        destructiveButtonIndex: [0],
        cancelButtonIndex: 1,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            onConfirm(value);
            break;
          default:
            break;
        }
      },
    );
  };
};
