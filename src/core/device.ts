export interface DeviceQuality {
  coarsePointer: boolean;
  lowPower: boolean;
  pixelRatioCap: number;
  shadowMapSize: number;
}

export function getDeviceQuality(): DeviceQuality {
  const coarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { deviceMemory?: number })
      : undefined;
  const memory = nav?.deviceMemory;
  const cores = nav?.hardwareConcurrency ?? 8;
  const lowPower =
    coarsePointer ||
    (typeof memory === 'number' && memory <= 4) ||
    cores <= 4;

  return {
    coarsePointer,
    lowPower,
    pixelRatioCap: lowPower ? 1.5 : 2,
    shadowMapSize: lowPower ? 512 : 1024,
  };
}
