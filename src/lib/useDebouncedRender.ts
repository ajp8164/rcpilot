import lodash from 'lodash';
import { useState } from 'react';

// Used to force a component re-render no more than once after being called before `wait` ms.
// This hook is useful for text input typing so that the parent component does not re-render
// on every key stroke. Is this case is will re-render at most every `wait` ms.
// Example, use the callback to set a useRef() value, the forced render immediately following
// updates the component with the ner ref value.
export const useDebouncedRender = (wait?: number, maxWait?: number) => {
  const [render, setRender] = useState(false);
  const callbackRenderer = (callback?: () => void) => {
    callback && callback();
    setRender(!render);
  };
  return lodash.debounce(callbackRenderer, wait || 250, {
    maxWait: maxWait || 1000,
  });
};
