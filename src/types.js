// @flow

export type Node = HBox | VBox | Char | Rule | Kern | Glue | Penalty | Special;

export type Box = {
    type: 'Box',
    width?: number,  // if undefined, contents of box define its width
    height: number,
    depth: number,
    content: Node[],
    shift: number,
}

export type HBox = Box & { kind: 'HBox' }
export type VBox = Box & { kind: 'VBox' }

export type FontId = string

export type Char = {
    type: 'Char',
    font: FontId,
    char: string,
}

export type Rule = {
    type: 'Rule',
    width?: number, // if undefined occupies the width of the containing box
    height: number,
    depth: number,
}

export type Kern = {
    type: 'Kern',
    amount: number,
}

export type Glue = {
    type: 'Glue',
    size: number,
    stretch: number,
    shrink: number,
}

export type Penalty = {
    type: 'Penalty',
    potential: number,
    adequacy: number,
}

export type Special = {
    type: 'Special',
    width?: number,
    height: number,
    depth: number,
}

export type HList = Node[];
export type VList = Node[];
