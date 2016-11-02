const path = require('path');

module.exports = {
    entry: path.join(__dirname, "src", "ir.js"),
    output: {
        path: path.join(__dirname, "build"),
        filename: "ir.js",
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: "babel" }
        ]
    }
};
