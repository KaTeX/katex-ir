// @flow

type Node = HBox | VBox | Char | Rule | Kern | Glue | Penalty | Special;

type Box = {
    type: 'Box',
    width?: number,  // if undefined, contents of box define its width
    height: number,
    depth: number,
    content: Node[],
    shift: number,
}

type HBox = Box & { kind: 'HBox' }
type VBox = Box & { kind: 'VBox' }

type FontId = string

type Char = {
    type: 'Char',
    font: FontId,
    char: string,
}

type Rule = {
    type: 'Rule',
    width?: number, // if undefined occupies the width of the containing box
    height: number,
    depth: number,
}

type Kern = {
    type: 'Kern',
    amount: number,
}

type Glue = {
    type: 'Glue',
    size: number,
    stretch: number,
    shrink: number,
}

type Penalty = {
    type: 'Penalty',
    potential: number,
    adequacy: number,
}

type Special = {
    type: 'Special',
    width?: number,
    height: number,
    depth: number,
}

type HList = Node[];
type VList = Node[];

const content: HList = [];

const makeChar = (font: FontId, char: string) => {
    return {
        type: 'Char',
        font: font,
        char: char,
    }
}

const sansSerifChar = makeChar.bind(null, 'sans-serif');

const makeKern = (amount: number) => {
    return {
        type: 'Kern',
        amount: amount,
    }
}

content.push(sansSerifChar('1'))
content.push(makeKern(0.2))   // TODO(kevinb) get real kern amounts
content.push(sansSerifChar('+'))
content.push(makeKern(0.2))
content.push(sansSerifChar('2'))
content.push(makeKern(0.2))
content.push(sansSerifChar('='))
content.push(makeKern(0.2))
content.push(sansSerifChar('3'))

type GlyphMetrics = [
    number,  // height
    number,  // depth
];

// TODO(kevinb) get real metrics
const glyphMetrics: {[key: string]: GlyphMetrics} = {
    '1': [20, 0],
    '2': [20, 0],
    '3': [20, 0],
    '+': [14, -7],
    '-': [11, -9],
    '=': [13, -8],
}

const charHeight = (node: Char) => {
    const metrics = glyphMetrics[node.char]
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[0]
}

const charDepth = (node: Char) => {
    const metrics = glyphMetrics[node.char]
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[1]
}

const height = (node: Node) => {
    switch (node.type) {
        case 'Box': return node.height
        case 'Rule': return node.height
        case 'Char': return charHeight(node)
        default: return 0
    }
}

const depth = (node: Node) => {
    switch (node.type) {
        case 'Box': return node.depth
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

const makeVBox = (node: Node, upList: VList, dnList: VList, shift = 0): VBox => {
    return {
        type: 'Box',
        kind: 'VBox',
        content: [...upList, node, ...dnList],
        height: height(node) + vlistSize(upList),
        depth: depth(node) + vlistSize(dnList),
        shift: shift,
    }
}

const numerator = makeHBox([
    sansSerifChar('1')
])

const denominator = makeHBox([
    sansSerifChar('2'),
    makeKern(0.2),
    sansSerifChar('+'),
    makeKern(0.2),
    sansSerifChar('3'),
])

const makeRule = (height: number, depth: number): Rule => {
    return {
        type: 'Rule',
        height: height,
        depth: depth,
    }
}

const makeGlue = (size: number, shrink = 0, stretch = 0): Glue => {
    return {
        type: 'Glue',
        size: size,
        shrink: shrink,
        stretch: stretch,
    }
}

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
