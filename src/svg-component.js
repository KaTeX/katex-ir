// @flow
import React from 'react'

import type {Node, Box, HBox, VBox, Char, VList, HList} from './types'
import {getMetrics} from './metrics'

const svgNS = 'http://www.w3.org/2000/svg'

const sum = (values: number[]): number => {
    return values.reduce((res, val) => res + val, 0)
}

const charWidth = (node: Char) => {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[2]
}

const width = (node: Node): number => {
    let result
    switch (node.type) {
        case 'Char': return charWidth(node)
        case 'Box': return node.kind === 'VBox'
            ? Math.max(...node.content.map(vwidth))
            : sum(node.content.map(width))
        case 'Kern': return node.amount
        case 'Glue': return node.size
        case 'Rule': return node.width !== '*' ? node.width : 0
        default: return 0
    }
}

const vwidth = (node: Node): number => {
    let result
    switch (node.type) {
        case 'Char': return charWidth(node)
        case 'Box': return node.kind === 'VBox'
            ? Math.max(...node.content.map(vwidth))
            : sum(node.content.map(width))
        case 'Rule': return node.width !== '*' ? node.width : 0
        default: return 0
    }
}

export const transmogrify = (layout: HBox | VBox): any => {

    const fontSize = 32
    const pen = [0, 0]
    const result = {
        type: 'g',
        children: [],
        pen: [0, 0],
        width: width(layout),
    }

    switch(layout.kind) {
        case 'HBox':
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        const g = transmogrify(node)
                        const shift = fontSize * node.shift
                        g.pen = [pen[0], pen[1] - shift]
                        // TODO(kevinb) update pen position
                        // pen[0] += width(node)
                        result.children.push(g)
                        break
                    case 'Char':
                        const text = {
                            type: 'text',
                            pen: [...pen],
                            fontFamily: 'Main_Regular',
                            fontSize: fontSize,
                            text: node.char,
                        }
                        result.children.push(text)
                        const [,,width] = getMetrics(node.char)
                        pen[0] += fontSize * width
                        break
                    case 'Kern':
                        pen[0] += fontSize * node.amount
                        break
                }
            }
            break;
        case 'VBox':
            const deferred: any[] = []
            pen[1] = pen[1] - fontSize * layout.height
            // TODO(kevinb) convert this to a flatMap
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        pen[1] += fontSize * node.height
                        const g = transmogrify(node)
                        g.pen = [...pen]
                        result.children.push(g)
                        pen[1] += fontSize * node.depth
                        break
                    case 'Char':
                        const text = {
                            type: 'text',
                            pen: [...pen],
                            fontFamily: 'Main_Regular',
                            fontSize: fontSize,
                            text: node.char,
                        }
                        result.children.push(text)
                        const [height, depth, ] = getMetrics(node.char)
                        pen[1] += fontSize * (height + depth)
                        break
                    case 'Kern':
                        pen[1] += fontSize * node.amount
                        break
                    case 'Rule':
                        if (node.height !== '*' && node.depth !== '*') {
                            pen[1] -= fontSize * node.height
                            const rect = {
                                type: 'rect',
                                pen: [...pen],
                                width: Infinity,    // TODO(kevinb) check if it's a '*'
                                height: fontSize * (node.height + node.depth),
                                fill: 'black',      // TODO(kevinb) update the color
                            }
                            pen[1] += rect.height
                            result.children.push(rect)
                        }
                        break
                    default:
                        console.log(`unhandled node of type: ${node.type}`);
                }
            }

            const w = vwidth(layout)

            for (const node: any of result.children) {
                switch (node.type) {
                    case 'rect':
                        node.width = fontSize * w;
                        break;
                    case 'g':
                        // TODO(kevinb) instead of post-processing, we should
                        // be calculating the width first and then using that
                        // information when layingout HBoxes
                        // if (node.kind === 'HBox') {
                        if (node.width < w) {
                            // TODO(kevinb) actually check if there's glue
                            node.pen[0] += fontSize * (w - node.width) / 2
                        }
                        // }
                }
            }
            break
    }

    return result;
}


export default class Renderer extends React.Component {
    props: {
        layout: HBox | VBox
    }

    _render(layout: any) {
        const pen = layout.pen;
        console.log(layout);

        if (layout.type === 'text') {
            const {fontFamily, fontSize, text} = layout;
            return <text x={pen[0]} y={pen[1]} fontFamily={fontFamily} fontSize={fontSize}>
                {text}
            </text>
        } else if (layout.type === 'rect') {
            const {width, height} = layout;
            return <rect x={pen[0]} y={pen[1]} width={width} height={height}/>
        } else if (layout.type === 'g') {
            return <g transform={`translate(${pen[0]}, ${pen[1]})`}>
                {layout.children.map((child) => this._render(child))}
            </g>
        }
    }

    render() {
        const layout = transmogrify(this.props.layout);

        return <svg width={320} height={200} viewBox='0 0 320 200'>
            <g transform='translate(100, 100)'>
                {this._render(layout)}
            </g>
        </svg>
    }
}
