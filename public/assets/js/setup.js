$(function(){
	var deviceUrl = 'http://169.254.1.1',
		devicePostFormat = 'SSID={{SSID}}\nPASS={{PASS}}\nMODE={{MODE}}\nSKEY={{SKEY}}\nPKEY={{PKEY}}',
		$connectToDevice = $('#connect-to-device'),
		$wifiForm = $('#wifi-form'),
		$wifiSsid = $('#wifi-ssid'),
		$wifiManualSsid = $('#wifi-manual-ssid'),
		$wifiManualSecurityMode = $('#wifi-manual-security-mode'),
		$wifiPass = $('#wifi-pass'),
		$wifiMode = $('#wifi-mode'),
		$enterWifiData = $('#enter-wifi-data'),
		$wifiDataSubmitted = $('#wifi-data-submitted'),
		$submitDeviceInfo = $('#submit-device-info'),
		$pairingComplete = $('#pairing-complete'),
		dataToPostAfterSuccess = {
			deviceMacAddress : '',
			publicDeviceKey : bpn.currentUser.publicDeviceKey
		};
		scannedWifiNetworks = [],
		/**
		 * Format for wifi network objects:
		 * { ssid : string, securityMode : string }
		 */
		selectedWifiNetwork = {},
		connectToDeviceRetryTimer = 60000,

		securityModeOptions = {
			'WPA' : 'WPA_MODE',
			'WEP' : 'WEP_MODE',
			'NONE' : 'NONE'
		},
		securityModeMap = {
			'00' : securityModeOptions['WPA'],
			'01' : securityModeOptions['WEP'],
			'02' : securityModeOptions['WPA'],
			'03' : securityModeOptions['WPA'],
			'04' : securityModeOptions['WPA'],
			'05' : securityModeOptions['NONE'],
			'06' : securityModeOptions['WPA'],
			'08' : securityModeOptions['WPA']
		};

	// init
	$wifiManualSecurityMode.append('<option value="' + securityModeOptions['WPA'] + '">WPA</option>');	
	$wifiManualSecurityMode.append('<option value="' + securityModeOptions['WEP'] + '">WEP</option>');	
	$wifiManualSecurityMode.append('<option value="' + securityModeOptions['NONE'] + '">None</option>');	

	var postToDevice = function(){
		var postDataStringPlainText = 'SSID=' + selectedWifiNetwork.ssid + '\n' +
			'PASS=' + $wifiPass.val() + '\n' +
			'MODE=' + selectedWifiNetwork.securityMode + '\n' +
			'SKEY=' + bpn.currentUser.privateDeviceKey + '\n' +
			'PKEY=' + bpn.currentUser.publicDeviceKey;

		console.log('Posting to device', postDataStringPlainText);

		console.log('Posting to device', postDataStringPlainText);

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
			contentType : 'application/json; charset=utf-8',
			dataType: 'json',
			data: JSON.stringify(dataToPostAfterSuccess),
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
			return item.ssid === $wifiSsid.val();
		})[0];
		if (!selectedWifiNetwork){
			selectedWifiNetwork = {
				ssid : $wifiManualSsid.val(),
				securityMode : $wifiManualSecurityMode.val()
			}
		}
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
				{ 
          “mac”: “00:06:66:72:11:cf”,
          “networks”:  [ 
            “01,01,5HMV5”,
            “02,03,55378008”
          ]
        }
				*/
				dataToPostAfterSuccess.deviceMacAddress = data.mac.replace(/:/g, '');
				
				$.each(data.networks, function(index, networkString){
					var parts = networkString.split(','),
						ssid = parts[2],
						securityModeKey = parts[1];
					
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