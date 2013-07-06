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
    createdPhotos = [],
    gm = require('gm').subClass({ imageMagick: true });
    

		var client = new FTPClient(ftpConfig);
	  

		client.auth(ftpConfig.user, ftpConfig.password, function(err){
			if (err) { return callback(err); }
			
			client.ls('./cam/', function(err, fileList){
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
				
				async.eachSeries(
					fileList,
					function fileIterator(fileMetaData, iteratorCallback){
						client.get("./" + fileMetaData.name, function(err, fileBuffer) {
					    if (err) { return iteratorCallback(err); }

					    console.log("RETRIEVED FILE ", fileMetaData);

					    var localFilePath = tmpDirectory + (new Date()).toString() + fileMetaData.name;
							//fs.writeFile(localFilePath, fileBuffer, function(err) {
client.keepAlive();
							gm(fileBuffer, fileMetaData.name)
					    //.rotate("#fff", 270)
						  .write(localFilePath, function (err) {
						    if (err) { return iteratorCallback(err); }
					      client.keepAlive();
								PhotoModel.createAndStorePhoto(
									{
										owner : "51ac0117a3b04db08057e04a",//"506de30a8eebf7524342cb6c",// Amit //"51ac0117a3b04db08057e04a", // HRJC Anderson
										gpi : "51b4e59dcda057020000000c",
										originalFileName : fileMetaData.name,
										name : fileMetaData.name,
										contentType : fileMetaData.contentType,
										date : new Date(fileMetaData.time),
										size : fileMetaData.size,
										visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
										streamPath : localFilePath
									},
									function(err, photo){
										console.log("IN Photo creation callback");

										if (photo) { createdPhotos.push(photo); }
									
										

										//var newClient = new FTPClient(ftpConfig);
										//newClient.auth(ftpConfig.user, ftpConfig.password, function(err){
											client.raw.dele(fileMetaData.name, function(err, data){
												console.log("DELETED FILE ", data);
												return iteratorCallback(err, photo);	
											});
										//});
										//newClient.keepAlive();
										
										
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
	}
};