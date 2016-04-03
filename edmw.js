'use strict';

var request = require('request'), cheerio = require('cheerio');

function edmw(cb){
  return new Promise(function(resolve){
    request({
      url:'http://forums.hardwarezone.com.sg/eat-drink-man-woman-16/',
      headers: {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
      }
    },function(err,resp,body){
      let $ = cheerio.load(body);
      let threads = $('tbody#threadbits_forum_16 > tr').map(function(){ 
        let _$ = $(this),
          ret = {
            pages:[]
          };
        
        _$.find('.alt1 a').each(function(){
          let ele = $(this);
          let txt = ele.text(), href = ele.attr('href');
          // pagination links
          if (txt && !txt.match(/[^0-9]/)) {
            ret.pages.push(href);
          }
          if (ele.attr('id') && ele.attr('id').indexOf('thread_title') >= 0) {
            ret.href = href;
            ret.title = txt;
          }
        });
        
        
        let last2 = _$.find('td').map((i,d)=>parseInt($(d).text().replace(/,/g,''))).get().slice(-2);
        ret.replies = last2[0];
        ret.views = last2[1];
        ret.crawltime = Date.now();
        
        return ret;
      }).get();
          
      if (cb) cb(threads);
      let words = wordscores(threads);
      resolve({threads,words});
      
    });
  });
}

function wordscores(threads){
  let map = {}, total = threads.length;
  threads.forEach(function(d){
    let words = d.title.trim().toLowerCase().replace(/\[\]\(\)\/\\-/,' ').replace(/[^a-z0-9 ]/,'').replace(/ {0,2}/,'').split(' ');
    words.forEach(function(w){
      if (w.length <= 3) return;
      map[w] = map[w] || {tf:0,df:{}};
      ++map[w].tf;
      map[w].df[d.title]=map[w].df[d.title]||0;
      ++map[w].df[d.title];
    });
  });
  let arr = [];
  for (let k in map){
    let tf = map[k].tf,
    df = Object.keys(map[k].df).length;
    let docs = map[k].df;
    var max = 0;
    for (let doc in docs){
      let tfidf = docs[doc]*Math.log(total/df);
      max = Math.max(tfidf,max);
    }
    arr.push({
      term:k,
      tf:tf,
      df:df,
      score: max
    });
  }
  arr.sort((a,b)=>b.score-a.score);
  return arr;
}

module.exports = edmw;