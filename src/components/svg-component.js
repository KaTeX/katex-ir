// @flow
import React from 'react'

import type {HBox, VBox} from '../types'
import {height, depth, width} from '../layout/measure-utils'
import process from '../process'

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
        const fontSize = 32;
        const h = fontSize * height(this.props.layout);
        const d = fontSize * depth(this.props.layout);
        const w = fontSize * width(this.props.layout);
        const layout = process(this.props.layout);

        return <svg
            style={{display: 'inline-block'}}
            width={w + 2}
            height={h + d + 2}
            viewBox={`-1 -1 ${w + 2} ${h + d + 2}`}
        >
            {this._render(layout)}
        </svg>
    }
}
