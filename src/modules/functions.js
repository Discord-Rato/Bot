const { MessageEmbed, Collection } = require("discord.js");
const Discord = require("discord.js");
const config = require("../../config.json");

/**
 * @INFO
 * Exporting all the functions.
 */

module.exports.parseDuration = parseDuration;
module.exports.createBar = createBar;

module.exports.formatDate = formatDate;
module.exports.formatTime = formatTime;

/**
 * @INFO
 * Creating the functions.
 */

function formatDate(date) {
    try {
        return new Intl.DateTimeFormat("en-US").format(date);
    } catch (e) {
        console.log(String(e.stack).bgRed);
        return false;
    }
}

function parseDuration(duration) {
    let remain = duration;
    let days = Math.floor(remain / (1000 * 60 * 60 * 24));
    remain = remain % (1000 * 60 * 60 * 24);

    let hours = Math.floor(remain / (1000 * 60 * 60));
    remain = remain % (1000 * 60 * 60);

    let minutes = Math.floor(remain / (1000 * 60));
    remain = remain % (1000 * 60);

    let seconds = Math.floor(remain / 1000);
    remain = remain % 1000;

    let milliseconds = remain;

    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    };
}

function createBar(total, current, size = 25, line = "▬", slider = "🔷") {
    try {
        if (!total) throw "MISSING MAX TIME";
        if (!current) return `**[${slider}${line.repeat(size - 1)}]**`;
        let bar =
            current > total
                ? [line.repeat((size / 2) * 2), (current / total) * 100]
                : [
                      line
                          .repeat(Math.round((size / 2) * (current / total)))
                          .replace(/.$/, slider) +
                          line.repeat(
                              size - Math.round(size * (current / total)) + 1
                          ),
                      current / total,
                  ];
        if (!String(bar).includes(slider)) {
            return `**[${slider}${line.repeat(size - 1)}]**`;
        } else {
            return `**[${bar[0]}]**`;
        }
    } catch (e) {
        console.log(String(e.stack).bgRed);
    }
}

function formatTime(o, useMilli = false) {
    let parts = [];
    if (o.days) {
        let ret = o.days + " Day";
        if (o.days !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.hours) {
        let ret = o.hours + " Hr";
        if (o.hours !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.minutes) {
        let ret = o.minutes + " Min";
        if (o.minutes !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.seconds) {
        let ret = o.seconds + " Sec";
        if (o.seconds !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (useMilli && o.milliseconds) {
        let ret = o.milliseconds + " ms";
        parts.push(ret);
    }
    if (parts.length === 0) {
        return "instantly";
    } else {
        return parts;
    }
}
