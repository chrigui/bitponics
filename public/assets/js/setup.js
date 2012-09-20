$(function(){
	var deviceUrl = 'http://169.254.1.1',
		devicePostFormat = 'SSID={{SSID}}\nPASS={{PASS}}\nMODE={{MODE}}\nSKEY={{SKEY}}\nPKEY={{PKEY}}',
		$connectToDevice = $('#connect-to-device'),
		$wifiForm = $('#wifi-form'),
		$wifiSsid = $('#wifi-ssid'),
		$wifiPass = $('#wifi-pass'),
		$wifiMode = $('#wifi-mode');


	var postToDevice = function(){
		var postDataStringPlainText = 'SSID=' + $('#wifi-ssid').val() + '\n' +
			'PASS=' + $('#wifi-pass').val() + '\n' +
			'MODE=' + $('#wifi-mode').val() + '\n' +
			'SKEY=' + Bitponics.currentUser.privateDeviceKey + '\n' +
			'PKEY=' + Bitponics.currentUser.publicDeviceKey; 

		$.ajax({
			url: deviceUrl,
			type: 'POST',
			contentType : 'text/plain; charset=UTF-8',
			data: postDataStringPlainText,
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