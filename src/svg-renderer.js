// @flow

import type {Node, HBox} from './types'
import {getMetrics} from './metrics'

const svgNS = 'http://www.w3.org/2000/svg'

function setAttributes(elem: Element, attrs: {[key: string]: number | string}) {
    Object.keys(attrs).forEach((key) => {
        const value = attrs[key]
        elem.setAttribute(key, `${value}`)
    })
    // for (const [key, value] of Object.entries(attrs)) {
    //     elem.setAttribute(key, `${value}`)  // 'value' cannot be coerced to string
    // }
}

export function createSvg(width: number, height: number) {

    const svg = document.createElementNS(svgNS, 'svg')

    setAttributes(svg, {
        width, height, viewBox: `0 0 ${width} ${height}`,
    });

    document.body.appendChild(svg);

    return svg;
}

// TODO(kevinb): convert SVG WebIDL to flow types
export function drawSvgLayout(svg: Element, layout: HBox) {

    const pen = {x: 100, y:100}
    const fontSize = 32


    for (const node: Node of layout.content) {
        switch (node.type) {
            case 'Kern':
                pen.x += fontSize * node.amount
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
        }
    }
}
