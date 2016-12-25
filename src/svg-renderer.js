// @flow

import process from './process'

import type {HBox, VBox} from './types'
import {setAttributes} from './dom-utils'

const svgNS = 'http://www.w3.org/2000/svg'

export function createSvg(width: number, height: number) {
    const svg = document.createElementNS(svgNS, 'svg')
    setAttributes(svg, {
        width, height, viewBox: `0 0 ${width} ${height}`,
    });
    document.body.appendChild(svg);
    return svg;
}

function _render(container: Element, layout: any) {
    const pen = layout.pen

    if (layout.type === 'text') {
        const {fontFamily, fontSize, text} = layout;
        const textElem = document.createElementNS(svgNS, 'text')
        setAttributes(textElem, {
            x: pen[0],
            y: pen[1],
            'font-family': fontFamily,
            'font-size': fontSize,
        })
        textElem.textContent = text
        container.appendChild(textElem)
    } else if (layout.type === 'rect') {
        const {width, height} = layout;
        const rectElem = document.createElementNS(svgNS, 'rect')
        setAttributes(rectElem, {
            x: pen[0],
            y: pen[1],
            width: width,
            height: height,
        })
        container.appendChild(rectElem)
    } else if (layout.type === 'g') {
        const groupElem = document.createElementNS(svgNS, 'g')
        setAttributes(groupElem, {
            transform: `translate(${pen[0]}, ${pen[1]})`,
        })
        layout.children.forEach((child) => _render(groupElem, child))
        container.appendChild(groupElem)
    }
}

export function drawSvgLayout(svg: Element, layout: HBox | VBox) {
    _render(svg, process(layout))
}
