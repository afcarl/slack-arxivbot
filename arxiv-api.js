'use strict';

var request = require('request');
var parseString = require('xml2js').parseString;

var ARXIV_API_URL = 'http://export.arxiv.org/api/query?search_query=id:';

module.exports.fetchArxiv = function (arxivId, callback) {
  request(ARXIV_API_URL + arxivId, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      callback('ERROR:request:' + err);
    }

    parseApiResponseBody(body, callback);
  });
};

// Return only:
//  - Arxiv ID
//  - URL of abstract page
//  - Paper title
//  - Summary (paper abstract)
//  - Author names
var parseApiResponseBody = function (body, callback) {
  parseString(body, function (err, result) {
    if (err) {
      callback('ERROR:xml2js.parseString:' + err);
    }
    else if (!result.feed.entry) {
      callback('ArXiv entry not found');
    }
    else {
      var entry = result.feed.entry[0];
      var arxiv = {
        id      : entry.id ?
                  entry.id[0].split('/').pop() :
                  '{No ID}',
        url     : entry.id ?
                  entry.id[0] :
                  '{No url}',
        title   : entry.title ?
                  entry.title[0].trim().replace(/\n/g, ' ') :
                  '{No title}',
        summary : entry.summary ?
                  entry.summary[0].trim().replace(/\n/g, ' ') :
                  '{No summary}',
        authors : entry.author ?
                  entry.author.map(function (a) { return a.name[0]; }) :
                  '{No authors}'
      };

      callback(err, arxiv);
    }
  });
};
