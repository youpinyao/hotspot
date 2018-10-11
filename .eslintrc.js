module.exports = {
  "extends": "airbnb-base",
  "parser": "babel-eslint",
  "rules": {
    "strict": 0,
    "import/extensions": ["js"],
    "no-console": 0,
    "import/prefer-default-export": 0,
    "object-curly-newline": 0,
    "import/no-unresolved": 0,
    "no-debugger": 0,
  },
  "globals": {
    "window": true,
    "moment": true,
    "$": true,
  },
};
