// @flow

export function setAttributes(elem: Element, attrs: {[key: string]: number | string}) {
    Object.keys(attrs).forEach((key) => {
        const value = attrs[key]
        elem.setAttribute(key, `${value}`)
    })
    // for (const [key, value] of Object.entries(attrs)) {
    //     elem.setAttribute(key, `${value}`)  // 'value' cannot be coerced to string
    // }
}
