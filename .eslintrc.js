/* eslint-disable */
module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "installedESLint": true,
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-unused-vars": "off",
        "no-console": "off",
        "space-before-function-paren": "off",
        "class-methods-use-this": "off"
    }
};
