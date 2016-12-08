// @flow

import type {Node, HBox, VBox, Char} from './types'
import {generateStyle, setAttributes} from './dom-utils'
import {getMetrics} from './metrics'

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

export function renderHTML(container: Element, layout: HBox | VBox) {

    const pen = {x: 100, y:100}
    const fontSize = 32

    switch (layout.kind) {
        case 'HBox':
            container.setAttribute('style', generateStyle({
                display: 'flex',
                'flex-direction': 'row',
                'align-items': 'flex-start',
            }))
            for (const node: Node of layout.content) {
                const span = document.createElement('span')
                switch (node.type) {
                    case 'Box':
                        renderHTML(span, node)
                        container.appendChild(span)
                        break
                    case 'Kern':
                        span.setAttribute('style', generateStyle({
                            display: 'inline-block',
                            width: fontSize * node.amount,
                            // height: 0.7 * fontSize,
                        }))
                        container.appendChild(span)
                        break
                    case 'Char':
                        span.setAttribute('style', generateStyle({
                            'font-family': "Main_Regular",
                            'font-size': fontSize,
                            'line-height': fontSize * vsize(node),
                            height: fontSize * vsize(node),
                        }))
                        span.innerText = node.char
                        container.appendChild(span)
                        break
                    case 'Glue':
                        span.setAttribute('style', generateStyle({
                            'flex-shrink': '1',
                            'flex-grow': '1',
                        }))
                        container.appendChild(span)
                        break
                }
            }
            break
        case 'VBox':
            console.log(layout)
            const fudgeFactor = 2
            container.setAttribute('style', generateStyle({
                display: 'flex',
                'flex-direction': 'column',
                position: 'relative',
                // TODO(kevinb) shift items that are smaller than the largest item
                top: -(fontSize * layout.height)
                    + 20.63 // height of the 2 that comes before the fraction
                    - 0.25 * fontSize  // axis height
                    - 0.02 * fontSize, // half the height of the fraction bar
            }))
            for (const node: Node of layout.content) {
                const span = document.createElement('span')
                switch (node.type) {
                    case 'Box':
                        renderHTML(span, node)
                        container.appendChild(span)
                        break
                    case 'Char':

                        break
                    case 'Kern':
                        span.setAttribute('style', generateStyle({
                            'flex-basis': fontSize * node.amount,
                        }))
                        container.appendChild(span)
                        break
                    case 'Rule':
                        if (node.width === '*' && node.height !== '*' && node.depth !== '*') {
                            span.setAttribute('style', generateStyle({
                                position: 'relative',
                                width: '100%',
                                height: Math.round(fontSize * (node.height + node.depth)),
                                background: 'black',
                            }))
                            container.appendChild(span)
                        }
                        break
                }
            }
            break
    }

    return container
}

