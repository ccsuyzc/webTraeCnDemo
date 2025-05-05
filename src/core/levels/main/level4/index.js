"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var README_md_raw_1 = require("./README.md?raw");
var createTable_sql_raw_1 = require("./createTable.sql?raw");
exports.default = {
    key: "level4",
    title: "基础语法 - 查询 - 常量和运算",
    initSQL: createTable_sql_raw_1.default,
    content: README_md_raw_1.default,
    defaultSQL: "select * from student",
    answer: "select name, score, score * 2 as double_score from student;",
    hint: "请仔细查看本关给出的示例",
    type: "main",
};
