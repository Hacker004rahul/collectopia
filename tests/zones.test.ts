import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/config/levels';
import { getZoneTheme, ZONE_ORDER, ZONES } from '../src/config/zones';

describe('environment zones', () => {
  it('defines every zone theme exactly once', () => {
    expect(ZONE_ORDER).toHaveLength(7);
    expect(new Set(ZONE_ORDER).size).toBe(7);

    for (const id of ZONE_ORDER) {
      const zone = ZONES[id];
      expect(zone.id).toBe(id);
      expect(zone.name.length).toBeGreaterThan(0);
      expect(getZoneTheme(id)).toBe(zone);
    }
  });

  it('keeps atmosphere values inside usable ranges', () => {
    for (const id of ZONE_ORDER) {
      const { sky, light, dressing } = ZONES[id];
      for (const color of [
        sky.top,
        sky.bottom,
        sky.background,
        sky.fog,
        sky.sunGlow,
        light.hemisphereSky,
        light.hemisphereGround,
        light.sunColor,
      ]) {
        expect(color).toBeGreaterThanOrEqual(0);
        expect(color).toBeLessThanOrEqual(0xffffff);
      }
      expect(sky.fogNear).toBeGreaterThan(0);
      expect(sky.fogFar).toBeGreaterThan(sky.fogNear);
      expect(light.hemisphereIntensity).toBeGreaterThan(0);
      expect(light.sunIntensity).toBeGreaterThan(0);
      expect(dressing.shopChance).toBeGreaterThanOrEqual(0);
      expect(dressing.shopChance).toBeLessThanOrEqual(1);
      expect(dressing.treeCount[0]).toBeLessThanOrEqual(dressing.treeCount[1]);
      expect(dressing.vehicleCount[0]).toBeLessThanOrEqual(
        dressing.vehicleCount[1],
      );
      expect(dressing.stallCount[0]).toBeLessThanOrEqual(
        dressing.stallCount[1],
      );
    }
  });

  it('maps the ten levels across all seven zone themes', () => {
    expect(LEVELS).toHaveLength(10);
    expect(new Set(LEVELS.map((level) => level.zoneId)).size).toBe(7);
    expect(LEVELS.slice(0, 7).map((level) => level.zoneId)).toEqual([
      ...ZONE_ORDER,
    ]);

    for (const level of LEVELS) {
      expect(ZONES[level.zoneId]).toBeDefined();
      expect(level.zone.length).toBeGreaterThan(0);
    }
  });
});
