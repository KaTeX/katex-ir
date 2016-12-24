// @flow
import React from 'react'

import type {Node, Box, HBox, VBox, Char, VList, HList, Glue} from './types'
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

export const transform = (layout: HBox | VBox, parentWidth?: number = 0): any => {

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
            const naturalWidth2 = width(layout)
            let totalStretch = 0
            let widthDiff = 0
            let stretchIndex = 0

            if (naturalWidth2 < parentWidth) {
                const glues: Glue[] = []
                for (const node: Node of layout.content) {
                    if (node.type === 'Glue') {
                        glues.push(node)
                    }
                }

                // TODO(kevinb) figure out which measurement to use
                // TODO(kevinb) handle negative values for fil, fill, and filll
                let index = 0;
                glues.forEach((glue: Glue) => {
                    glue.stretch.forEach((value, i) => {
                        if (value !== 0) {
                            index = Math.max(index, i)
                        }
                    })
                })

                stretchIndex = index
                widthDiff = parentWidth - naturalWidth2;
                totalStretch = glues.reduce((total, glue) => {
                    return total + glue.stretch[index];
                }, 0);
            } else if (naturalWidth2 > parentWidth) {

            }

            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        const g = transform(node, naturalWidth2)
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
                        const [,,w] = getMetrics(node.char)
                        pen[0] += fontSize * w
                        break
                    case 'Kern':
                        pen[0] += fontSize * node.amount
                        break
                    case 'Glue':
                        if (totalStretch !== 0) {
                            pen[0] += fontSize * (node.size + node.stretch[stretchIndex] / totalStretch * widthDiff)
                        } else {
                            pen[0] += fontSize * node.size
                        }
                        break
                }
            }

            break;
        case 'VBox':
            const naturalWidth = vwidth(layout)
            const deferred: any[] = []
            pen[1] = pen[1] - fontSize * layout.height
            // TODO(kevinb) convert this to a flatMap
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        pen[1] += fontSize * node.height
                        const g = transform(node, naturalWidth)
                        g.pen = [...pen]
                        // if (node.kind === 'HBox') {
                        //     if (g.width < naturalWidth) {
                        //         // TODO(kevinb) actually check if there's glue
                        //         g.pen[0] += fontSize * (naturalWidth - g.width) / 2
                        //     }
                        // }
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
                                width: fontSize * naturalWidth,
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
    }

    return result;
}


export default class Renderer extends React.Component {
    props: {
        layout: HBox | VBox
    }

    _render(layout: any, key?: string) {
        const pen = layout.pen;
        console.log(layout);

        if (layout.type === 'text') {
            const {fontFamily, fontSize, text} = layout;
            return <text key={key} x={pen[0]} y={pen[1]} fontFamily={fontFamily} fontSize={fontSize}>
                {text}
            </text>
        } else if (layout.type === 'rect') {
            const {width, height} = layout;
            return <rect key={key} x={pen[0]} y={pen[1]} width={width} height={height}/>
        } else if (layout.type === 'g') {
            return <g key={key} transform={`translate(${pen[0]}, ${pen[1]})`}>
                {layout.children.map((child, i) => this._render(child, i))}
            </g>
        }
    }

    render() {
        const layout = transform(this.props.layout);

        return <svg width={320} height={200} viewBox='0 0 320 200'>
            <g transform='translate(100, 100)'>
                {this._render(layout)}
            </g>
        </svg>
    }
}
