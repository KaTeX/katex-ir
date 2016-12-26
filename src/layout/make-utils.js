// @flow

import type {
    Char,
    Kern,
    HBox,
    VBox,
    HList,
    VList,
    Rule,
    FontId,
    Node,
    Glue,
    GlueMeasurement,
    Style,
} from '../types'
import {height, depth} from './measure-utils'

const styles = {
    DISPLAY: 'D',
    TEXT: 'T',
    SCRIPT: 'S',
    SCRIPTSCRIPT: 'SS',
}

export function makeChar(font: FontId, style: Style, char: string): Char {
    return {
        type: 'Char',
        font: font,
        style: style,
        char: char,
    }
}

export function mainRegularChar(char: string, style:Style = 'T') {
    return makeChar('Main_Regular', style, char)
}

export function mathRegularChar(char: string, style:Style = 'T') {
    return makeChar('Math_Regular', style, char)
}

export function makeKern(amount: number): Kern {
    return {
        type: 'Kern',
        amount: amount,
    }
}

const hlistHeight = (hlist: HList) => Math.max(...hlist.map(height))
const hlistDepth = (hlist: HList) => Math.max(...hlist.map(depth))

export function makeHBox(content: HList, shift: number = 0): HBox {
    return {
        type: 'Box',
        kind: 'HBox',
        height: hlistHeight(content),
        depth: hlistDepth(content),
        content: content,
        shift: shift,
    }
}

export function vsize(node: Node) {
    switch (node.type) {
        case 'Char': return height(node) + depth(node)
        case 'Box': return height(node) + depth(node)
        case 'Rule': return height(node) + depth(node)
        case 'Glue': return node.size
        case 'Kern': return node.amount
        default: return 0
    }
}

export function sum(values: number[]) {
    return values.reduce((res, val) => res + val, 0)
}

export function vlistSize(vlist: VList) {
    return sum(vlist.map(vsize))
}

export function makeVBox(node: Node, upList: VList, dnList: VList, shift: number = 0): VBox {
    return {
        type: 'Box',
        kind: 'VBox',
        content: [...upList, node, ...dnList],
        height: height(node) + vlistSize(upList),
        depth: depth(node) + vlistSize(dnList),
        shift: shift,
    }
}

export function makeRule(height: number | '*', depth: number | '*', width: number | '*'): Rule {
    return {
        type: 'Rule',
        height: height,
        depth: depth,
        width: width,
    }
}

export function makeGlue(
    size: number,
    stretch: GlueMeasurement = [0, 0, 0, 0],
    shrink: GlueMeasurement = [0, 0, 0, 0]
): Glue {
    return {
        type: 'Glue',
        size,
        stretch,
        shrink
    }
}

export const hfil = (value: number = 1): GlueMeasurement => [0, value, 0, 0]
export const hfill = (value: number = 1): GlueMeasurement => [0, 0, value, 0]
export const hfilll = (value: number = 1): GlueMeasurement => [0, 0, 0, value]
