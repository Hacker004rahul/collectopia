export type SpawnOwner = 'gate' | 'obstacle' | 'enemy' | 'powerup';

export interface SpawnReservationRequest {
  owner: SpawnOwner;
  /** Track distance of the reserved object's centre (m). */
  distance: number;
  /** Half-length of the reserved corridor (m). */
  halfLength: number;
  /** Lane indices this reservation blocks. */
  lanes: readonly number[];
  /** Extra clearance around the reservation (m). */
  pad?: number;
}

interface Reservation {
  owner: SpawnOwner;
  start: number;
  end: number;
  lanes: Set<number>;
}

/**
 * Lightweight shared reservation table used to keep gates, obstacles,
 * enemies and power-ups from creating unfair overlapping encounters.
 * It only stores a handful of values and is pruned continuously.
 */
export class SpawnReservations {
  private readonly reservations: Reservation[] = [];

  isClear(
    distance: number,
    halfLength: number,
    lanes: readonly number[],
    pad = 0,
  ): boolean {
    const start = distance - halfLength - pad;
    const end = distance + halfLength + pad;
    const laneSet = new Set(lanes);

    for (const reservation of this.reservations) {
      if (end < reservation.start || start > reservation.end) continue;
      for (const lane of laneSet) {
        if (reservation.lanes.has(lane)) return false;
      }
    }
    return true;
  }

  reserve(request: SpawnReservationRequest): boolean {
    const pad = request.pad ?? 0;
    if (!this.isClear(request.distance, request.halfLength, request.lanes, pad)) {
      return false;
    }

    this.reservations.push({
      owner: request.owner,
      start: request.distance - request.halfLength - pad,
      end: request.distance + request.halfLength + pad,
      lanes: new Set(request.lanes),
    });
    return true;
  }

  prune(playerDistance: number): void {
    const cutoff = playerDistance - 40;
    for (let index = this.reservations.length - 1; index >= 0; index -= 1) {
      if (this.reservations[index].end < cutoff) {
        this.reservations.splice(index, 1);
      }
    }
  }

  clear(): void {
    this.reservations.length = 0;
  }

  get size(): number {
    return this.reservations.length;
  }

  getSnapshot(): ReadonlyArray<
    Readonly<{ owner: SpawnOwner; start: number; end: number; lanes: number[] }>
  > {
    return this.reservations.map((reservation) => ({
      owner: reservation.owner,
      start: reservation.start,
      end: reservation.end,
      lanes: [...reservation.lanes],
    }));
  }
}
