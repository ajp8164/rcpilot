import { log } from '@react-native-ajp-elements/core';
import storage from '@react-native-firebase/storage';

export type File = {
  name: string;
  size: number;
  date: string;
  url: string;
};

export type Directory = {
  files: File[];
  allocated: number;
};

/**
 * Get a directory listing of files.
 * @param args.storagePath - path in storage where files are located
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */
export const listFiles = async (args: {
  storagePath: string;
  onSuccess: (dir: Directory) => void;
  onError?: () => void;
}) => {
  const { storagePath, onSuccess, onError } = args;
  try {
    const storageRef = storage().ref(storagePath);

    try {
      let allocated = 0;
      await storageRef.list().then(result => {
        (async () => {
          const files = await Promise.all(
            result.items.map(async item => {
              const url = await item.getDownloadURL();
              const metadata = await item.getMetadata();
              const size = metadata.size;
              const date = metadata.timeCreated;
              allocated += size;
              return {
                name: item.name,
                size,
                date,
                url,
              } as File;
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ).catch((e: any) => {
            log.error(`Directory list failed: ${e.message}`);
            onError && onError();
          });
          onSuccess({ allocated, files: files || [] });
        })();
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      log.error(`Directory list failed: ${e.message}`);
      onError && onError();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    log.error(`Directory list failed: ${e.message}`);
    onError && onError();
  }
};
