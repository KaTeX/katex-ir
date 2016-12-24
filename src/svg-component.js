// @flow
import React from 'react'

import type {HBox, VBox} from './types'
import process from './process'

const svgNS = 'http://www.w3.org/2000/svg'

export default class Renderer extends React.Component {
    props: {
        layout: HBox | VBox
    }

    _render(layout: any, key?: string) {
        const pen = layout.pen;

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
        const layout = process(this.props.layout);

        return <svg width={320} height={200} viewBox='0 0 320 200'>
            <g transform='translate(100, 100)'>
                {this._render(layout)}
            </g>
        </svg>
    }
}
