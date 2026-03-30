export class UserInput {
    public canvas: HTMLCanvasElement;
    public screenW: number = 0;
    public screenH: number = 0;
    public xMoveDirection: number = 0;
    public yMoveDirection: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.screenW = 0;
        this.screenH = 0;
        const resize = () => {
            this.canvas.width = window.innerWidth; 
            this.canvas.height = window.innerHeight;
            this.screenW = window.innerWidth;
            this.screenH = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // TODO movement on mobile with virtual joystick
        document.addEventListener("keydown", (event) => {
            if (event.repeat) return;

            if (event.code == "KeyW") this.yMoveDirection -= 1;
            else if (event.code == "KeyA") this.xMoveDirection -= 1;
            else if (event.code == "KeyS") this.yMoveDirection += 1;
            else if (event.code == "KeyD") this.xMoveDirection += 1;
        });
        document.addEventListener("keyup", (event) => {
            if (event.code == "KeyW") this.yMoveDirection += 1;
            else if (event.code == "KeyA") this.xMoveDirection += 1;
            else if (event.code == "KeyS") this.yMoveDirection -= 1;
            else if (event.code == "KeyD") this.xMoveDirection -= 1;
        });
    }
}