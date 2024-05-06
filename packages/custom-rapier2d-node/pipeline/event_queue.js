"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventQueue = exports.TempContactForceEvent = exports.ActiveEvents = void 0;
const raw_1 = require("../raw");
const math_1 = require("../math");
/**
 * Flags indicating what events are enabled for colliders.
 */
var ActiveEvents;
(function (ActiveEvents) {
    /**
     * Enable collision events.
     */
    ActiveEvents[ActiveEvents["COLLISION_EVENTS"] = 1] = "COLLISION_EVENTS";
    /**
     * Enable contact force events.
     */
    ActiveEvents[ActiveEvents["CONTACT_FORCE_EVENTS"] = 2] = "CONTACT_FORCE_EVENTS";
})(ActiveEvents = exports.ActiveEvents || (exports.ActiveEvents = {}));
/**
 * Event occurring when the sum of the magnitudes of the
 * contact forces between two colliders exceed a threshold.
 *
 * This object should **not** be stored anywhere. Its properties can only be
 * read from within the closure given to `EventHandler.drainContactForceEvents`.
 */
class TempContactForceEvent {
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    /**
     * The first collider involved in the contact.
     */
    collider1() {
        return this.raw.collider1();
    }
    /**
     * The second collider involved in the contact.
     */
    collider2() {
        return this.raw.collider2();
    }
    /**
     * The sum of all the forces between the two colliders.
     */
    totalForce() {
        return math_1.VectorOps.fromRaw(this.raw.total_force());
    }
    /**
     * The sum of the magnitudes of each force between the two colliders.
     *
     * Note that this is **not** the same as the magnitude of `self.total_force`.
     * Here we are summing the magnitude of all the forces, instead of taking
     * the magnitude of their sum.
     */
    totalForceMagnitude() {
        return this.raw.total_force_magnitude();
    }
    /**
     * The world-space (unit) direction of the force with strongest magnitude.
     */
    maxForceDirection() {
        return math_1.VectorOps.fromRaw(this.raw.max_force_direction());
    }
    /**
     * The magnitude of the largest force at a contact point of this contact pair.
     */
    maxForceMagnitude() {
        return this.raw.max_force_magnitude();
    }
}
exports.TempContactForceEvent = TempContactForceEvent;
/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
class EventQueue {
    /**
     * Creates a new event collector.
     *
     * @param autoDrain -setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     */
    constructor(autoDrain, raw) {
        this.raw = raw || new raw_1.RawEventQueue(autoDrain);
    }
    /**
     * Release the WASM memory occupied by this event-queue.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    /**
     * Applies the given javascript closure on each collision event of this collector, then clear
     * the internal collision event buffer.
     *
     * @param f - JavaScript closure applied to each collision event. The
     * closure must take three arguments: two integers representing the handles of the colliders
     * involved in the collision, and a boolean indicating if the collision started (true) or stopped
     * (false).
     */
    drainCollisionEvents(f) {
        this.raw.drainCollisionEvents(f);
    }
    /**
     * Applies the given javascript closure on each contact force event of this collector, then clear
     * the internal collision event buffer.
     *
     * @param f - JavaScript closure applied to each collision event. The
     *            closure must take one `TempContactForceEvent` argument.
     */
    drainContactForceEvents(f) {
        let event = new TempContactForceEvent();
        this.raw.drainContactForceEvents((raw) => {
            event.raw = raw;
            f(event);
            event.free();
        });
    }
    /**
     * Removes all events contained by this collector
     */
    clear() {
        this.raw.clear();
    }
}
exports.EventQueue = EventQueue;
//# sourceMappingURL=event_queue.js.map