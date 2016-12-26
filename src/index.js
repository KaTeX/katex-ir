// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import WebFont from 'webfontloader'

import type {
    Node,
    FontId,
    HBox,
    VBox,
    HList,
    VList,
    Rule,
    Glue,
    GlueMeasurement,
    Char,
} from './types'

import process from './process'
import sigmas from './data/sigmas'
import {
    makeChar,
    mainRegularChar,
    mathRegularChar,
    makeKern,
    makeRule,
    makeVBox,
    makeHBox,
    makeGlue,
    hfil,
} from './layout/make-utils'

import SvgComponent from './components/svg-component'
import {createCanvas, drawLayout} from './renderers/canvas-renderer'
import {createSvg, drawSvgLayout} from './renderers/svg-renderer'
import {renderHTML} from './renderers/html-renderer'
import {width, height, depth} from './layout/measure-utils'


// TODO(kevinb) make these configurable
// TODO(kevinb) use the actual glue definitions
const thinmuskip = 0.16667;
const medmuskip = 0.22222;
const thickmuskip = 0.27778;

const xi8 = 0.04; // default rule width


const content: HList = [];

const simpleRun: HBox = makeHBox([
    mainRegularChar('5'),
    makeKern(thinmuskip),
    mainRegularChar('+'),
    makeKern(thinmuskip),
    mainRegularChar('7'),
    makeKern(thickmuskip),
    mainRegularChar('='),
    makeKern(thickmuskip),
    mainRegularChar('1'),
    mainRegularChar('2'),
])

const makeFraction = (numerator, denominator) => {
    return makeVBox(
        makeRule(0.5 * xi8, 0.5 * xi8, '*'), // reference node
        [
            // numerator
            makeHBox([
                makeGlue(0, hfil()),
                numerator,
                makeGlue(0, hfil()),
            ]),
            // TODO(kevinb) figure out the correct numShift
            makeKern(sigmas.num1[0] / 2),
        ], // upList
        [
            // TODO(kevinb) figure out the correct denomShift
            makeKern(sigmas.denom1[0] / 2),
            // numerator
            makeHBox([
                makeGlue(0, hfil()),
                denominator,
                makeGlue(0, hfil()),
            ]),
        ], // dnList
        sigmas.axisHeight[0],
    )
}

// TODO(kevinb) put the fraction in an HBox with 1.2 pt kerns on either side
// TODO(kevinb) all distances should have a unit of measure, e.g. em, pt, etc.
const fontSize = 32

const expr = makeHBox([
    mainRegularChar('2'),
    makeKern(medmuskip),
    mainRegularChar('+'),
    makeKern(medmuskip), // this should change depending on the current style
    makeKern(1.2 / 10), // scaled according to the base font size, not the current style
    makeFraction(
        makeHBox([
            mainRegularChar('1')
        ]),
        makeHBox([
            mainRegularChar('2'),
            makeKern(thinmuskip),
            mainRegularChar('+'),
            makeKern(thinmuskip),
            mainRegularChar('3'),
        ])
    ),
    makeKern(1.2 / 10),
    makeKern(medmuskip),
    mainRegularChar('+'),
    makeKern(medmuskip),
    mainRegularChar('5'),
    mainRegularChar('7'),
])

const nestedFraction = makeHBox([
    makeKern(1.2 / 10),
    makeFraction(
        makeHBox([
            mainRegularChar('1')
        ]),
        makeHBox([
            mainRegularChar('2'),
            makeKern(thinmuskip),
            mainRegularChar('+'),
            makeKern(thinmuskip),
            makeKern(1.2 / 10),
            makeFraction(
                makeHBox([
                    mainRegularChar('1')
                ]),
                makeHBox([
                    mainRegularChar('2'),
                    makeKern(thinmuskip),
                    mainRegularChar('+'),
                    makeKern(thinmuskip),
                    mainRegularChar('3'),
                ])
            ),
            makeKern(1.2 / 10),
        ])
    ),
    makeKern(1.2 / 10),
])

const exponent = makeHBox([
    mainRegularChar('1'),
    makeKern(thinmuskip),
    mainRegularChar('+'),
    makeKern(thinmuskip),
    mainRegularChar('2'),
    makeHBox([
         mainRegularChar('2'),
         makeHBox([
            mainRegularChar('2'),
            makeHBox([
                mainRegularChar('2'),
            ], 0.5),
        ], 0.5),
    ], 0.5),
])

const variable = makeHBox([
    mathRegularChar('x'),
    makeKern(thinmuskip),
    mainRegularChar('+'),
    makeKern(thinmuskip),
    mathRegularChar('y'),
])

const renderRow = (expr) => {
    const row = document.createElement('div')
    row.setAttribute('class', 'row')

    const fontSize = 32
    const w = fontSize * width(expr)
    const h = fontSize * height(expr)
    const d = fontSize * depth(expr)

    // canvas
    const canvas = createCanvas(w, h + d)
    row.appendChild(canvas)
    drawLayout(canvas, expr)

    // SVG
    const svg = createSvg(w, h + d);
    if (svg) {
        drawSvgLayout(svg, expr)
        row.appendChild(svg)
    }

    // SVG + React
    const reactContainer = document.createElement('div')
    reactContainer.style.display = 'inline'
    row.appendChild(reactContainer)
    ReactDOM.render(<SvgComponent layout={expr}/>, reactContainer)

    // HTML
    // const container = document.createElement('span')
    // renderHTML(container, nestedFraction)
    // const wrapper = document.createElement('div')
    // wrapper.style.border = 'solid 1px gray'
    // wrapper.style.display = 'inline-block'
    // wrapper.appendChild(container)
    // document.body.appendChild(wrapper)

    document.body.appendChild(row)
}

const svgNS = 'http://www.w3.org/2000/svg'

WebFont.load({
    custom: {
        families: ['Main_Regular:n4', 'Math_Regular:n4'],
    },
    active: function(familyName, fvd) {
        renderRow(expr)
        renderRow(nestedFraction)
        renderRow(exponent)
        renderRow(variable)
    },
});
