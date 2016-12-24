// @flow

import React from 'react'
import ReactDOM from 'react-dom'

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

import {getMetrics} from './metrics'
import Renderer, {transform} from './svg-component'
import WebFont from 'webfontloader'

const content: HList = [];

const makeChar = (font: FontId, char: string) => {
    return {
        type: 'Char',
        font: font,
        char: char,
    }
}

const mainRegularChar = makeChar.bind(null, 'Main-Regular');

const makeKern = (amount: number) => {
    return {
        type: 'Kern',
        amount: amount,
    }
}

// TODO(kevinb) make these configurable
const thinmuskip = 0.16667;
const medmuskip = 0.22222;
const thickmuskip = 0.27778;

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

const height = (node: Node) => {
    switch (node.type) {
        // TODO: check the box kind
        case 'Box':
            return node.height // TODO: handle shift
        case 'Rule':
            return node.height === '*' ? 0 : node.height
        case 'Char':
            return charHeight(node)
        default:
            return 0
    }
}

const depth = (node: Node) => {
    switch (node.type) {
        // TODO: check the box kind
        case 'Box':
            return node.depth // TODO: handle shift
        case 'Rule':
            return node.depth === '*' ? 0 : node.depth
        case 'Char':
            return charDepth(node)
        default:
            return 0
    }
}

const hlistHeight = (hlist: HList) => Math.max(...hlist.map(height))
const hlistDepth = (hlist: HList) => Math.max(...hlist.map(depth))

const makeHBox = (content: HList, shift = 0) => {
    return {
        type: 'Box',
        kind: 'HBox',
        height: hlistHeight(content),
        depth: hlistDepth(content),
        content: content,
        shift: shift,
    }
}

const simpleRun: HBox = makeHBox(content)

// console.log(simpleRun)

const vsize = (node: Node) => {
    switch (node.type) {
        case 'Char':
            return charHeight(node) + charDepth(node)
        case 'Box':
            return node.height + node.depth
        case 'Rule':
            return (node.height === '*' ? 0 : node.height) +
                (node.depth === '*' ? 0 : node.depth)
        case 'Glue':
            return node.size
        case 'Kern':
            return node.amount
        default:
            return 0
    }
}

const sum = (values: number[]): number => {
    return values.reduce((res, val) => res + val, 0)
}

const vlistSize = (vlist: VList) => sum(vlist.map(vsize))

const makeVBox = (node: Node, upList: VList, dnList: VList, shift = 0): VBox =>
    ({
        type: 'Box',
        kind: 'VBox',
        content: [...upList, node, ...dnList],
        height: height(node) + vlistSize(upList),
        depth: depth(node) + vlistSize(dnList),
        shift: shift,
    })

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

const makeRule = (height: number | '*', depth: number | '*', width: number | '*'): Rule =>
    ({
        type: 'Rule',
        height: height,
        depth: depth,
        width: width,
    })

const makeGlue = (
    size: number,
    stretch: GlueMeasurement = [0, 0, 0, 0],
    shrink: GlueMeasurement = [0, 0, 0, 0]
): Glue => ({type: 'Glue', size, stretch, shrink})

var sigmas = {
    slant: [0.250, 0.250, 0.250], // sigma1
    space: [0.000, 0.000, 0.000], // sigma2
    stretch: [0.000, 0.000, 0.000], // sigma3
    shrink: [0.000, 0.000, 0.000], // sigma4
    xHeight: [0.431, 0.431, 0.431], // sigma5
    quad: [1.000, 1.171, 1.472], // sigma6
    extraSpace: [0.000, 0.000, 0.000], // sigma7
    num1: [0.677, 0.732, 0.925], // sigma8
    num2: [0.394, 0.384, 0.387], // sigma9
    num3: [0.444, 0.471, 0.504], // sigma10
    denom1: [0.686, 0.752, 1.025], // sigma11
    denom2: [0.345, 0.344, 0.532], // sigma12
    sup1: [0.413, 0.503, 0.504], // sigma13
    sup2: [0.363, 0.431, 0.404], // sigma14
    sup3: [0.289, 0.286, 0.294], // sigma15
    sub1: [0.150, 0.143, 0.200], // sigma16
    sub2: [0.247, 0.286, 0.400], // sigma17
    supDrop: [0.386, 0.353, 0.494], // sigma18
    subDrop: [0.050, 0.071, 0.100], // sigma19
    delim1: [2.390, 1.700, 1.980], // sigma20
    delim2: [1.010, 1.157, 1.420], // sigma21
    axisHeight: [0.250, 0.250, 0.250], // sigma22
}

const xi8 = 0.04; // default rule width

const hfil = (value: number = 1): GlueMeasurement => [0, value, 0, 0]
const hfill = (value: number = 1): GlueMeasurement => [0, 0, value, 0]
const hfilll = (value: number = 1): GlueMeasurement => [0, 0, 0, value]

const fraction = makeVBox(
    makeRule(0.5 * xi8, 0.5 * xi8, '*'), // reference node
    [
        makeHBox([
            makeGlue(0, hfil()),
            numerator,
            makeGlue(0, hfil()),
        ]),
        makeKern(sigmas.num1[0] / 2), // TODO(kevinb) figure out the correct numShift
    ], // upList
    [
        makeKern(sigmas.denom1[0] / 2), // TODO(kevinb) figure out the correct denomShift
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
])

// console.log(fraction);
// console.log(`denominator depth = ${hlistDepth(denominator.content)}`);
// console.log(`denominator height = ${hlistHeight(denominator.content)}`);

import { createCanvas, drawLayout } from './canvas-renderer'
import { createSvg, drawSvgLayout } from './svg-renderer'
import { renderHTML } from './html-renderer'

WebFont.load({
    custom: {
        families: ['Main_Regular:n4'],
    },
    active: function(familyName, fvd) {
        const context = createCanvas(320, 200)
        if (context) {
            drawLayout(context, simpleRun)
        }

        const svg = createSvg(320, 200);
        if (svg) {
            drawSvgLayout(svg, expr);
        }

        const container = document.createElement('span')
        renderHTML(container, expr)
        const wrapper = document.createElement('div')
        wrapper.style.border = 'solid 1px gray'
        wrapper.appendChild(container)
        document.body.appendChild(wrapper)

        const reactContainer = document.createElement('div')
        document.body.appendChild(reactContainer)
        ReactDOM.render(<Renderer layout={expr}/>, reactContainer)

        const result = transform(expr)
        console.log(result)
    },
});