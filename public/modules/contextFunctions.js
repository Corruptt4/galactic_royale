import { ctx } from "../main.js"
/**
 * a = type
 * b = size
 * c = width
 * d = height
 * e = sides
 * f = radii
 */

// Some context functions
/**
 * Polygon - Constructs a polygon with x sides and a size
 * Rect - Constructs a rectangle (obvious)
 * Circle - Draws a circle
 * 
 * May be used more into the UI part of the game.
 * Could be used or later deleted (depends if I use it a lot)...
 * Or changed if not seen useful for the game's code.
 * 
 * 
 * Possibly more stuff gonna be added here. (possibly Trapezoid, or an entire change to include
 *  'x' and 'y' values to make it used even more throughout the code.)
 */
export function contextFunctions(a, b, c, d, e, f) {
    switch (a) {
        case "Polygon":
            ctx.moveTo(b * Math.cos(0), b * Math.sin(0))
            for (let i = 0; i < e+1; i++) {
                ctx.lineTo(
                    b * Math.cos((i * 2 * Math.PI) / e),
                    b * Math.sin((i * 2 * Math.PI) / e)
                )
            }
        break;
        case "Rect":
            ctx.roundRect(0, 0, c, d, f)
            break;
        case "Circle":
            ctx.arc(0, 0, b, 0, Math.PI*2)
            break;
    }
}