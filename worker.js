var cronJob = require('cron').CronJob;
new cronJob('* * * * * *', function(){
    console.log('You will see this message every second');
}, null, true, "America/New_York");