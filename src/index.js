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
content.push(mainRegularChar('5'))
content.push(makeKern(thinmuskip))
content.push(mainRegularChar('+'))
content.push(makeKern(thinmuskip))
content.push(mainRegularChar('7'))
content.push(makeKern(thickmuskip))
content.push(mainRegularChar('='))
content.push(makeKern(thickmuskip))
content.push(mainRegularChar('1'))
content.push(mainRegularChar('2'))

const simpleRun: HBox = makeHBox(content)


const numerator = makeHBox([
    mainRegularChar('1')
])

const denominator = makeHBox([
    mainRegularChar('2'),
    makeKern(thinmuskip),
    mainRegularChar('+'),
    makeKern(thinmuskip),
    mainRegularChar('3'),
])


const fraction = makeVBox(
    makeRule(0.5 * xi8, 0.5 * xi8, '*'), // reference node
    [
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
        makeHBox([
            makeGlue(0, hfil()),
            denominator,
            makeGlue(0, hfil()),
        ]),
    ], // dnList
    sigmas.axisHeight[0],
)


// TODO(kevinb) put the fraction in an HBox with 1.2 pt kerns on either side
// TODO(kevinb) all distances should have a unit of measure, e.g. em, pt, etc.
const fontSize = 32

const expr = makeHBox([
    mainRegularChar('2'),
    makeKern(medmuskip),
    mainRegularChar('+'),
    makeKern(medmuskip), // this should change depending on the current style
    makeKern(1.2 / 10), // scaled according to the base font size, not the current style
    fraction,
    makeKern(1.2 / 10),
    makeKern(medmuskip),
    mainRegularChar('+'),
    makeKern(medmuskip),
    mainRegularChar('5'),
    mainRegularChar('7'),
])

const svgNS = 'http://www.w3.org/2000/svg'

WebFont.load({
    custom: {
        families: ['Main_Regular:n4'],
    },
    active: function(familyName, fvd) {
        const fontSize = 32
        const w = fontSize * width(expr)
        const h = fontSize * height(expr)
        const d = fontSize * depth(expr)

        // canvas
        const context = createCanvas(w, h + d)
        if (context) {
            context.translate(0, h + 1)
            drawLayout(context, process(expr))
        }

        // SVG
        const svg = createSvg(w, h + d);
        const g = document.createElementNS(svgNS, 'g')

        if (svg && g) {
            drawSvgLayout(g, expr)
            g.setAttribute('transform', `translate(0, ${h + 1})`)
            svg.appendChild(g)
        }

        // HTML
        const container = document.createElement('span')
        renderHTML(container, expr)
        const wrapper = document.createElement('div')
        wrapper.style.border = 'solid 1px gray'
        wrapper.style.display = 'inline-block'
        wrapper.appendChild(container)
        document.body.appendChild(wrapper)

        // SVG + React
        const reactContainer = document.createElement('div')
        reactContainer.style.display = 'inline'
        document.body.appendChild(reactContainer)
        ReactDOM.render(<SvgComponent layout={expr}/>, reactContainer)
    },
});