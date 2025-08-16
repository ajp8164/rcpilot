import blade from './img/vendors/blade.png';
import goblinHelicopter from './img/vendors/goblin-helicopter.png';
import horizonHobby from './img/vendors/horizon-hobby.png';
import sab from './img/vendors/sab.png';
import { Image, ImageSourcePropType } from 'react-native';

export type VendorImage = {
  src: ImageSourcePropType;
  size: { width: number; height: number };
};

const vendorImageMap: Record<string, VendorImage> = {
  blade: { src: blade, size: Image.resolveAssetSource(blade) },
  goblin: {
    src: goblinHelicopter,
    size: Image.resolveAssetSource(goblinHelicopter),
  },
  goblinhelicopter: {
    src: goblinHelicopter,
    size: Image.resolveAssetSource(goblinHelicopter),
  },
  horizon: { src: horizonHobby, size: Image.resolveAssetSource(horizonHobby) },
  horizonhobby: {
    src: horizonHobby,
    size: Image.resolveAssetSource(horizonHobby),
  },
  sab: { src: sab, size: Image.resolveAssetSource(sab) },
};

export const getVendorImage = (vendor?: string) => {
  const index = vendor?.toLowerCase().replaceAll(' ', '');
  return index ? vendorImageMap[index] : undefined;
};
