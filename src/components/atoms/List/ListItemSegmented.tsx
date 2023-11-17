import { AppTheme, useTheme } from "theme";
import { ExpandableSection, SegmentedControl, SegmentedControlItemProps } from "react-native-ui-lib";

import { View } from "react-native";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  initialIndex?: number;
  onChangeIndex: (index: number) => void;
  segments: SegmentedControlItemProps[];
};

const ListItemSegmented = (props: Props) => {
  const {
    expanded = false,
    ExpandableComponent,
    initialIndex = 0,
    onChangeIndex,
    segments,
    } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <>
      <_ListItem
        {...props}
        containerStyle={{...props.containerStyle, ...s.container}}
        titleStyle={s.title}
        rightImage={false}
        extraContentComponent={
          <View style={s.segmentedView} >
            <SegmentedControl
              initialIndex={initialIndex}
              onChangeIndex={onChangeIndex}
              segments={segments}
              borderRadius={8}
              outlineColor={theme.colors.subtleGray}
              backgroundColor={theme.colors.viewBackground}
              activeBackgroundColor={theme.colors.white}
              activeColor={theme.colors.text}
              inactiveColor={theme.colors.text}
              style={s.segmented}
            />
        </View>
        }
      />
      <ExpandableSection expanded={expanded}>
        {ExpandableComponent}
      </ExpandableSection>
    </>
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    minHeight: 48
  },
  segmented: {
    borderWidth: 0,
    paddingHorizontal: 1,
  },
  segmentedView: {
    position: 'absolute',
    right: 15,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  title: {
    left: -16
  }
}));

export { ListItemSegmented };
