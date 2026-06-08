import { describe, it, expect } from 'vitest';
import { canTransition, CANCELLATION_GRACE_HOURS } from '../order.state-machine';
import type { OrderActor } from '../order.state-machine';

const ADMIN: OrderActor = 'ADMIN';
const USER: OrderActor = 'USER';
const CRON: OrderActor = 'CRON';
const SYSTEM: OrderActor = 'SYSTEM';

describe('order state machine — canTransition', () => {
  describe('PENDING transitions', () => {
    it('PENDING → CONFIRMED allowed for ADMIN', () => {
      expect(canTransition('PENDING', 'CONFIRMED', ADMIN).allowed).toBe(true);
    });
    it('PENDING → CONFIRMED allowed for SYSTEM', () => {
      expect(canTransition('PENDING', 'CONFIRMED', SYSTEM).allowed).toBe(true);
    });
    it('PENDING → CONFIRMED denied for USER', () => {
      expect(canTransition('PENDING', 'CONFIRMED', USER).allowed).toBe(false);
    });
    it('PENDING → CANCELLED allowed for USER', () => {
      expect(canTransition('PENDING', 'CANCELLED', USER).allowed).toBe(true);
    });
    it('PENDING → CANCELLED allowed for ADMIN', () => {
      expect(canTransition('PENDING', 'CANCELLED', ADMIN).allowed).toBe(true);
    });
    it('PENDING → CANCELLED allowed for CRON (timeout)', () => {
      expect(canTransition('PENDING', 'CANCELLED', CRON).allowed).toBe(true);
    });
    it('PENDING → PROCESSING is not allowed', () => {
      expect(canTransition('PENDING', 'PROCESSING', ADMIN).allowed).toBe(false);
    });
    it('PENDING → SHIPPING is not allowed', () => {
      expect(canTransition('PENDING', 'SHIPPING', ADMIN).allowed).toBe(false);
    });
  });

  describe('CONFIRMED transitions', () => {
    it('CONFIRMED → PROCESSING allowed for ADMIN', () => {
      expect(canTransition('CONFIRMED', 'PROCESSING', ADMIN).allowed).toBe(true);
    });
    it('CONFIRMED → PROCESSING denied for USER', () => {
      expect(canTransition('CONFIRMED', 'PROCESSING', USER).allowed).toBe(false);
    });
    it('CONFIRMED → CANCELLED allowed for USER', () => {
      expect(canTransition('CONFIRMED', 'CANCELLED', USER).allowed).toBe(true);
    });
    it('CONFIRMED → CANCELLED allowed for ADMIN', () => {
      expect(canTransition('CONFIRMED', 'CANCELLED', ADMIN).allowed).toBe(true);
    });
    it('CONFIRMED → CANCELLED denied for CRON', () => {
      expect(canTransition('CONFIRMED', 'CANCELLED', CRON).allowed).toBe(false);
    });
    it('CONFIRMED → SHIPPING is not allowed', () => {
      expect(canTransition('CONFIRMED', 'SHIPPING', ADMIN).allowed).toBe(false);
    });
  });

  describe('PROCESSING transitions', () => {
    it('PROCESSING → READY_TO_SHIP allowed for ADMIN', () => {
      expect(canTransition('PROCESSING', 'READY_TO_SHIP', ADMIN).allowed).toBe(true);
    });
    it('PROCESSING → READY_TO_SHIP denied for USER', () => {
      expect(canTransition('PROCESSING', 'READY_TO_SHIP', USER).allowed).toBe(false);
    });
    it('PROCESSING → CANCELLED allowed for ADMIN within grace period', () => {
      expect(canTransition('PROCESSING', 'CANCELLED', ADMIN, CANCELLATION_GRACE_HOURS - 0.1).allowed).toBe(true);
    });
    it('PROCESSING → CANCELLED denied for ADMIN after grace period', () => {
      const result = canTransition('PROCESSING', 'CANCELLED', ADMIN, CANCELLATION_GRACE_HOURS + 0.1);
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/grace period/i);
    });
    it('PROCESSING → CANCELLED denied for USER regardless of time', () => {
      expect(canTransition('PROCESSING', 'CANCELLED', USER, 0).allowed).toBe(false);
    });
    it('PROCESSING → SHIPPING is not allowed', () => {
      expect(canTransition('PROCESSING', 'SHIPPING', ADMIN).allowed).toBe(false);
    });
  });

  describe('READY_TO_SHIP transitions', () => {
    it('READY_TO_SHIP → SHIPPING allowed for ADMIN', () => {
      expect(canTransition('READY_TO_SHIP', 'SHIPPING', ADMIN).allowed).toBe(true);
    });
    it('READY_TO_SHIP → SHIPPING denied for USER', () => {
      expect(canTransition('READY_TO_SHIP', 'SHIPPING', USER).allowed).toBe(false);
    });
    it('READY_TO_SHIP → CANCELLED allowed for ADMIN within grace', () => {
      expect(canTransition('READY_TO_SHIP', 'CANCELLED', ADMIN, 0).allowed).toBe(true);
    });
    it('READY_TO_SHIP → CANCELLED denied after grace period', () => {
      expect(canTransition('READY_TO_SHIP', 'CANCELLED', ADMIN, CANCELLATION_GRACE_HOURS + 1).allowed).toBe(false);
    });
  });

  describe('SHIPPING transitions', () => {
    it('SHIPPING → DELIVERED allowed for ADMIN', () => {
      expect(canTransition('SHIPPING', 'DELIVERED', ADMIN).allowed).toBe(true);
    });
    it('SHIPPING → DELIVERED denied for USER', () => {
      expect(canTransition('SHIPPING', 'DELIVERED', USER).allowed).toBe(false);
    });
    it('SHIPPING → CANCELLED is not allowed', () => {
      expect(canTransition('SHIPPING', 'CANCELLED', ADMIN).allowed).toBe(false);
    });
  });

  describe('DELIVERED transitions', () => {
    it('DELIVERED → COMPLETED allowed for CRON', () => {
      expect(canTransition('DELIVERED', 'COMPLETED', CRON).allowed).toBe(true);
    });
    it('DELIVERED → COMPLETED allowed for ADMIN (manual)', () => {
      expect(canTransition('DELIVERED', 'COMPLETED', ADMIN).allowed).toBe(true);
    });
    it('DELIVERED → RETURN_REQUESTED allowed for USER', () => {
      expect(canTransition('DELIVERED', 'RETURN_REQUESTED', USER).allowed).toBe(true);
    });
    it('DELIVERED → CANCELLED is not allowed', () => {
      expect(canTransition('DELIVERED', 'CANCELLED', ADMIN).allowed).toBe(false);
    });
  });

  describe('terminal states — no transitions out', () => {
    const terminals = ['COMPLETED', 'CANCELLED', 'RETURNED', 'REFUNDED'] as const;
    for (const terminal of terminals) {
      it(`${terminal} → any is not allowed`, () => {
        expect(canTransition(terminal, 'CONFIRMED', ADMIN).allowed).toBe(false);
        expect(canTransition(terminal, 'PROCESSING', ADMIN).allowed).toBe(false);
        expect(canTransition(terminal, 'CANCELLED', ADMIN).allowed).toBe(false);
      });
    }
  });
});
