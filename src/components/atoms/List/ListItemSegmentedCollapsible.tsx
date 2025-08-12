import { CollapsibleView, ListItemSegmented } from '@react-native-hello/ui';
import React, { useImperativeHandle, useState } from 'react';

export interface ListItemSegmentedCollapsible extends ListItemSegmented {
  children?: React.ReactElement;
  initExpanded?: boolean;
}

export interface ListItemSegmentedCollapsibleMethods {
  close: () => void;
  isOpen: () => boolean;
  open: () => void;
  toggle: () => void;
}

const ListItemSegmentedCollapsible = React.forwardRef<
  ListItemSegmentedCollapsibleMethods,
  ListItemSegmentedCollapsible
>((props: ListItemSegmentedCollapsible, ref) => {
  const { initExpanded = false, children, ...rest } = props;

  const [expanded, setExpanded] = useState(initExpanded);

  const first = rest.position?.includes('first') ? 'first' : undefined;

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    close,
    isOpen,
    open,
    toggle,
  }));

  const close = () => {
    setExpanded(false);
  };

  const open = () => {
    setExpanded(true);
  };

  const toggle = () => {
    setExpanded(!expanded);
  };

  const isOpen = () => {
    return expanded;
  };
  return (
    <>
      <ListItemSegmented
        {...rest}
        position={expanded ? [first] : rest.position}
      />
      <CollapsibleView expanded={expanded}>{children}</CollapsibleView>
    </>
  );
});

export { ListItemSegmentedCollapsible };
