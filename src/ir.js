// @flow

type node = HBox | VBox | Char | Rule | Kern | Penalty | Special;

type Box = {
    type: 'Box',
    width?: number,  // if undefined, contents of box define its width
    height: number,
    depth: number,
    content: node[],
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

type HList = node[];
type VList = node[];

const content: HList = [];

const createChar = (font: FontId, char: string) => {
    return {
        type: 'Char',
        font: font,
        char: char,
    }
}

const sansSerifChar = createChar.bind(null, 'sans-serif');

const createKern = (amount: number) => {
    return {
        type: 'Kern',
        amount: amount,
    }
}

content.push(sansSerifChar('1'))
content.push(createKern(0.2))   // TODO(kevinb) get real kern amounts
content.push(sansSerifChar('+'))
content.push(createKern(0.2))
content.push(sansSerifChar('2'))
content.push(createKern(0.2))
content.push(sansSerifChar('='))
content.push(createKern(0.2))
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

const height = (node) => {
    switch (node.type) {
        case 'Box': return node.height
        case 'Rule': return node.height
        case 'Char': return charHeight(node)
        default: return 0
    }
}

const depth = (node) => {
    switch (node.type) {
        case 'Box': return node.depth
        case 'Rule': return node.depth
        case 'Char': return charDepth(node)
        default: return 0
    }
}

const hlistHeight = (hlist: HList) => Math.max(...hlist.map(height))
const hlistDepth = (hlist: HList) => Math.max(...hlist.map(depth))

const simpleRun: HBox = {
    type: 'Box',
    kind: 'HBox',
    height: hlistHeight(content),
    depth: hlistDepth(content),
    content: content,
    shift: 0,
}

console.log(simpleRun)

// TODO(kevinb) create a fraction layout
