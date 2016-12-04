// @flow

import type {Node, Box, HBox, VBox, Char, VList, HList} from './types'
import {getMetrics} from './metrics'
import {setAttributes} from './dom-utils'

const svgNS = 'http://www.w3.org/2000/svg'

export function createSvg(width: number, height: number) {

    const svg = document.createElementNS(svgNS, 'svg')

    setAttributes(svg, {
        width, height, viewBox: `-100 -100 ${width} ${height}`,
    });

    document.body.appendChild(svg);

    return svg;
}

const charHeight = (node: Char) => {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[0]
}

const charDepth = (node: Char) => {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[1]
}

const charWidth = (node: Char) => {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[2]
}

const vsize = (node: Node) => {
    switch (node.type) {
        case 'Char': return charHeight(node) + charDepth(node)
        case 'Box': return node.height + node.depth
        case 'Rule': return (node.height === '*' ? 0 : node.height) +
            (node.depth === '*' ? 0 : node.depth)
        case 'Glue': return node.size
        case 'Kern': return node.amount
        default: return 0
    }
}

const sum = (values: number[]): number => {
    return values.reduce((res, val) => res + val, 0)
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

const vlistSize = (vlist: VList) => sum(vlist.map(vsize))

// TODO(kevinb): convert SVG WebIDL to flow types
export function drawSvgLayout(svg: Element, layout: HBox | VBox) {

    const pen = {x: 0, y:0}
    const fontSize = 32

    switch (layout.kind) {
        case 'HBox':
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        const g = document.createElementNS(svgNS, 'g')
                        const shift = fontSize * node.shift;
                        drawSvgLayout(g, node)
                        const transform = `translate(${pen.x}, ${pen.y - shift})`
                        setAttributes(g, {transform})
                        svg.appendChild(g)
                        break
                    case 'Char':
                        const text = document.createElementNS(svgNS, 'text')
                        setAttributes(text, {
                            ...pen,
                            'font-family': "Main_Regular",
                            'font-size': fontSize,
                        })
                        text.textContent = node.char
                        svg.appendChild(text)

                        const [,,width] = getMetrics(node.char)
                        pen.x += fontSize * width
                        break
                    case 'Kern':
                        pen.x += fontSize * node.amount
                        break
                }
            }
            break;
        case 'VBox':
            const deferred: any[] = []
            pen.y = pen.y - fontSize * layout.height
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        pen.y += fontSize * node.height
                        const g = document.createElementNS(svgNS, 'g')
                        drawSvgLayout(g, node)
                        deferred.push({
                            g: g,
                            pen: {...pen},
                            node: node,
                        })
                        pen.y += fontSize * node.depth
                        break
                    case 'Char':
                        const text = document.createElementNS(svgNS, 'text')
                        setAttributes(text, {
                            ...pen,
                            'font-family': "Main_Regular",
                            'font-size': fontSize,
                        })
                        text.textContent = node.char
                        svg.appendChild(text)

                        const [height, depth, ] = getMetrics(node.char)
                        pen.y += fontSize * (height + depth)
                        break
                    case 'Kern':
                        pen.y += fontSize * node.amount
                        break
                    case 'Rule':
                        const rect = document.createElementNS(svgNS, 'rect')
                        deferred.push({
                            pen: {...pen},
                            node: node,
                        });
                        // we don't know the width yet, but we do know the vsize
                        pen.y += fontSize * 0.04
                        break
                    default:
                        console.log(`unhandled node of type: ${node.type}`);
                }
            }

            console.log(deferred)

            const w = vwidth(layout)
            console.log(`w = ${w}`)

            for (const {g, node, pen} of deferred) {
                console.log(node);
                switch (node.type) {
                    case 'Rule':
                        const rect = document.createElementNS(svgNS, 'rect')
                        setAttributes(rect, {
                            x: pen.x,
                            y: pen.y,
                            width: fontSize * w,
                            height: fontSize * (node.height + node.depth), // use a function
                            fill: 'black', // use the current color
                        });
                        svg.appendChild(rect)
                        break;
                    case 'Box':
                        if (node.kind === 'HBox') {
                            const nodeWidth = width(node)
                            if (nodeWidth < w) {
                                pen.x += fontSize * (w - nodeWidth) / 2
                            }
                            const transform = `translate(${pen.x}, ${pen.y})`
                            setAttributes(g, {transform})
                            svg.appendChild(g)
                        }
                }
            }
            break;
    }
}
