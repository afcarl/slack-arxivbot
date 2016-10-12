var Botkit = require('botkit')
var fs = require('fs')
var format = require('util').format
var arxivApi = require('./arxiv-api')

// Ideally this could be done with a group around the ID in the URL, but I 
// needed to get all unique links in a message, and this way was easier.
var ARXIV_ID   = /\d{4}\.\d{4,5}/;
var ARXIV_LINK = /(?:https?:\/\/)?arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:.pdf)?/g;

var controller = Botkit.slackbot({debug: false})

// Load Slack token from file (required)
if (!process.env.slack_token_path) {
  console.log('Error: Specify slack_token_path in environment')
  process.exit(1)
}

fs.readFile(process.env.slack_token_path, function (err, data) {
  if (err) {
    console.log('Error: Specify token in slack_token_path file')
    process.exit(1)
  }
  data = String(data)
  data = data.replace(/\s/g, '')
  controller
    .spawn({token: data})
    .startRTM(function (err) {
      if (err) {
        throw new Error(err)
      }
    })
})


var formatArxivAsAttachment = function (arxivData, callback) {
  var attachment = {
    author_name: arxivData.authors.slice(0, 3).join(', '),
    title      : '[' + arxivData.id + '] ' + arxivData.title,
    title_link : arxivData.url,
    text       : arxivData.summary.split(' ').slice(0, 30).join(' ') + ' ...'
  };

  if (arxivData.authors.length > 3) {
    attachment.author_name += ' and others';
  }

  callback(null, attachment);
}


var summarizeArxiv = function (arxivId, callback) {
  arxivApi.fetchArxiv(arxivId, function (err, arxivData) {
    if (err) {
      callback(err)
    }
    else {
      formatArxivAsAttachment(arxivData, callback)
    }
  })
}


// Listen for any messages containing an ArXiv link
controller.hears(
    [ARXIV_LINK],
    ['ambient', 'mention', 'direct mention', 'direct message'],
    function (bot, message) {
      message.match.forEach(function (link) {
        var arxivId = link.match(ARXIV_ID)[0]

        summarizeArxiv(arxivId, function (err, attachment) {
          if (err) {
            console.log(format('ERROR: using "%s" from URL "%s": %s', arxivId, link, err))
          }
          else {
            bot.reply(message, {attachments: [attachment]})
          }
        })
      })
    }
)

