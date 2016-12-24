// @flow

import type {HBox, VBox, Node} from './types'
import {getMetrics} from './metrics'

export function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    document.body.appendChild(canvas)
    const context = canvas.getContext('2d')
    return context
}

export function drawLayout(context: CanvasRenderingContext2D, layout: any) {
    const pen = layout.pen

    // TODO(kevinb) keep track of font and change it as necessary
    const fontSize = 32
    context.font = `${fontSize}px Main_Regular`

    if (layout.type === 'text') {
        context.fillText(layout.text, pen[0], pen[1])
    } else if (layout.type === 'rect') {
        context.fillRect(pen[0], pen[1], layout.width, layout.height)
    } else if (layout.type === 'g') {
        context.save()
        context.translate(pen[0], pen[1])
        layout.children.forEach((child) => drawLayout(context, child))
        context.restore()
    }
}
