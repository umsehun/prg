/**
 * Physics Worker for knife throwing simulation
 * Runs Matter.js physics in a separate thread for 60fps performance
 */

import { Engine, World, Bodies, Body, Events, Vector } from 'matter-js';

interface WorkerMessage {
    type: string;
    data?: any;
}

interface KnifeState {
    id: string;
    x: number;
    y: number;
    angle: number;
    velocityX: number;
    velocityY: number;
    isStuck: boolean;
    stuckAngle?: number;
}

interface TargetState {
    x: number;
    y: number;
    angle: number;
    rotationSpeed: number; // degrees per second
}

interface PhysicsConfig {
    canvasWidth: number;
    canvasHeight: number;
    targetRadius: number;
    knifeVelocity: number;
    targetRotationSpeed: number;
}

class PhysicsSimulation {
    private engine: Engine;
    private world: World;
    private knives: Map<string, Body> = new Map();
    private stuckKnives: Map<string, { body: Body; stuckAngle: number }> = new Map();
    private target: Body | null = null;
    private config: PhysicsConfig | null = null;
    private lastTime: number = 0;
    private targetAngle: number = 0;

    constructor() {
        // Create Matter.js engine with optimized settings
        this.engine = Engine.create({
            gravity: { x: 0, y: 0, scale: 0 }, // No gravity for knife throwing
            timing: { timeScale: 1, timestamp: 0 }
        });

        this.world = this.engine.world;

        // Optimize for performance
        this.engine.velocityIterations = 4;
        this.engine.positionIterations = 6;
        this.engine.enableSleeping = true;

        this.setupCollisionDetection();
    }

