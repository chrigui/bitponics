$(function(){
	var deviceUrl = 'http://169.254.1.1',
		devicePostFormat = 'SSID={{SSID}}\nPASS={{PASS}}\nMODE={{MODE}}\nSKEY={{SKEY}}\nPKEY={{PKEY}}',
		$connectToDevice = $('#connect-to-device'),
		$wifiForm = $('#wifi-form'),
		$wifiSsid = $('#wifi-ssid'),
		$wifiSsidText = $('#wifi-ssid-text'),
		$wifiPass = $('#wifi-pass'),
		$wifiMode = $('#wifi-mode'),
		$enterWifiData = $('#enter-wifi-data'),
		$wifiDataSubmitted = $('#wifi-data-submitted'),
		$submitDeviceInfo = $('#submit-device-info'),
		$pairingComplete = $('#pairing-complete'),
		dataToPostAfterSuccess = {
			deviceMacAddress : ''
		};
		scannedWifiNetworks = [],
		selectedWifiNetwork = {},
		connectToDeviceRetryTimer = 60000,

		securityModeOptions = {
			'WPA_MODE' : 'WPA_MODE',
			'WEP_MODE' : 'WEP_MODE',
			'NONE' : 'NONE'
		},
		securityModeMap = {
			'00' : securityModeOptions['WPA_MODE'],
			'01' : securityModeOptions['WEP_MODE'],
			'02' : securityModeOptions['WPA_MODE'],
			'03' : securityModeOptions['WPA_MODE'],
			'04' : securityModeOptions['WPA_MODE'],
			'05' : securityModeOptions['NONE'],
			'06' : securityModeOptions['WPA_MODE'],
			'08' : securityModeOptions['WPA_MODE']
		};


	var postToDevice = function(){
		var postDataStringPlainText = 'SSID=' + selectedWifiNetwork.ssid + '\n' +
			'PASS=' + $wifiPass.val() + '\n' +
			'MODE=' + selectedWifiNetwork.securityMode + '\n' +
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
				$('.selectedNetworkSsid').text(selectedWifiNetwork.ssid);
				$wifiDataSubmitted.show();
			},
			error: function(jqXHR, textStatus, error){
				console.log('error', jqXHR, textStatus, error);
				// TODO retry a certain number of times
			},
			complete: function(jqXHR, textStatus){
				console.log('complete ', textStatus);
				console.log(jqXHR);
			}
		});	
	};

	$submitDeviceInfo.click(function(e){
		e.preventDefault();
		// TODO : show spinner
		$.ajax({
			url: '/setup',
			type: 'POST',
			data: dataToPostAfterSuccess,
			processData : false,
			success: function(data){
				console.log(data);
				$pairingComplete.show();
			},
			error: function(jqXHR, textStatus, error){
				console.log('error', jqXHR, textStatus, error);
				// TODO retry a certain number of times
			}
		});			
	})

	$wifiForm.submit(function(e){
		e.preventDefault();
		selectedWifiNetwork = $.grep(scannedWifiNetworks, function(item, index){
			return item.ssid === $wifiSsid.val() || $wifiSsidText.val();
		})[0];
		// TODO : validate

		postToDevice();
	});

	$connectToDevice.click(function(){
		$.ajax({
			url : deviceUrl,
			type: 'GET',
			timeout: 2000,
			success: function(data){
				console.log(data);
				// Data will be in the following form:
				/*
				{ “mac”: “00:06:66:72:11:cf”,
				  “networks”:  [ “01,06,-79,01,3104,00,00,00:26:62:96:a8:8e,5HMV5”,
				 	            02,11,-42,03,3104,1c,00,00:1f:90:e6:9e:d2,55378008”
						]
				 }
				*/
				dataToPostAfterSuccess.deviceMacAddress = data.mac.replace(/:/g, '');
				
				$.each(data.networks, function(index, networkString){
					var parts = networkString.split(','),
						ssid = parts[parts.length - 1],
						securityModeKey = parts[3];
					
					scannedWifiNetworks.push({
						ssid : ssid, 
						securityMode : securityModeMap[securityModeKey]
					});
				});

				scannedWifiNetworks.sort(function(a, b){
					return ((a.ssid < b.ssid) ? -1 : 1);
				})
				
				$wifiSsid.append('<option value=""> - Select Wifi Network - </option>');	
				$.each(scannedWifiNetworks, function(index, network){
					$wifiSsid.append('<option value="' + network.ssid + '">' + network.ssid + '</option>');	
				});

				$enterWifiData.show();
			},
			error: function(jqXHR, textStatus, error){
				// TODO retry a certain number of times
				console.log('error', jqXHR, textStatus, error);
			}
		});
	});


});