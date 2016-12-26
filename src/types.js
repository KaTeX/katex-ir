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

export type Style = 'D' | 'T' | 'S' | 'SS'

export type Char = {
    type: 'Char',
    font: FontId,
    char: string,
}

// TODO(kevinb) add units to the dimensions
export type Rule = {
    type: 'Rule',
    height: number | '*',
    depth: number | '*',
    width: number | '*',
}

export type Kern = {
    type: 'Kern',
    amount: number,
}

export type GlueMeasurement = [number, number, number, number]

export type Glue = {
    type: 'Glue',
    size: number,
    stretch: GlueMeasurement,
    shrink: GlueMeasurement,
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
