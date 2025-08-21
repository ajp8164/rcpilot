import { getApp } from '@react-native-firebase/app';
import {
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
} from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';

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
  const app = getApp();
  const storage = getStorage(app);

  try {
    const storageRef = ref(storage, storagePath);

    try {
      const result = await listAll(storageRef);
      let allocated = 0;

      const files: (File | null)[] = await Promise.all(
        result.items.map(async itemRef => {
          try {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            allocated += metadata.size ?? 0;
            return {
              name: itemRef.name,
              size: metadata.size ?? 0,
              date: metadata.timeCreated ?? '',
              url,
            } as File;
          } catch (e: unknown) {
            if (e instanceof Error) {
              log.error(
                `Failed to get file info for ${itemRef.name}: ${e.message}`,
              );
            }
            onError?.();
            return null;
          }
        }),
      );

      onSuccess({
        allocated,
        files: files.filter((f): f is File => f !== null),
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        log.error(`Directory list failed: ${e.message}`);
      }
      onError?.();
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(`Directory list failed: ${e.message}`);
    }
    onError?.();
  }
};
