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

export function renderHTML(container: Element, layout: HBox | VBox) {

    const pen = {x: 100, y:100}
    const fontSize = 32

    switch (layout.kind) {
        case 'HBox':
            container.setAttribute('style', generateStyle({
                display: 'flex',
                'flex-direction': 'row',
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
                        }))
                        container.appendChild(span)
                        break
                    case 'Char':
                        span.setAttribute('style', generateStyle({
                            'font-family': "Main_Regular",
                            'font-size': fontSize,
                            // 'line-height': 0,
                            'line-height': fontSize * charHeight(node),
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
            container.setAttribute('style', generateStyle({
                display: 'flex',
                'flex-direction': 'column',
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
                                height: fontSize * (node.height + node.depth),
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

