


module.exports = {
	processUnreadEmails : function(PhotoModel, callback){



		var Imap = require('imap'),
		mailparser = require('mailparser'),
		async = require('async'),
		fs = require('fs'),
		requirejs = require('../lib/requirejs-wrapper'),
		feBeUtils = requirejs('fe-be-utils'),
		imapConfig = {
      user: 'accounts@bitponics.com',
      password: 'owmkufcopausbiil',
      host: 'imap.gmail.com',
      port: 993,
      secure: true
    },
		imap = new Imap(imapConfig),
    //PhotoModel = require('../models/photo').model,
    tmpDirectory = __dirname + '/../tmp/',
    allowedSenders = ["amit@bitponics.com", "michael@bitponics.com", "jack@bitponics.com", "accounts@bitponics.com"];




		imap.connect(function(err) {
		  if (err) { return callback(err); }

		  return imap.openBox("INBOX", false, function(err, box) {
		    if (err) { return callback(err); }

		    console.log(box.messages.total + " messages in INBOX for " + imapConfig.user);
		    
		    return imap.search(["UNSEEN", ["X-GM-RAW", "to:accounts+photo.upload@bitponics.com has:attachment"]], function(err, results) {
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
									markSeen : true
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
							        	console.log("Parsed email", parsedEmail);
							        	
							        	var isAllowedSender = parsedEmail.from.some(function(from){
							        		return (allowedSenders.indexOf(from.address) !== -1)
							        	});

							        	if (!isAllowedSender){
							        		console.log("UNALLOWED SENDER ", parsedEmail.from);
							        		return iteratorCallback();
							        	}

							        	var subjectParts = parsedEmail.subject.split(","),
							        			ownerId = subjectParts[0],
							        			gpiId = subjectParts[1];


							        	if (!feBeUtils.canParseAsObjectId(ownerId)){
													console.log("MISSING OWNER ID IN SUBJECT", parsedEmail.subject);
							        		return iteratorCallback();
												}

							        	async.map(
							        		parsedEmail.attachments,
							        		function attachmentIterator(attachment, attachmentIteratorCallback){
							        			if (attachment.contentType.indexOf("image") !== 0){
							        				return attachmentIteratorCallback();
							        			}

							        			var filePath = tmpDirectory + (new Date()).toString() + attachment.generatedFileName;
							        			
							        			fs.writeFile(filePath, attachment.content, function(err) {
													    if (err) { return attachmentIteratorCallback(err); }
												      
															PhotoModel.createAndStorePhoto(
																{
																	owner : ownerId,//"506de30a8eebf7524342cb6c",// Amit //"51ac0117a3b04db08057e04a", // HRJC Anderson
																	originalFileName : attachment.generatedFileName,
																	name : attachment.generatedFileName,
																	contentType : attachment.contentType,
																	date : parsedEmail.headers.date,
																	size : attachment.length,
																	visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
																	streamPath : filePath,
																	gpi : gpiId
																},
																function(err, photo){
																	return attachmentIteratorCallback(err, photo);
																}
															);													        
														}); 

							        		},
							        		function attachmentLoopEnd(err, photos){
							        			console.log("PHOTO LOOP END", err, photos);
							        			return iteratorCallback(err, photos);
							        		}
						        		);
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
							return callback(err, photos);
						}
					);
		  	});
			});
		});
	}
};
