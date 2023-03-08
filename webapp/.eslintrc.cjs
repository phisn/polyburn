module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint",
        "unused-imports",
        "simple-import-sort",
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],

        // clean imports
        "unused-imports/no-unused-imports": "error",
        "simple-import-sort/imports": "error",

        // i do not need no react import
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        
        // seems to not work correctly with threejs
        "react/no-unknown-property": "off",
    }
}