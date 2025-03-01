import { EntityWith } from "game/src/framework/entity"
import * as THREE from "three"
import { GamePlayerComponents } from "../model/entity"
import { GamePlayerStore } from "../model/store"

type TransitionAnimation =
    | undefined
    | {
          progress: number

          // target size exists implicitly in this.size
          // targetSize: THREE.Vec2
          startSize: THREE.Vec2

          targetPosition: THREE.Vec2
          startPosition: THREE.Vec2
      }

type StartAnimation =
    | undefined
    | {
          progress: number

          startScale: number
          targetScale: number
      }

export class ModuleCamera extends THREE.OrthographicCamera {
    private configAnimationSpeed: number
    private configZoom: number

    private getRocket: () => EntityWith<GamePlayerComponents, "three" | "rocket" | "transform">

    private cameraTargetSize: THREE.Vector2 = new THREE.Vector2()
    private levelConstraintPosition: THREE.Vector2 = new THREE.Vector2()
    private levelConstraintSize: THREE.Vector2 = new THREE.Vector2()
    private size: THREE.Vector2 = new THREE.Vector2()

    private transitionAnimation: TransitionAnimation = undefined
    private startAnimation: StartAnimation = undefined

    constructor(private store: GamePlayerStore) {
        super()

        this.position.z = 5
        this.configAnimationSpeed = 1.0 / 1000.0
        this.configZoom = 1920 * 0.04

        this.getRocket = store.entities.single("three", "rocket", "transform")

        this.startAnimation = {
            progress: 0,
            startScale: 50,
            targetScale: 1,
        }

        this.store.events.listen({
            captured: ({ level }) => {
                this.updateLevelConstraintFromLevel(level)

                this.transitionAnimation = {
                    progress: 0,
                    startSize: this.size.clone(),
                    targetPosition: new THREE.Vector2(),
                    startPosition: this.position.clone(),
                }

                this.updateCameraSize()
                this.updateCameraPosition()
            },
        })

        const renderer = this.store.resources.get("renderer")

        this.onCanvasResize = this.onCanvasResize.bind(this)
        const observer = new ResizeObserver(this.onCanvasResize)
        observer.observe(renderer.domElement)
    }

    onReset() {
        const rocketEntity = this.getRocket()
        const transform = rocketEntity.get("transform")

        this.position.x = transform.point.x
        this.position.y = transform.point.y

        const firstLevel = this.store.entities.multiple("level").find(x => x.get("level").first)

        if (!firstLevel) {
            throw new Error("No first level found")
        }

        this.updateLevelConstraintFromLevel(firstLevel)
    }

    onUpdate(delta: number) {
        this.updateCameraPosition()

        if (this.transitionAnimation) {
            this.transitionAnimation.progress += delta * this.configAnimationSpeed
            this.transitionAnimation.progress = Math.min(this.transitionAnimation.progress, 1)

            const sizeX = this.lerp(
                this.transitionAnimation.startSize.x,
                this.size.x,
                this.easeOutFast(this.transitionAnimation.progress),
            )

            const sizeY = this.lerp(
                this.transitionAnimation.startSize.y,
                this.size.y,
                this.easeOutFast(this.transitionAnimation.progress),
            )

            this.top = sizeY / 2
            this.bottom = -sizeY / 2
            this.left = -sizeX / 2
            this.right = sizeX / 2

            this.position.x = this.lerp(
                this.transitionAnimation.startPosition.x,
                this.transitionAnimation.targetPosition.x,
                this.easeOutFast(this.transitionAnimation.progress),
            )

            this.position.y = this.lerp(
                this.transitionAnimation.startPosition.y,
                this.transitionAnimation.targetPosition.y,
                this.easeOutFast(this.transitionAnimation.progress),
            )

            this.updateProjectionMatrix()

            if (this.transitionAnimation.progress === 1) {
                this.transitionAnimation = undefined
            }
        }

        if (this.startAnimation) {
            this.startAnimation.progress += delta * this.configAnimationSpeed
            this.startAnimation.progress = Math.min(this.startAnimation.progress, 1)

            this.zoom = this.lerp(
                this.startAnimation.startScale,
                this.startAnimation.targetScale,
                this.easeOutSlow(this.startAnimation.progress),
            )

            this.updateProjectionMatrix()

            if (this.startAnimation.progress === 1) {
                this.startAnimation = undefined
            }
        }

        this.updateViewport()
    }

