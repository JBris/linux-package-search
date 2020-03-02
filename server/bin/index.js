#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const linux = require("./linux");
const config = require("../src/config/config").get();
const providers = config.LINUX_SEARCH_PROVIDERS;
const distributions = Object.keys(providers);
const questions = require("./questions").get(distributions);

program
.version('1.0.0')
.description('Linux Package Search application')

program
.command("search")
.alias('s')
.description('Search for a list of packages by name.')
.action(() => prompt(questions)
    .then(answers => linux.search( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("view")
.alias('v')
.description('View details for the specified package.')
.action(() => prompt(questions)
    .then(answers => linux.view( answers.distribution, answers.package, answers.quantity, config ))
);

program.parse(process.argv)