var braintree = require('braintree'),
	braintreeConfig = {},
	gatewayConfigObjects = {
		local : {
			environment: braintree.Environment.Sandbox,
			merchantId: "rfhtzzp5twzd46md",
			publicKey: "pv6ztvcyhhdhpwj7",
			privateKey: "0a76d8e7bb9af07ab350fc33e87ddfb9"
		},
		development : {
			environment: braintree.Environment.Sandbox,
			merchantId: "rfhtzzp5twzd46md",
			publicKey: "pv6ztvcyhhdhpwj7",
			privateKey: "0a76d8e7bb9af07ab350fc33e87ddfb9"
		},
		staging : {
			environment: braintree.Environment.Sandbox,
			merchantId: "rfhtzzp5twzd46md",
			publicKey: "pv6ztvcyhhdhpwj7",
			privateKey: "0a76d8e7bb9af07ab350fc33e87ddfb9"
		},
		production : {
			environment: braintree.Environment.Production,
			merchantId: "dgvtrzt3cddd4w2n",
			publicKey: "mpps55zqv3sybm64",
			privateKey: "e18fc78fb3de381661447294e6897892"
		},
		worker : {
			environment: braintree.Environment.Sandbox,
			merchantId: "rfhtzzp5twzd46md",
			publicKey: "pv6ztvcyhhdhpwj7",
			privateKey: "0a76d8e7bb9af07ab350fc33e87ddfb9"
		},
		ci : {
			environment: braintree.Environment.Sandbox,
			merchantId: "rfhtzzp5twzd46md",
			publicKey: "pv6ztvcyhhdhpwj7",
			privateKey: "0a76d8e7bb9af07ab350fc33e87ddfb9"
		}
	},
	clientSideConfigKeys = {
		local : 'MIIBCgKCAQEAnzXWEMuSIa/UrQgmyNXOr9UvmInClSNp/9+OFqA/GIkC46w6ltTVbf9Z0tVO1sBFy7OmpUuLIEBd9LwHou+GQpAed59vaLsx5f2Cn75oepf6fU81JSnyHIU0EiSxOfZ2IwQhqaQFH49oMJMLEWGTB0mZ1c8TB1MtO0cicS6uqwM79lLzqBDjcP06/mpr7szd8OyCyq+PWTmuz8tI5OULkKuT1RJjwoz3gLWWppCnyWnOgn99TbaKT0X1phOqcIST60r9Vl0Cax8WP23VRfnjNexo60ghf+A3z8/9FY7n4jCmR8mtDM4hESwUnLd0HCLI/pwkkcAtu/8NYaADld1qIwIDAQAB',
        development : 'MIIBCgKCAQEAnzXWEMuSIa/UrQgmyNXOr9UvmInClSNp/9+OFqA/GIkC46w6ltTVbf9Z0tVO1sBFy7OmpUuLIEBd9LwHou+GQpAed59vaLsx5f2Cn75oepf6fU81JSnyHIU0EiSxOfZ2IwQhqaQFH49oMJMLEWGTB0mZ1c8TB1MtO0cicS6uqwM79lLzqBDjcP06/mpr7szd8OyCyq+PWTmuz8tI5OULkKuT1RJjwoz3gLWWppCnyWnOgn99TbaKT0X1phOqcIST60r9Vl0Cax8WP23VRfnjNexo60ghf+A3z8/9FY7n4jCmR8mtDM4hESwUnLd0HCLI/pwkkcAtu/8NYaADld1qIwIDAQAB',
        staging: 'MIIBCgKCAQEAnzXWEMuSIa/UrQgmyNXOr9UvmInClSNp/9+OFqA/GIkC46w6ltTVbf9Z0tVO1sBFy7OmpUuLIEBd9LwHou+GQpAed59vaLsx5f2Cn75oepf6fU81JSnyHIU0EiSxOfZ2IwQhqaQFH49oMJMLEWGTB0mZ1c8TB1MtO0cicS6uqwM79lLzqBDjcP06/mpr7szd8OyCyq+PWTmuz8tI5OULkKuT1RJjwoz3gLWWppCnyWnOgn99TbaKT0X1phOqcIST60r9Vl0Cax8WP23VRfnjNexo60ghf+A3z8/9FY7n4jCmR8mtDM4hESwUnLd0HCLI/pwkkcAtu/8NYaADld1qIwIDAQAB',
        production : 'MIIBCgKCAQEAsIGZTpEjqiadpyS51p0ZpaPLQnaT8ICYRRGoxSZHd3RbwV/D1g3WVcugqclokvh0EcF0SiGlkERoDMaFhgyF0vSSd/o3yBbsIZHCTK7AhbDV8FbFkBoqa7D9YXdunHNxgLxpCSAqIGOgm83TA3l+dwNj6M1ndV94Wj2aPCuxnwbbeiNFfwYktchpy3AEarFpVoXSQnLxFWQ5/exkm7EI2TfcT8MEX+c3j/HCqg29Xy1rk7Ys9hxtiLKRjoWgRv7O88eqIIkyxGcEt9ZTL0FpE0g+1hROH78fzMEW2khEzWMeoNoHqqQcA/RGOua28/riF95sbX+SRP7X63HVahEGLwIDAQAB',
        worker : 'MIIBCgKCAQEAnzXWEMuSIa/UrQgmyNXOr9UvmInClSNp/9+OFqA/GIkC46w6ltTVbf9Z0tVO1sBFy7OmpUuLIEBd9LwHou+GQpAed59vaLsx5f2Cn75oepf6fU81JSnyHIU0EiSxOfZ2IwQhqaQFH49oMJMLEWGTB0mZ1c8TB1MtO0cicS6uqwM79lLzqBDjcP06/mpr7szd8OyCyq+PWTmuz8tI5OULkKuT1RJjwoz3gLWWppCnyWnOgn99TbaKT0X1phOqcIST60r9Vl0Cax8WP23VRfnjNexo60ghf+A3z8/9FY7n4jCmR8mtDM4hESwUnLd0HCLI/pwkkcAtu/8NYaADld1qIwIDAQAB',
        ci : 'MIIBCgKCAQEAnzXWEMuSIa/UrQgmyNXOr9UvmInClSNp/9+OFqA/GIkC46w6ltTVbf9Z0tVO1sBFy7OmpUuLIEBd9LwHou+GQpAed59vaLsx5f2Cn75oepf6fU81JSnyHIU0EiSxOfZ2IwQhqaQFH49oMJMLEWGTB0mZ1c8TB1MtO0cicS6uqwM79lLzqBDjcP06/mpr7szd8OyCyq+PWTmuz8tI5OULkKuT1RJjwoz3gLWWppCnyWnOgn99TbaKT0X1phOqcIST60r9Vl0Cax8WP23VRfnjNexo60ghf+A3z8/9FY7n4jCmR8mtDM4hESwUnLd0HCLI/pwkkcAtu/8NYaADld1qIwIDAQAB'
	};

module.exports = function(env){
	braintreeConfig = {
		braintreeGatewayConfig : gatewayConfigObjects[env],
		braintreeClientSideKey : clientSideConfigKeys[env]
	};

	return braintreeConfig;
};