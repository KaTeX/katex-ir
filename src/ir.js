// @flow

import type {
    Node,
    FontId,
    HBox,
    VBox,
    HList,
    VList,
    Rule,
    Glue,
    Char,
} from './types'

import {getMetrics} from './metrics'
import WebFont from 'webfontloader';

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
        case 'Box': return node.height  // TODO: handle shift
        case 'Rule': return node.height
        case 'Char': return charHeight(node)
        default: return 0
    }
}

const depth = (node: Node) => {
    switch (node.type) {
        case 'Box': return node.depth   // TODO: handle shift
        case 'Rule': return node.depth
        case 'Char': return charDepth(node)
        default: return 0
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

console.log(simpleRun)

const vsize = (node: Node) => {
    switch (node.type) {
        case 'Char': return charHeight(node) + charDepth(node)
        case 'Box': return node.height + node.depth
        case 'Rule': return node.height + node.depth
        case 'Glue': return node.size
        case 'Kern': return node.amount
        default: return 0
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
    makeKern(0.2),
    mainRegularChar('+'),
    makeKern(0.2),
    mainRegularChar('3'),
])

const makeRule = (height: number, depth: number): Rule =>
({
    type: 'Rule',
    height: height,
    depth: depth,
})

const makeGlue = (size: number, shrink = 0, stretch = 0): Glue =>
({
    type: 'Glue',
    size: size,
    shrink: shrink,
    stretch: stretch,
})

const fraction = makeVBox(
    makeRule(0.1, 0.1),  // reference node
    [
        makeHBox([makeGlue(Infinity), numerator, makeGlue(Infinity)]),
    ],  // upList
    [
        makeHBox([makeGlue(Infinity), denominator, makeGlue(Infinity)]),
    ],  // dnList
)

console.log(fraction);
console.log(`denominator depth = ${hlistDepth(denominator.content)}`);
console.log(`denominator height = ${hlistHeight(denominator.content)}`);

import {createCanvas, drawLayout} from './canvas-renderer'
import {createSvg, drawSvgLayout} from './svg-renderer'

WebFont.load({
    custom: {
        families: ['Main_Regular:n4'],
    },
    active: function(familyName, fvd) {
        const context = createCanvas(512, 256)
        if (context) {
            drawLayout(context, simpleRun)
        }

        const svg = createSvg(512, 256);
        if (svg) {
            drawSvgLayout(svg, simpleRun);
        }
    },
});