    private onCanvasResize() {
        const renderer = this.store.resources.get("renderer")

        const width = renderer.domElement.clientWidth
        const height = renderer.domElement.clientHeight

        renderer.setSize(width, height, false)

        const max = Math.max(width, height)

        this.cameraTargetSize.x = (this.configZoom * width) / max
        this.cameraTargetSize.y = (this.configZoom * height) / max

        this.updateCameraSize()
        this.updateCameraPosition()
    }

    private updateViewport() {
        const renderer = this.store.resources.get("renderer")

        const rendererWidth = renderer.domElement.clientWidth
        const rendererHeight = renderer.domElement.clientHeight

        let viewportSizeX = this.size.x / this.cameraTargetSize.x
        let viewportSizeY = this.size.y / this.cameraTargetSize.y

        const maxViewportSize = Math.max(viewportSizeX, viewportSizeY)

        viewportSizeX /= maxViewportSize
        viewportSizeY /= maxViewportSize

        const viewportX = 0.5 * rendererWidth * (1 - viewportSizeX)
        const viewportY = 0.5 * rendererHeight * (1 - viewportSizeY)

        renderer.setViewport(
            viewportX,
            viewportY,
            viewportSizeX * rendererWidth,
            viewportSizeY * rendererHeight,
        )
    }

    private easeOutFast(x: number) {
        return 1 - Math.pow(1 - x, 5)
    }

    private easeOutSlow(x: number) {
        return 1 - Math.pow(1 - x, 3)
    }

    private updateCameraSize() {
        this.size.x = Math.min(this.cameraTargetSize.x, this.levelConstraintSize.x)
        this.size.y = Math.min(this.cameraTargetSize.y, this.levelConstraintSize.y)

        if (this.transitionAnimation === undefined) {
            this.top = this.size.y / 2
            this.bottom = -this.size.y / 2
            this.left = -this.size.x / 2
            this.right = this.size.x / 2

            this.updateProjectionMatrix()
            this.updateViewport()
        }
    }

    private updateCameraPosition() {
        function constrainAxis(cameraSize: number, constrainSize: number, rocketPosition: number) {
            if (cameraSize >= constrainSize) {
                return constrainSize / 2
            } else {
                const cameraWiggleRoomFactor = 0.2
                const rocketWiggleRoom = cameraSize * cameraWiggleRoomFactor * 0.5

                const rocketOffsetFromCenter = constrainSize * 0.5 - rocketPosition
                const rocketFractionFromCenter = rocketOffsetFromCenter / (constrainSize * 0.5)

                const rocketPositionWithWiggleRoom =
                    rocketFractionFromCenter * rocketWiggleRoom + rocketPosition

                const cameraMinPosition = cameraSize / 2
                const cameraMaxPosition = constrainSize - cameraMinPosition

                return Math.min(
                    Math.max(rocketPositionWithWiggleRoom, cameraMinPosition),
                    cameraMaxPosition,
                )
            }
        }

        const rocket = this.getRocket()
        const rocketThree = rocket.get("three")

        if (rocketThree === undefined) {
            throw new Error("Rocket visual not found")
        }

        const rocketPositionInViewX = rocketThree.position.x - this.levelConstraintPosition.x
        const rocketPositionInViewY = rocketThree.position.y - this.levelConstraintPosition.y

        const cameraPositionX =
            this.levelConstraintPosition.x +
            constrainAxis(this.size.x, this.levelConstraintSize.x, rocketPositionInViewX)

        const cameraPositionY =
            this.levelConstraintPosition.y +
            constrainAxis(this.size.y, this.levelConstraintSize.y, rocketPositionInViewY)

        if (this.transitionAnimation) {
            this.transitionAnimation.targetPosition.x = cameraPositionX
            this.transitionAnimation.targetPosition.y = cameraPositionY
        } else {
            this.position.x = cameraPositionX
            this.position.y = cameraPositionY
        }
    }

    private updateLevelConstraintFromLevel(level: EntityWith<GamePlayerComponents, "level">) {
        const levelComponent = level.get("level")

        this.levelConstraintSize = new THREE.Vector2(
            levelComponent.bounding.right - levelComponent.bounding.left,
            levelComponent.bounding.top - levelComponent.bounding.bottom,
        )

        this.levelConstraintPosition = new THREE.Vector2(
            levelComponent.bounding.left,
            levelComponent.bounding.bottom,
        )
    }

    private lerp(start: number, end: number, progress: number) {
        return start + (end - start) * progress
    }
}
