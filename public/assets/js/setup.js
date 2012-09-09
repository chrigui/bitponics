$(function(){
	var deviceUrl = 'http://169.254.1.1';


	var postToDevice = function(){
		var postData = {
			MODE: 'WPA_MODE',
			SSID: 'TheWorld',
			PASS: '1234123412',
			PKEY: '16 char string11', // hex values decoded into string
			SKEY: '16 char string22'   
		},
		postDataString = 
			'SSID=' + postData.SSID + '&' +
			'PASS=' + postData.PASS + '&' +
			'MODE=' + postData.MODE + '&' +
			'SKEY=' + postData.SKEY + '&' +
			'PKEY=' + postData.PKEY;

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

	$('#connect-to-device').click(function(){
		$.ajax({
			url : deviceUrl,
			type: 'GET',
			timeout: 2000,
			success: function(data){
				console.log(data);
				
				var macAddress = data.mac;

				postToDevice();
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