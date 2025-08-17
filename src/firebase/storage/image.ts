import { getApp } from '@react-native-firebase/app';
import { getStorage } from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';
import { uuidv4 } from 'lib/utils';

export type Image = {
  mimeType: string;
  uri: string;
};

/**
 * Save a previously obtained image asset to storage. This function deletes the specified old
 * image if it specified.
 * @param args.image - the image description
 * @param args.storagePath - path in storage where the image will be stored
 * @param args.oldImage - (optional) if it exists, this image will be deleted from storage
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */
export const uploadImage = async (args: {
  image: Image;
  storagePath: string;
  oldImage?: string;
  onSuccess: (url: string) => void;
  onError: () => void;
}) => {
  const { image, storagePath, oldImage, onSuccess, onError } = args;
  const app = getApp();
  const storage = getStorage(app);

  try {
    const imageType = image.mimeType.split('/')[1];
    const destFilename = `${storagePath}${uuidv4()}.${imageType}`;
    const sourceFilename = image.uri.replace('file://', '');
    const storageRef = storage.ref(destFilename);

    try {
      await storageRef.putFile(sourceFilename).catch(() => {
        // Need a handler here to swallow possible second throw inside putFile().
      });
      const url = await storageRef.getDownloadURL();
      oldImage && (await deleteImage({ filename: oldImage, storagePath }));
      onSuccess(url);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      onError();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    log.error(`Image save failed: ${e.message}`);
    onError();
  }
};

/**
 * Delete an image from storage.
 * @param args.filename - the file to delete
 * @param args.storagePath - path in storage where the image is stored
 * @param args.onSuccess - callback when complete
 * @param args.onError - callback when an error occurs
 */
export const deleteImage = async (args: {
  filename: string;
  storagePath: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const app = getApp();
  const storage = getStorage(app);

  const { filename, onError, onSuccess, storagePath } = args;
  const filenameRef = `${storagePath}${
    filename.replace(/%2F/g, '/').split('/').pop()?.split('#')[0].split('?')[0]
  }`;
  await storage
    .ref(filenameRef)
    .delete()
    .then(() => onSuccess && onSuccess())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((e: any) => {
      if (!e.message.includes('storage/object-not-found')) {
        log.error(`Failed to delete image: ${e.message}`);
      }
      onError && onError();
    });
};
