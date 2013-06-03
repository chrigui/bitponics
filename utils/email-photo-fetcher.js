var Imap = require('imap'),
		mailparser = require('mailparser'),
		async = require('async'),
		fs = require('fs'),
		imapConfig = {
      user: 'amit@bitponics.com',
      password: 'uqdphxsvzvlfoigz',
      host: 'imap.gmail.com',
      port: 993,
      secure: true
    },
		imap = new Imap(imapConfig),
    PhotoModel = require('../models/photo').model,
    tmpDirectory = __dirname + '/../tmp/';


module.exports = {
	processUnreadEmails : function(callback){
		imap.connect(function(err) {
		  if (err) { return callback(err); }

		  return imap.openBox("INBOX", false, function(err, box) {
		    if (err) { return callback(err); }

		    console.log(box.messages.total + " messages in INBOX for " + imapConfig.user);
		    
		    return imap.search(["UNSEEN", ["FROM", imapConfig.user], ["X-GM-RAW", "has:attachment"]], function(err, results) {
		      if (err) { return callback(err); }

		      console.log("Matching message count: ", results.length);

		      if (!results.length) {
		        imap.logout();
		        return callback();
		      }
				

					async.mapSeries(
						results,	
						function resultIterator(result, iteratorCallback){
							imap.fetch(
								result, 
								{
				        	struct : true,
				        	size : true
				        },
				        {
				          body: true,
				          headers: { parse : false },
				        	cb : function fetchCallback(fetch){
					        	fetch.on("message", function(message) {
							        var parser = new mailparser.MailParser({
							        	streamAttachments : false
							        });

							        
							        message.on('headers', function(headers) {
					              parser.write(headers.toString());
					            });

							        message.on("data", function(data) {
							          parser.write(data.toString());
							        });
							        
							        
							        message.on("end", function() {
							          parser.end();
							        });


							        parser.on("end", function(parsedEmail){
							        	console.log("Parsed email headers", parsedEmail.headers);
							        	console.log("Parsed attachments", parsedEmail.attachments);

							        	
							        	async.map(
							        		parsedEmail.attachments,
							        		function attachmentIterator(attachment, attachmentIteratorCallback){
							        			var filePath = tmpDirectory + (new Date()).toString() + attachment.generatedFileName;
							        			fs.writeFile(filePath, attachment.content, function(err) {
													    if (err) { return attachmentIteratorCallback(err); }
												      
															PhotoModel.createAndStorePhoto(
																{
																	owner : "506de30a8eebf7524342cb6c",// Amit //"51ac0117a3b04db08057e04a", // HRJC Anderson
																	originalFileName : attachment.generatedFileName,
																	name : attachment.generatedFileName,
																	contentType : attachment.contentType,
																	date : parsedEmail.headers.date,
																	size : attachment.length,
																	visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
																	streamPath : filePath
																},
																function(err, photo){
																	
																	console.log("attachmentIteratorCallback", err, photo);
																	return attachmentIteratorCallback(err, photo);
																}
															);													        
														}); 

							        		},
							        		function attachmentLoopEnd(err, photos){
							        			console.log("PHOTO LOOP END", photos);
							        			return iteratorCallback(err, photos);
							        		}
						        		);
							        	/*
												[ { contentType: 'image/jpeg',
												    fileName: 'bitponics-device-ipad2.jpg',
												    contentDisposition: 'attachment',
												    transferEncoding: 'base64',
												    generatedFileName: 'bitponics-device-ipad2.jpg',
												    contentId: 'd49d7b8409575edef1831bcf81bcf122@mailparser',
												    stream: { writable: true, checksum: {}, length: 392883, current: '' },
												    checksum: 'b9397916932d56fe50a0c115a478b56b',
												    length: 392883 } ]

							        	*/
							        });
							      });
					        }
					      },
					      function fetchingComplete(err){
					      	console.log("A fetch complete was called, ", err);
					      }
				      );
						},
						function resultLoopEnd(err, photos){
							imap.logout();
							console.log("Callback", err, photos);
							return callback(err, photos);
						}
					);
		  	});
			});
		});
	}
};
