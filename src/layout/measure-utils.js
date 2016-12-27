// @flow

import type {Node, Char} from '../types'

import metrics from '../data/font-metrics'
import symbols from '../data/symbols'

var fontMap = {
    // styles
    "mathbf": {
        variant: "bold",
        fontName: "Main-Bold",
    },
    "mathrm": {
        variant: "normal",
        fontName: "Main-Regular",
    },

    // "mathit" is missing because it requires the use of two fonts: Main-Italic
    // and Math-Italic.  This is handled by a special case in makeOrd which ends
    // up calling mathit.

    // families
    "mathbb": {
        variant: "double-struck",
        fontName: "AMS-Regular",
    },
    "mathcal": {
        variant: "script",
        fontName: "Caligraphic-Regular",
    },
    "mathfrak": {
        variant: "fraktur",
        fontName: "Fraktur-Regular",
    },
    "mathscr": {
        variant: "script",
        fontName: "Script-Regular",
    },
    "mathsf": {
        variant: "sans-serif",
        fontName: "SansSerif-Regular",
    },
    "mathtt": {
        variant: "monospace",
        fontName: "Typewriter-Regular",
    },
};

export function getMetrics(char: string) {
    const code = char.charCodeAt(0);
    const fontName = "Main-Regular";
    const [depth, height, italic, skew, width] = metrics[fontName][code];
    return [height, depth, width];
}


export function sum(values: number[]): number {
    return values.reduce((res, val) => res + val, 0)
}

export function charWidth(node: Char): number {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    let multiplier = 1.0
    if (node.style === 'S') {
        multiplier = 0.7
    } else if (node.style === 'SS') {
        multiplier = 0.5
    }
    return multiplier * metrics[2]
}

export function width(node: Node): number {
    let result
    switch (node.type) {
        case 'Char': return charWidth(node)
        case 'Box': return node.kind === 'VBox'
            ? Math.max(...node.content.map(vwidth))
            : sum(node.content.map(width))
        case 'Kern': return node.amount
        case 'Glue': return node.size
        case 'Rule': return node.width !== '*' ? node.width : 0
        default: return 0
    }
}

export function vwidth(node: Node): number {
    let result
    switch (node.type) {
        case 'Char': return charWidth(node)
        case 'Box': return node.kind === 'VBox'
            ? Math.max(...node.content.map(vwidth))
            : sum(node.content.map(width))
        case 'Rule': return node.width !== '*' ? node.width : 0
        default: return 0
    }
}

export function charHeight(node: Char): number {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    let multiplier = 1.0
    if (node.style === 'S') {
        multiplier = 0.7
    } else if (node.style === 'SS') {
        multiplier = 0.5
    }
    return multiplier * metrics[0]
}

export function charDepth(node: Char): number {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    let multiplier = 1.0
    if (node.style === 'S') {
        multiplier = 0.7
    } else if (node.style === 'SS') {
        multiplier = 0.5
    }
    return multiplier * metrics[1]
}

// TODO: handle Glue and Kern
export function height(node: Node): number {
    switch (node.type) {
        // TODO: check the box kind
        case 'Box':
            return node.height + node.shift
        case 'Rule':
            return node.height === '*' ? 0 : node.height
        case 'Char':
            return charHeight(node)
        default:
            return 0
    }
}

// TODO: handle Glue and Kern
export function depth(node: Node): number {
    switch (node.type) {
        // TODO: check the box kind
        case 'Box':
            return node.depth - node.shift
        case 'Rule':
            return node.depth === '*' ? 0 : node.depth
        case 'Char':
            return charDepth(node)
        default:
            return 0
    }
}
