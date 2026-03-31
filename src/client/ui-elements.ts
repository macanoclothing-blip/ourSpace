import { UserInput } from './user-input';
import { Rectangle } from '../common';

type ButtonColors = {
    main?: string;
    text?: string;
    shadow?: string;
}

export class Button {
    private text: string;
    private userInput: UserInput;
    private onClickCallback: any;
    private colors: ButtonColors;
    private rect: Rectangle;
    private isPressed: boolean;

    constructor(text: string, userInput: UserInput, onClickCallback: ()=>void) {
        this.text = text;
        this.userInput = userInput;
        this.colors = {};
        this.rect = { x: 0, y: 0, w: 0, h: 0 };
        this.isPressed = false;
        this.onClickCallback = onClickCallback;

        userInput.canvas.addEventListener('pointerdown', (e) => {
            if (this.isInside(e)) {
                this.isPressed = true;
            }
        });
        userInput.canvas.addEventListener('pointerup', (e) => {
            if (this.isPressed && this.isInside(e)) {
                this.onClickCallback();
            }
            this.isPressed = false;
        });
    }

    isInside(e) {
        const { canvas, screenW, screenH } = this.userInput;
        const bounds = canvas.getBoundingClientRect();
        const pos = {
            x: e.clientX - bounds.left - screenW/2,
            y: e.clientY - bounds.top - screenH/2
        };
        const rect = this.rect;
        return pos.x >= rect.x && pos.x <= rect.x + rect.w &&
            pos.y >= rect.y && pos.y <= rect.y + rect.h;
    };

    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        this.rect = { x, y, w, h }; 

        const mainColor = this.colors.main || "#d18800";
        const textColor = this.colors.text || "#e6e6e6";
        const shadowColor = this.colors.shadow || "#161616";

        const shadowOffset = Math.min(w, h) * 0.07;
        const pushOffset = this.isPressed ? shadowOffset * 0.5 : 0;

        // ombra
        ctx.beginPath();
        ctx.rect(x + shadowOffset, y + shadowOffset, w, h);
        ctx.fillStyle = shadowColor;
        ctx.fill();

        // bottone
        ctx.beginPath();
        ctx.rect(x + pushOffset, y + pushOffset, w, h);
        ctx.fillStyle = mainColor;
        ctx.fill();

        // testo
        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.floor(Math.min(w, h) * 0.5)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, x + w / 2 + pushOffset, y + h / 2 + pushOffset);
    }

    setColors(newColors: ButtonColors): void {
        this.colors = { ...this.colors, ...newColors };
    }
}
