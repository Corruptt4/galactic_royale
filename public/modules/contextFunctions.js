import { ctx } from "../main.js"
/**
 * a = type
 * b = size
 * c = width
 * d = height
 * e = sides
 * f = radii
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