    private setupCollisionDetection(): void {
        Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                // Check if knife hit target
                if (this.isKnifeTargetCollision(bodyA, bodyB)) {
                    const knife = this.isKnife(bodyA) ? bodyA : bodyB;
                    this.handleKnifeStuck(knife);
                }

                // Check if knife hit another stuck knife
                if (this.isKnifeKnifeCollision(bodyA, bodyB)) {
                    const movingKnife = this.getMovingKnife(bodyA, bodyB);
                    if (movingKnife) {
                        this.handleKnifeCollision(movingKnife);
                    }
                }
            });
        });
    }

    initialize(config: PhysicsConfig): void {
        this.config = config;

        // Create circular target at center
        const centerX = config.canvasWidth / 2;
        const centerY = config.canvasHeight / 2;

        this.target = Bodies.circle(centerX, centerY, config.targetRadius, {
            isStatic: true,
            render: { fillStyle: '#ff6b6b' },
            label: 'target'
        });

        World.add(this.world, this.target);

        // Send initialization complete
        self.postMessage({
            type: 'initialized',
            data: { targetX: centerX, targetY: centerY, targetRadius: config.targetRadius }
        });
    }

    throwKnife(id: string, startX: number, startY: number, targetX: number, targetY: number): void {
        if (!this.config) return;

        // Calculate velocity vector
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const velocityX = (dx / distance) * this.config.knifeVelocity;
        const velocityY = (dy / distance) * this.config.knifeVelocity;

        // Create knife body
        const knife = Bodies.rectangle(startX, startY, 6, 30, {
            density: 0.001,
            frictionAir: 0,
            render: { fillStyle: '#4ecdc4' },
            label: `knife_${id}`
        });

        // Set initial velocity
        Body.setVelocity(knife, { x: velocityX, y: velocityY });

        // Set rotation to point in direction of travel
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        Body.setAngle(knife, angle);

        // Add to world and tracking
        World.add(this.world, knife);
        this.knives.set(id, knife);
    }

    private handleKnifeStuck(knife: Body): void {
        if (!this.target || !this.config) return;

        // Stop the knife
        Body.setVelocity(knife, { x: 0, y: 0 });
        Body.setAngularVelocity(knife, 0);

        // Calculate stuck angle relative to target center
        const dx = knife.position.x - this.target.position.x;
        const dy = knife.position.y - this.target.position.y;
        const stuckAngle = Math.atan2(dy, dx);

        // Store as stuck knife
        const knifeId = this.getKnifeId(knife);
        if (knifeId) {
            this.stuckKnives.set(knifeId, { body: knife, stuckAngle });
            this.knives.delete(knifeId);
        }

        // Notify main thread
        self.postMessage({
            type: 'knifeStuck',
            data: {
                id: knifeId,
                x: knife.position.x,
                y: knife.position.y,
                angle: knife.angle,
                stuckAngle
            }
        });
    }

    private handleKnifeCollision(knife: Body): void {
        const knifeId = this.getKnifeId(knife);

        // Remove colliding knife and give penalty
        if (knifeId) {
            World.remove(this.world, knife);
            this.knives.delete(knifeId);
        }

        // Remove one stuck knife (PRG rule: collision removes stuck knife)
        if (this.stuckKnives.size > 0) {
            const firstStuck = this.stuckKnives.entries().next().value;
            if (firstStuck) {
                const [stuckId, stuckData] = firstStuck;
                World.remove(this.world, stuckData.body);
                this.stuckKnives.delete(stuckId);

                self.postMessage({
                    type: 'knifeRemoved',
                    data: { id: stuckId }
                });
            }
        }

        // Notify collision
        self.postMessage({
            type: 'knifeCollision',
            data: { id: knifeId }
        });
    }

    update(deltaTime: number): void {
        if (!this.config || !this.target) return;

        // Update target rotation
        const rotationDelta = (this.config.targetRotationSpeed * Math.PI / 180) * (deltaTime / 1000);
        this.targetAngle += rotationDelta;

        // Update stuck knives to rotate with target
        this.stuckKnives.forEach((stuckData, id) => {
            const { body, stuckAngle } = stuckData;
            const distance = this.config!.targetRadius;

            const newX = this.target!.position.x + Math.cos(stuckAngle + this.targetAngle) * distance;
            const newY = this.target!.position.y + Math.sin(stuckAngle + this.targetAngle) * distance;

            Body.setPosition(body, { x: newX, y: newY });
            Body.setAngle(body, stuckAngle + this.targetAngle + Math.PI / 2);
        });

        // Step physics simulation
        Engine.update(this.engine, deltaTime);

        // Send updated states
        this.sendPhysicsUpdate();
    }

    private sendPhysicsUpdate(): void {
        const knifeStates: KnifeState[] = [];

        // Active knives
        this.knives.forEach((body, id) => {
            knifeStates.push({
                id,
                x: body.position.x,
                y: body.position.y,
                angle: body.angle,
                velocityX: body.velocity.x,
                velocityY: body.velocity.y,
                isStuck: false
            });
        });

        // Stuck knives
        this.stuckKnives.forEach((stuckData, id) => {
            knifeStates.push({
                id,
                x: stuckData.body.position.x,
                y: stuckData.body.position.y,
                angle: stuckData.body.angle,
                velocityX: 0,
                velocityY: 0,
                isStuck: true,
                stuckAngle: stuckData.stuckAngle
            });
        });

        const targetState: TargetState = {
            x: this.target?.position.x || 0,
            y: this.target?.position.y || 0,
            angle: this.targetAngle,
            rotationSpeed: this.config?.targetRotationSpeed || 0
        };

        self.postMessage({
            type: 'physicsUpdate',
            data: { knives: knifeStates, target: targetState }
        });
    }

    // Helper methods
    private isKnifeTargetCollision(bodyA: Body, bodyB: Body): boolean {
        return (this.isKnife(bodyA) && bodyB.label === 'target') ||
            (this.isKnife(bodyB) && bodyA.label === 'target');
    }

    private isKnifeKnifeCollision(bodyA: Body, bodyB: Body): boolean {
        return this.isKnife(bodyA) && this.isKnife(bodyB);
    }

    private isKnife(body: Body): boolean {
        return body.label.startsWith('knife_');
    }

    private getKnifeId(body: Body): string | null {
        if (body.label.startsWith('knife_')) {
            return body.label.substring(6); // Remove 'knife_' prefix
        }
        return null;
    }

    private getMovingKnife(bodyA: Body, bodyB: Body): Body | null {
        const speedA = Math.sqrt(bodyA.velocity.x ** 2 + bodyA.velocity.y ** 2);
        const speedB = Math.sqrt(bodyB.velocity.x ** 2 + bodyB.velocity.y ** 2);

        return speedA > speedB ? bodyA : bodyB;
    }

    dispose(): void {
        // Clear all physics bodies first
        World.clear(this.world, false);
        Engine.clear(this.engine);

        // Clear collections and prevent memory leaks
        this.knives.clear();
        this.stuckKnives.clear();

        // Reset state
        this.target = null;
        this.config = null;
        this.lastTime = 0;
        this.targetAngle = 0;

        // Log disposal for debugging
        console.log('🧹 Physics simulation disposed - memory cleaned');
    }
}

// Worker implementation
const physics = new PhysicsSimulation();
let animationId: number;
let isDisposed = false;

function gameLoop(currentTime: number): void {
    if (isDisposed) return; // ✅ Prevent execution after disposal

    const deltaTime = currentTime - (physics as any).lastTime || 16.67; // ~60fps default
    (physics as any).lastTime = currentTime;

    // Limit delta time to prevent large jumps
    const clampedDelta = Math.min(deltaTime, 33.33); // Max 30fps minimum
    physics.update(clampedDelta);

    if (!isDisposed) { // ✅ Check again before scheduling next frame
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { type, data } = event.data;

    switch (type) {
        case 'initialize':
            physics.initialize(data);
            animationId = requestAnimationFrame(gameLoop);
            break;

        case 'throwKnife':
            physics.throwKnife(data.id, data.startX, data.startY, data.targetX, data.targetY);
            break;

        case 'dispose':
            isDisposed = true; // ✅ Mark as disposed first
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            physics.dispose();
            console.log('🧹 Physics worker disposed successfully');
            break;
    }
};

export { }; // Ensure this is treated as a module
