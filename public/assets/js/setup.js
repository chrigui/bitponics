$(function(){
	var deviceUrl = 'http://169.254.1.1',
		macAddress = '';


	var postToDevice = function(){
		var postData = {
			MODE: 'WPA_MODE',
			SSID: 'TheWorld',
			PASS: '1234123412',
			PKEY: '16 char string11', // hex values decoded into string
			SKEY: '16 char string22'   
		},
		postDataString = 
			'SSID=' + $('#wifi-ssid').val() + '&' +
			'PASS=' + $('#wifi-pass').val() + '&' +
			'MODE=' + $('#wifi-mode').val() + '&' +
			'SKEY=' + encodeURIComponent(Bitponics.currentUser.privateKey) + '&' +
			'PKEY=' + encodeURIComponent(Bitponics.currentUser.publicKey);

		$.ajax({
			url: deviceUrl,
			type: 'POST',
			data: postDataString,
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