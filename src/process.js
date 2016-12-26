import type {Node, Box, HBox, VBox, Char, VList, HList, Glue} from './types'
import {height, width, vwidth, getMetrics} from './layout/measure-utils'

function _process(layout: HBox | VBox, parentWidth?: number = 0): any {
    const fontSize = 32
    const pen = [0, 0]
    const result = {
        type: 'g',
        children: [],
        pen: [0, 0],
        width: width(layout),
    }

    switch(layout.kind) {
        case 'HBox':
            const naturalWidth2 = width(layout)
            let totalStretch = 0
            let widthDiff = 0
            let stretchIndex = 0

            if (naturalWidth2 < parentWidth) {
                const glues: Glue[] = []
                for (const node: Node of layout.content) {
                    if (node.type === 'Glue') {
                        glues.push(node)
                    }
                }

                // TODO(kevinb) figure out which measurement to use
                // TODO(kevinb) handle negative values for fil, fill, and filll
                let index = 0;
                glues.forEach((glue: Glue) => {
                    glue.stretch.forEach((value, i) => {
                        if (value !== 0) {
                            index = Math.max(index, i)
                        }
                    })
                })

                stretchIndex = index
                widthDiff = parentWidth - naturalWidth2;
                totalStretch = glues.reduce((total, glue) => {
                    return total + glue.stretch[index];
                }, 0);
            } else if (naturalWidth2 > parentWidth) {

            }

            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        const g = _process(node, naturalWidth2)
                        const shift = fontSize * node.shift
                        g.pen = [pen[0], pen[1] - shift]
                        result.children.push(g)
                        pen[0] += fontSize * width(node)
                        break
                    case 'Char':
                        const text = {
                            type: 'text',
                            pen: [...pen],
                            fontFamily: 'Main_Regular',
                            fontSize: fontSize,
                            text: node.char,
                        }
                        result.children.push(text)
                        const [,,w] = getMetrics(node.char)
                        pen[0] += fontSize * w
                        break
                    case 'Kern':
                        pen[0] += fontSize * node.amount
                        break
                    case 'Glue':
                        if (totalStretch !== 0) {
                            pen[0] += fontSize * (node.size + node.stretch[stretchIndex] / totalStretch * widthDiff)
                        } else {
                            pen[0] += fontSize * node.size
                        }
                        break
                }
            }

            break;
        case 'VBox':
            const naturalWidth = vwidth(layout)
            const deferred: any[] = []
            pen[1] = pen[1] - fontSize * layout.height
            // TODO(kevinb) convert this to a flatMap
            for (const node: Node of layout.content) {
                switch (node.type) {
                    case 'Box':
                        pen[1] += fontSize * node.height
                        const g = _process(node, naturalWidth)
                        g.pen = [...pen]
                        result.children.push(g)
                        pen[1] += fontSize * node.depth
                        break
                    case 'Char':
                        const text = {
                            type: 'text',
                            pen: [...pen],
                            fontFamily: 'Main_Regular',
                            fontSize: fontSize,
                            text: node.char,
                        }
                        result.children.push(text)
                        const [height, depth, ] = getMetrics(node.char)
                        pen[1] += fontSize * (height + depth)
                        break
                    case 'Kern':
                        pen[1] += fontSize * node.amount
                        break
                    case 'Rule':
                        if (node.height !== '*' && node.depth !== '*') {
                            pen[1] -= fontSize * node.height
                            const rect = {
                                type: 'rect',
                                pen: [...pen],
                                width: fontSize * naturalWidth,
                                height: fontSize * (node.height + node.depth),
                                fill: 'black',      // TODO(kevinb) update the color
                            }
                            pen[1] += rect.height
                            result.children.push(rect)
                        }
                        break
                    default:
                        console.log(`unhandled node of type: ${node.type}`);
                }
            }
    }

    return result;
}

export default function process(layout: HBox | VBox) {
    const fontSize = 32
    const result = _process(layout)
    result.pen[1] += fontSize * height(layout)
    return result
}
