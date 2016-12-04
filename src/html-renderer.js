// @flow

import type {Node, HBox} from './types'
import {setAttributes} from './dom-utils'

function generateStyle(attrs: {[key:string]: string | number}) {
    return Object.keys(attrs).map((key) => {
        const value = attrs[key]
        if (typeof value === 'string') {
            return `${key}: ${value}`
        } else if (typeof value === 'number') {
            return `${key}: ${value}px`
        }
    }).join(';')
}

export function renderHTML(layout: HBox) {

    const pen = {x: 100, y:100}
    const fontSize = 32

    const container = document.createElement('div');

    for (const node: Node of layout.content) {
        const span = document.createElement('span');
        switch (node.type) {
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
                }))
                span.innerText = node.char
                container.appendChild(span)
                break
        }
    }

    return container
}

