module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
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
            "off"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],
        "brace-style": [
            "error",
            "stroustrup", { "allowSingleLine": true }
        ],

        // clean imports
        "unused-imports/no-unused-imports": "error",
        "simple-import-sort/imports": "error",

        // i do not need no react import
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        
        // seems to not work correctly with threejs
        "react/no-unknown-property": "off",
        
        // react three fiber refs as seen here
        // https://docs.pmnd.rs/react-three-fiber/tutorials/typescript
        "@typescript-eslint/no-non-null-assertion": "off",

        // we allow empty interfaces for convenience while prototypeing
        "@typescript-eslint/no-empty-interface": "off",

        "import/no-named-as-default-member": "off",
    }
}