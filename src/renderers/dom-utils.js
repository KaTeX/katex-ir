// @flow

type AttributeMap = {[key: string]: string | number};

export function setAttributes(elem: Element, attrs: AttributeMap) {
    Object.keys(attrs).forEach((key) => {
        const value = attrs[key]
        elem.setAttribute(key, `${value}`)
    })
}

export function generateStyle(attrs: AttributeMap) {
    return Object.keys(attrs).map((key) => {
        const value = attrs[key]
        if (typeof value === 'string') {
            return `${key}: ${value}`
        } else if (typeof value === 'number') {
            return `${key}: ${value}px`
        }
    }).join(';')
}
