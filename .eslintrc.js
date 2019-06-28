module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "mocha": true,
    "node": true
  },
  "extends": ["airbnb-base", "plugin:react/recommended", "prettier", "prettier/react"],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "classes": true,
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "prettier", "react"
  ],
  "rules": {
    "camelcase": "off",
    "class-methods-use-this": "off",
    "import/no-unresolved": "off",
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-underscore-dangle": "off",
    "prettier/prettier": "error",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ]
  }
};
