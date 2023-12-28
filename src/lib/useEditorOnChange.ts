import { useEffect, useRef } from 'react';

export type EditorState = {
  canSave?: boolean;
  isSaving?: boolean;
}

export const useEditorOnChange = (
  onChange: (editorState: EditorState) => void,
  canSaveCondition: boolean,
  ) => {
  const editorState = useRef<EditorState>({});

  useEffect(() => {
    if (canSaveCondition && !editorState.current?.canSave) {
      editorState.current.canSave = true;
    } else if (!canSaveCondition && editorState.current?.canSave) {
      editorState.current.canSave = false;
    }
    onChange && onChange(Object.assign({}, editorState.current));
  }, [canSaveCondition]);
};
