module.exports = {
  printWidth: 150, // 单行长度
  //   tabWidth: 2, // 缩进长度
  useTabs: false, // 使用空格代替tab缩进
  semi: true, // 语句末尾使用分号
  vueIndentScriptAndStyle: true,
  singleQuote: false, // 使用单引号
  quoteProps: "as-needed", // 仅在必需时为对象的key添加引号
  bracketSpacing: true, // 在对象前后添加空格
  trailingComma: "es5",
  jsxBracketSameLine: false, // 多属性html标签的‘>’折行放置
  jsxSingleQuote: false, // jsx中使用单引号
  arrowParens: "always", // 单参数箭头函数参数周围使用圆括号
  insertPragma: false, //在已被prettier格式化的文件顶部加上标注
  requirePragma: false,
  proseWrap: "never",
  htmlWhitespaceSensitivity: "strict",
  endOfLine: "auto", // 结束行形式
  rangeStart: 0,
};
