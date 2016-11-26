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

export function drawLayout(context: CanvasRenderingContext2D, layout: HBox) {
    const pen = {x: 100, y:100}
    const fontSize = 32

    context.save()

    context.font = `${fontSize}px Main_Regular`

    for (const node: Node of layout.content) {
        switch (node.type) {
            case 'Kern':
                pen.x += fontSize * node.amount
                break
            case 'Char':
                context.fillText(node.char, pen.x, pen.y)
                const [,,width] = getMetrics(node.char)
                pen.x += fontSize * width
                break
        }
    }

    context.restore()
}
