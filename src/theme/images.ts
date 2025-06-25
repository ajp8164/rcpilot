import { Image, ImageSourcePropType } from 'react-native';

const blade = require('theme/img/vendors/blade.png');
const goblinHelicopter = require('theme/img/vendors/goblin-helicopter.png');
const horizonHobby = require('theme/img/vendors/horizon-hobby.png');
const sab = require('theme/img/vendors/sab.png');

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
