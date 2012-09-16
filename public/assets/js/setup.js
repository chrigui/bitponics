$(function(){
	var deviceUrl = 'http://169.254.1.1',
		macAddress = '';


	var postToDevice = function(){
		var samplePostData = {
			MODE: 'WPA_MODE',
			SSID: 'TheWorld',
			PASS: '1234123412',
			PKEY: '16 char string11', // hex values decoded into string
			SKEY: '16 char string22'   
		},
		postDataStringURI = 
			'SSID=' + encodeURIComponent($('#wifi-ssid').val()) + '&' +
			'PASS=' + encodeURIComponent($('#wifi-pass').val()) + '&' +
			'MODE=' + $('#wifi-mode').val() + '&' +
			'SKEY=' + Bitponics.currentUser.privateKey + '&' +
			'PKEY=' + Bitponics.currentUser.publicKey;


		var postDataStringPlain = 'SSID=' + $('#wifi-ssid').val() + '\n' +
			'PASS=' + $('#wifi-pass').val() + '\n' +
			'MODE=' + $('#wifi-mode').val() + '\n' +
			'SKEY=' + Bitponics.currentUser.privateKey + '\n' +
			'PKEY=' + Bitponics.currentUser.publicKey; 

		$.ajax({
			url: deviceUrl,
			type: 'POST',
			contentType : 'text/plain; charset=UTF-8',
			data: postDataStringPlain,
			processData : false,
			success: function(data){
				console.log(data);
			},
			error: function(jqXHR, textStatus, error){
				console.log('error', jqXHR, textStatus, error);
			},
			complete : function(jqXHR, textStatus){
				console.log('complete', jqXHR, textStatus);
			}
		});	
	};

	$('#wifi-form').submit(function(e){
		e.preventDefault();

		postToDevice();
	});

	$('#connect-to-device').click(function(){
		$.ajax({
			url : deviceUrl,
			type: 'GET',
			timeout: 2000,
			success: function(data){
				console.log(data);
				
				macAddress = data.mac;

				$('#enter-wifi-data').show();
				//postToDevice();


			},
			error: function(jqXHR, textStatus, error){
				console.log('error', jqXHR, textStatus, error);
			},
			complete : function(jqXHR, textStatus){
				console.log('complete', jqXHR, textStatus);
			}
		});
	});


});