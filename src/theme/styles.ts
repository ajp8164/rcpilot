import { type IBaseThemeSchema, IStyles } from '@react-native-hello/ui';

export const createElementsStyles = ({
  theme,
}: {
  theme: IBaseThemeSchema;
}): Partial<IStyles> => ({
  /**
   * Divider
   */

  dividerButton: {
    backgroundColor: theme.colors.transparent,
    height: 20,
    paddingHorizontal: 5,
    paddingVertical: 0,
    marginVertical: -1,
    justifyContent: 'flex-start',
  },
  dividerButtonDisabled: {
    opacity: 0.4,
    backgroundColor: theme.colors.transparent,
    height: 20,
    paddingHorizontal: 5,
    paddingVertical: 0,
    marginVertical: -1,
    justifyContent: 'flex-start',
  },

  /**
   * List Item
   */

  listItemButtonTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  listItemButtonDisabled: {
    opacity: 0.3,
  },
  swipeableListItemContainer: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  /**
   * Button
   */

  buttonAssertive: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.assertive,
    borderWidth: 2,
  },
  buttonAssertiveTitle: {
    fontSize: theme.fontSize.normal,
    fontWeight: '400',
    fontFamily: theme.fonts.regular,
    color: theme.colors.assertive,
  },
  buttonContainer: {
    marginHorizontal: 15,
  },

  /**
   * Text
   */

  textPlaceholder: {
    opacity: 0.4,
  },
  textScreenTitle: {
    color: theme.colors.black,
    fontSize: 17,
    fontFamily: theme.fonts.regular,
    fontWeight: '600',
  },

  /**
   * View
   */

  view: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewBackground,
  },
  viewAlt: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewAltBackground,
  },
  viewInv: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewInvBackground,
  },
});
