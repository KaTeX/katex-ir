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

const height = (node: Node) => {
    switch (node.type) {
        // Note: same height for all Chars b/c the baselines already match
        case 'Char': return getMetrics('2')[0]
        case 'Box': return node.height + node.shift
        case 'Rule': return node.height === '*' ? 0 : node.height
        default: return 0
    }
}

const depth = (node: Node) => {
    switch (node.type) {
        // Note: same depth for all Chars b/c the baselines already match
        case 'Char': return getMetrics('2')[1]
        case 'Box': return node.depth
        case 'Rule': return node.depth === '*' ? 0 : node.depth
        default: return 0
    }
}

export function renderHTML(container: Element, layout: HBox | VBox) {

    const pen = { x: 100, y: 100 }
    const fontSize = 32

    switch (layout.kind) {
        case 'HBox':
            container.setAttribute('style', generateStyle({
                    display: 'flex',
                    'flex-direction': 'row',
                    'align-items': 'flex-start',
                }))
            let maxHeight = -Infinity
            let maxDepth = -Infinity
            const deferred: any[] = []
            for (const node: Node of layout.content) {
                const span = document.createElement('span')
                maxHeight = Math.max(maxHeight, height(node))
                maxDepth = Math.max(maxDepth, depth(node))
                switch (node.type) {
                    case 'Box':
                        renderHTML(span, node)
                        container.appendChild(span)
                        deferred.push({
                            node: node,
                            span: span,
                        })
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
                        deferred.push({
                            node: node,
                            span: span,
                        })
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
            // shift nodes after figuring out the max height
            for (const {node, span} of deferred) {
                if (height(node) < maxHeight) {
                    // TODO: the baseline of the operators is already lined up
                    // with the baseline of the numbers and variables, so we
                    // have to match that baseline
                    const diff = maxHeight - height(node)
                    console.log(maxHeight - height(node))
                    span.style.position = 'relative';
                    span.style.top = `${fontSize * diff}px`;
                }
            }
            break
        case 'VBox':
            // console.log(layout)
            const fudgeFactor = 2
            container.setAttribute('style', generateStyle({
                display: 'flex',
                'flex-direction': 'column',
                position: 'relative',
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