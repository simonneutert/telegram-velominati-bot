require("dotenv").config();

const Velominati = require("velominati-js");
const TeleBot = require("telebot");

// bot settings
const devKey = process.env.BOT_DEV_KEY;
const prodKey = process.env.BOT_PROD_KEY;
// set which key to use
const bot = new TeleBot(prodKey);
// velominati rules
const velominati = new Velominati();
const rules = velominati.rules;

// functions

const findInRules = function (rule, regexp) {
  return (
    rule.title.toLowerCase().match(regexp) ||
    rule.text.toLowerCase().match(regexp)
  );
};

const formattedRuleReply = function (rule) {
  return `Rule ${rule.index}\n\n${rule.title}\n\n${rule.text}\n\nsource: ${rule.source}`;
};

const ruleInRange = function (ruleId) {
  return ruleId && ruleId <= 95 && ruleId > 0;
};

const sendMatchingRules = function (ctx, matchingRules) {
  for (const idx of matchingRules) {
    bot.sendMessage(
      ctx.chat.id,
      formattedRuleReply(velominati.rule(idx)),
      {
        disable_web_page_preview: true,
        parse_mode: "MarkdownV2",
      },
    );
  }
};

// bot code

bot.on(["/start", "/help"], (msg) => {
  const welcomeText = `
Welcome!\n
You can find a rule by id:\n
/rule 5\n
(send a number between 1 and 95)\n
\n
Or use the search: \n
/rule_search socks
\n
    `;
  msg.reply.text(welcomeText);
});

const velominatiRulesRegexp = new RegExp("^\/rule (\\d+)$", "gi");
bot.on(velominatiRulesRegexp, (ctx) => {
  let ruleIdMatch = ctx.text.match(/\d{1,2}$/);
  if (ruleInRange(ruleIdMatch)) {
    const ruleNumber = ruleIdMatch[0];
    const rule_object = velominati.rule(ruleNumber);

    bot.sendMessage(
      ctx.chat.id,
      formattedRuleReply(rule_object),
      {
        disable_web_page_preview: true,
        parse_mode: "MarkdownV2",
      },
    );
  }
});

bot.on(/^\/rule[_-]search (.+)$/, (ctx, props) => {
  const text = props.match[1];
  if (text.length <= 20) {
    const search_regexp = new RegExp(`${text}`, "gi");
    const matchingRules = [];
    for (const k in rules) {
      if (rules.hasOwnProperty(k)) {
        const rule = rules[k];
        if (findInRules(rule, search_regexp)) {
          matchingRules.push(k);
        }
      }
    }
    sendMatchingRules(ctx, matchingRules);
  }
});

// run!

bot.start();
