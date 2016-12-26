// @flow

import process from '../process'

import type {HBox, VBox, Node} from '../types'

export function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width + 2
    canvas.height = height + 2
    return canvas
}

function draw(context: CanvasRenderingContext2D, layout: any) {
    const pen = layout.pen

    if (layout.type === 'text') {
        context.font = `${layout.fontSize}px ${layout.fontFamily}`
        context.fillText(layout.text, pen[0], pen[1])
    } else if (layout.type === 'rect') {
        context.fillRect(pen[0], pen[1], layout.width, layout.height)
    } else if (layout.type === 'g') {
        context.save()
        context.translate(pen[0], pen[1])
        layout.children.forEach((child) => draw(context, child))
        context.restore()
    }
}

export function drawLayout(canvas: HTMLCanvasElement, layout: HBox | VBox) {
    const context = canvas.getContext('2d')
    if (context) {
        context.translate(0, 1)
        draw(context, process(layout))
    }
}
