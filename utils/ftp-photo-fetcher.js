var parseFtpListItem = function(listResponseItem){
	var regexp   = new RegExp(
    '^([\\-dbclps])' +                // Directory flag [1]
    '([\\-rwxs]{9})\\s+' +            // Permissions [2]
    '(\\d+)\\s+' +                    // Number of items [3]
    '(\\w+)\\s+' +                    // File owner [4]
    '(\\w+)\\s+' +                    // File group [5]
    '(\\d+)\\s+' +                    // File size in bytes [6]
    '(\\w{3}\\s+\\d{1,2}\\s+' +       // 3-char month and 1/2-char day of the month [7]
    '(?:\\d{1,2}:\\d{1,2}|\\d{4}))' + // Time or year (need to check conditions) [+= 7]
    '\\s+(.+)$'                       // File/directory name [8]
  );
 
	var parsedLine = regexp.exec(listResponseItem);
  if(parsedLine === null) {
    return ; // Skip if no match
  } else {
    return {
      type:  parsedLine[1],
      perms: parsedLine[2],
      items: parsedLine[3],
      owner: parsedLine[4],
      group: parsedLine[5],
      size:  parsedLine[6],
      date:  parsedLine[7],
      file:  parsedLine[8],
    };
	}
parseFtpListItem};


module.exports = {
	processNewPhotos : function(PhotoModel, callback){



		var FTPClient = require('jsftp'),
		async = require('async'),
		fs = require('fs'),
		requirejs = require('../lib/requirejs-wrapper'),
		feBeUtils = requirejs('fe-be-utils'),
		ftpConfig = {
      user: 'hyatt@bitponics.host-ed.me',
      password: 'q9YM5P11mY+PW*c',
      host: 'ftp.bitponics.host-ed.me',
      port: 21
    },
    tmpDirectory = __dirname + '/../tmp/',
    fileList,
    createdPhotos = [];
    


		var client = new FTPClient(ftpConfig);
	  

		client.auth(ftpConfig.user, ftpConfig.password, function(err){
			if (err) { return callback(err); }
			
			client.ls('./', function(err, fileList){
				if (err) { return callback(err); }
				
				fileList = (fileList || []).filter(
					function(responseItem){ 
						if (!responseItem) { return false; }
						
						var extension = responseItem.name.split('.');
						extension = extension[extension.length - 1];
						responseItem.contentType = "image/" + extension;
						return (extension === 'jpg' || extension == 'jpeg' || extension == 'png');
					}
				);

				console.log(fileList);
				
				//return callback(null, fileList);




				async.eachSeries(
					fileList,
					function fileIterator(fileMetaData, iteratorCallback){
						client.get("./" + fileMetaData.name, function(err, fileBuffer) {
					    if (err) { return iteratorCallback(err); }

					    console.log("RETRIEVED FILE ", fileMetaData);
					    
					    var localFilePath = tmpDirectory + (new Date()).toString() + fileMetaData.name;
							        			
        			fs.writeFile(localFilePath, fileBuffer, function(err) {
						    if (err) { return iteratorCallback(err); }
					      
								PhotoModel.createAndStorePhoto(
									{
										owner : "506de30a8eebf7524342cb6c",//"506de30a8eebf7524342cb6c",// Amit //"51ac0117a3b04db08057e04a", // HRJC Anderson
										originalFileName : fileMetaData.name,
										name : fileMetaData.name,
										contentType : fileMetaData.contentType,
										date : new Date(fileMetaData.time),
										size : fileMetaData.size,
										visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
										streamPath : localFilePath
									},
									function(err, photo){
										if (photo) { createdPhotos.push(photo); }
										
										client.raw.dele(fileMetaData.name, function(err, data){
											console.log("DELETED FILE ", data);
											return iteratorCallback(err, photo);	
										});
									}
								);
							});

						});
					},
					function fileLoopEnd(err){
						client.raw.quit(function(err, res) {
			        return callback(err, createdPhotos);
			    	});
					}
				);
			});
		});
		

	  /*
	  client.on('ready', function() {
	    client.list(function(err, list) {
	      if (err) { return callback(err); }
	      fileList = list;
	      
	      console.log(list.map(parseFtpListItem));
	      

	      client.end();


	    });
	  });

	  client.on('error', function(err) {
	  	return callback(err);
	  });


	  client.on('end', function() {
	  	return callback(null, fileList);
	  });


		client.connect(ftpConfig);
	*/

	}
};