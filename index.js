'use strict';

const slack = require('slack'),
  edmw = require('./edmw.js'),
  uid = process.env.SLACK_BOT,
  tag = '<@'+process.env.SLACK_BOT+'>';
 
initBot(process.env.SLACK_BOT_TOKEN);

// create a bot 
function initBot(token){
  let bot = slack.rtm.client();
  let params = {
    icon_emoji:':cat:',
    username:'edmw',
    as_user: true
  };
    
  bot.message(function(msg){
    if (msg.bot_id || msg.user === uid || !msg.text) return;
    console.log(msg);
    listen(/help/gi,msg,'Meow meow to the rescue!\n*available commands:*\n_help_ : @edmw help\n_find_ : @edmw find <search regex>');
    listen(/find/gi,msg,searchEDMW);
  });
  
  bot.listen({token:token});
  
  function listen(re,msg,cb){
    if (msg.text.match(tag) && msg.text.match(re)){
      let text = (typeof cb == 'function')?cb(msg):cb;
      let channel = msg.channel;
      if (typeof text == 'string')
        post(channel,text);
      else
        text.then(function(res){
          post(channel,res);
        });
    }
  }
  
  function post(channel,text){
    slack.chat.postMessage({icon_emoji:':cat:',username:'edmw',as_user:true,token:token,channel:channel,text:text},postCB);
  }
  
  function postCB(err,data){
    console.log(err||data);
  }
  
  function searchEDMW(msg){
    let str = msg.text.split('find').pop().toLowerCase();
    post(msg.channel,'Searching for popular EDMW threads with "'+str+'" ...');
    return edmw().then(function(edmw_res){
      let threads = edmw_res.threads, words = edmw_res.words;
      console.log(threads);
      console.log(words);
      let res = threads.filter(d=>d.title.match(new RegExp(str,'gmi')))
        .map((d,i)=>(i+1)+'. '+d.title+' <http://forums.hardwarezone.com.sg'+d.href+'>');
        
      if (res.length > 0) return res.length+' threads found!\n'+res.join('\n');
      
      return '0 threads found!\n However, the most popular terms are: \n'+words.slice(0,10).map((d,i)=>(i+1)+'. '+d.term).join('\n');
      
    });
  }
  
  return bot;
}