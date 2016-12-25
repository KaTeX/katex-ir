// @flow

import {getMetrics} from './metrics'
import type {Node, Char} from './types'

export function sum(values: number[]): number {
    return values.reduce((res, val) => res + val, 0)
}

export function charWidth(node: Char): number {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[2]
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
    return metrics[0]
}

export function charDepth(node: Char): number {
    const metrics = getMetrics(node.char);
    if (!metrics) {
        throw new Error(`no metrics for ${node.char}`)
    }
    return metrics[1]
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
